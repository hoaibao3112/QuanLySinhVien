// Services/PredictionService.cs
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class PredictionService
{
    private readonly AppDbContext _db;

    // Weights for risk score calculation
    private const decimal W_ATTENDANCE   = 0.30m;
    private const decimal W_MIDTERM      = 0.35m;
    private const decimal W_ASSIGNMENT   = 0.20m;
    private const decimal W_DISCIPLINARY = 0.15m;

    public PredictionService(AppDbContext db) => _db = db;

    /// <summary>Get risk summary for the dashboard</summary>
    public async Task<RiskSummaryDto> GetRiskSummaryAsync()
    {
        var risks = await ComputeAllRisksAsync(null, null);

        var totalStudents = risks.Count;
        var lowRisk       = risks.Count(r => r.RiskLevel == "low");
        var mediumRisk    = risks.Count(r => r.RiskLevel == "medium");
        var highRisk      = risks.Count(r => r.RiskLevel == "high");
        var criticalRisk  = risks.Count(r => r.RiskLevel == "critical");

        var topAtRisk = risks
            .Where(r => r.RiskLevel is "high" or "critical")
            .OrderByDescending(r => r.RiskScore)
            .Take(10)
            .ToList();

        return new RiskSummaryDto(
            totalStudents, lowRisk, mediumRisk, highRisk, criticalRisk, topAtRisk);
    }

    /// <summary>Get risk list filtered by class/course</summary>
    public async Task<List<StudentRiskDto>> GetStudentsRiskAsync(Guid? classId, Guid? courseId)
    {
        var risks = await ComputeAllRisksAsync(classId, courseId);
        return risks.OrderByDescending(r => r.RiskScore).ToList();
    }

    /// <summary>Get detailed risk for a single student</summary>
    public async Task<List<StudentRiskDto>> GetStudentRiskAsync(Guid studentId)
    {
        var risks = await ComputeAllRisksAsync(null, null);
        return risks.Where(r => r.StudentId == studentId).ToList();
    }

    // ── Core computation ──────────────────────────────────────────
    private async Task<List<StudentRiskDto>> ComputeAllRisksAsync(Guid? classId, Guid? courseId)
    {
        // 1) Get all grades (with partial data = students who have at least some score)
        var gradesQuery = _db.Grades
            .Include(g => g.Student)
            .Include(g => g.Course)
            .Include(g => g.Class)
            .Where(g => g.Student!.Status == "active")
            .AsQueryable();

        if (classId.HasValue)  gradesQuery = gradesQuery.Where(g => g.ClassId == classId.Value);
        if (courseId.HasValue) gradesQuery = gradesQuery.Where(g => g.CourseId == courseId.Value);

        var grades = await gradesQuery.ToListAsync();

        if (grades.Count == 0) return new List<StudentRiskDto>();

        // 2) Get all attendance records for the students
        var studentIds = grades.Select(g => g.StudentId).Distinct().ToList();

        var attendanceByStudent = await _db.Set<Attendance>()
            .Where(a => studentIds.Contains(a.StudentId))
            .GroupBy(a => a.StudentId)
            .Select(g => new
            {
                StudentId = g.Key,
                Total     = g.Count(),
                Present   = g.Count(a => a.Status == "present"),
                Late      = g.Count(a => a.Status == "late"),
                Absent    = g.Count(a => a.Status == "absent"),
            })
            .ToDictionaryAsync(x => x.StudentId);

        // 3) Get disciplinary actions
        var disciplinaryByStudent = await _db.Set<DisciplinaryAction>()
            .Where(d => studentIds.Contains(d.StudentId) && d.Status == "active")
            .GroupBy(d => d.StudentId)
            .Select(g => new
            {
                StudentId = g.Key,
                Count     = g.Count(),
                HasSevere = g.Any(d => d.ActionType == "suspension" || d.ActionType == "expulsion")
            })
            .ToDictionaryAsync(x => x.StudentId);

        // 4) Compute risk per student-course
        var results = new List<StudentRiskDto>();

        foreach (var grade in grades)
        {
            // Attendance rate
            decimal attendanceRate = 100m;
            if (attendanceByStudent.TryGetValue(grade.StudentId, out var att) && att.Total > 0)
            {
                attendanceRate = (decimal)(att.Present + att.Late) / att.Total * 100m;
            }

            // Scores (use 5.0 as default if null = average)
            var midterm    = grade.MidtermScore    ?? 5.0m;
            var assignment = grade.AssignmentScore ?? 5.0m;

            // Disciplinary penalty (0-100 scale)
            decimal disciplinaryPenalty = 0m;
            if (disciplinaryByStudent.TryGetValue(grade.StudentId, out var disc))
            {
                disciplinaryPenalty = disc.HasSevere ? 80m : Math.Min(disc.Count * 30m, 100m);
            }

            // Calculate risk score (0-100, higher = more risky)
            var riskScore =
                W_ATTENDANCE   * (100m - attendanceRate) +
                W_MIDTERM      * (10m - midterm) * 10m +
                W_ASSIGNMENT   * (10m - assignment) * 10m +
                W_DISCIPLINARY * disciplinaryPenalty;

            riskScore = Math.Clamp(Math.Round(riskScore, 1), 0m, 100m);

            // Predict final score based on existing data
            var predictedFinal = PredictFinalScore(attendanceRate, midterm, assignment, disciplinaryPenalty);

            // Risk level
            var riskLevel = riskScore switch
            {
                <= 30m => "low",
                <= 55m => "medium",
                <= 75m => "high",
                _      => "critical"
            };

            // Build factor explanations
            var factors = new List<RiskFactorDto>();

            if (attendanceRate < 80)
                factors.Add(new RiskFactorDto("attendance",
                    $"Tỷ lệ điểm danh thấp: {attendanceRate:F1}%",
                    attendanceRate < 60 ? "high" : "medium"));

            if (midterm < 5)
                factors.Add(new RiskFactorDto("midterm",
                    $"Điểm giữa kỳ thấp: {midterm:F1}/10",
                    midterm < 3 ? "high" : "medium"));

            if (assignment < 5)
                factors.Add(new RiskFactorDto("assignment",
                    $"Điểm bài tập thấp: {assignment:F1}/10",
                    assignment < 3 ? "high" : "medium"));

            if (disciplinaryPenalty > 0)
                factors.Add(new RiskFactorDto("disciplinary",
                    $"Có {disc?.Count ?? 0} vi phạm kỷ luật",
                    disciplinaryPenalty >= 60 ? "high" : "medium"));

            results.Add(new StudentRiskDto(
                grade.StudentId,
                grade.Student?.StudentCode ?? "",
                grade.Student?.FullName ?? "",
                grade.CourseId,
                grade.Course?.Code ?? "",
                grade.Course?.Name ?? "",
                grade.ClassId,
                grade.Class?.Name ?? "",
                Math.Round(attendanceRate, 1),
                grade.MidtermScore,
                grade.AssignmentScore,
                grade.FinalScore,
                Math.Round(predictedFinal, 1),
                riskScore,
                riskLevel,
                factors
            ));
        }

        return results;
    }

    /// <summary>Predict final score using weighted average of available indicators</summary>
    private static decimal PredictFinalScore(
        decimal attendanceRate, decimal midterm, decimal assignment, decimal disciplinaryPenalty)
    {
        // Base prediction from existing scores
        var basePrediction = midterm * 0.5m + assignment * 0.3m;

        // Attendance factor: high attendance → small positive bonus
        var attendanceFactor = (attendanceRate / 100m) * 2m; // 0-2 bonus

        // Disciplinary factor: penalty → small negative
        var disciplinaryFactor = -(disciplinaryPenalty / 100m) * 1.5m; // 0 to -1.5

        var predicted = basePrediction + attendanceFactor + disciplinaryFactor;
        return Math.Clamp(Math.Round(predicted, 1), 0m, 10m);
    }
}
