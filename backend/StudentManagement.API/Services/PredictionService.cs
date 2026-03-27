// Services/PredictionService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using Microsoft.ML.Data;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

// ── ML.NET Input/Output models ────────────────────────────────
public class StudentFeature
{
    [LoadColumn(0)] public float AttendanceRate   { get; set; }
    [LoadColumn(1)] public float MidtermScore     { get; set; }
    [LoadColumn(2)] public float AssignmentScore  { get; set; }
    [LoadColumn(3)] public float AbsentCount      { get; set; }
    [LoadColumn(4)] public float LateCount        { get; set; }
    [LoadColumn(5)] public float DisciplinaryCount { get; set; }
    [LoadColumn(6)] public float Label            { get; set; } // FinalScore (target)
}

public class ScorePrediction
{
    [ColumnName("Score")] public float PredictedScore { get; set; }
}

public class PredictionService
{
    private readonly AppDbContext _db;
    private readonly MLContext _mlContext;
    private ITransformer? _model;
    private PredictionEngine<StudentFeature, ScorePrediction>? _predEngine;
    private readonly object _lock = new();
    private DateTime _lastTrainedAt = DateTime.MinValue;

    public PredictionService(AppDbContext db)
    {
        _db = db;
        _mlContext = new MLContext(seed: 42);
    }

    // ── Public API ────────────────────────────────────────────────

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

    // ── ML.NET Model Training ─────────────────────────────────────

    /// <summary>Train/retrain ML model from historical grade data</summary>
    private async Task EnsureModelTrainedAsync()
    {
        lock (_lock)
        {
            // Retrain every 30 minutes or on first call
            if (_model != null && (DateTime.UtcNow - _lastTrainedAt).TotalMinutes < 30)
                return;
        }

        // Gather training data: grades where FinalScore exists (completed courses)
        var trainingGrades = await _db.Grades
            .Where(g => g.FinalScore != null && g.MidtermScore != null)
            .ToListAsync();

        var studentIds = trainingGrades.Select(g => g.StudentId).Distinct().ToList();

        // Attendance stats per student
        var attendanceStats = await _db.Set<Attendance>()
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

        // Disciplinary counts per student
        var disciplinaryCounts = await _db.Set<DisciplinaryAction>()
            .Where(d => studentIds.Contains(d.StudentId))
            .GroupBy(d => d.StudentId)
            .Select(g => new { StudentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.StudentId);

        // Build training features
        var features = new List<StudentFeature>();
        foreach (var g in trainingGrades)
        {
            float attendanceRate = 100f;
            float absentCount = 0f, lateCount = 0f;
            if (attendanceStats.TryGetValue(g.StudentId, out var att) && att.Total > 0)
            {
                attendanceRate = (float)(att.Present + att.Late) / att.Total * 100f;
                absentCount    = att.Absent;
                lateCount      = att.Late;
            }

            float discCount = 0f;
            if (disciplinaryCounts.TryGetValue(g.StudentId, out var disc))
                discCount = disc.Count;

            features.Add(new StudentFeature
            {
                AttendanceRate    = attendanceRate,
                MidtermScore      = (float)(g.MidtermScore ?? 5m),
                AssignmentScore   = (float)(g.AssignmentScore ?? 5m),
                AbsentCount       = absentCount,
                LateCount         = lateCount,
                DisciplinaryCount = discCount,
                Label             = (float)(g.FinalScore ?? 5m)
            });
        }

        // Need at least 5 samples for ML training
        if (features.Count < 5)
        {
            // Generate synthetic training data to bootstrap the model
            features.AddRange(GenerateSyntheticData());
        }

        // Train the ML.NET model
        var dataView = _mlContext.Data.LoadFromEnumerable(features);

        var pipeline = _mlContext.Transforms
            .Concatenate("Features",
                nameof(StudentFeature.AttendanceRate),
                nameof(StudentFeature.MidtermScore),
                nameof(StudentFeature.AssignmentScore),
                nameof(StudentFeature.AbsentCount),
                nameof(StudentFeature.LateCount),
                nameof(StudentFeature.DisciplinaryCount))
            .Append(_mlContext.Transforms.NormalizeMinMax("Features"))
            .Append(_mlContext.Regression.Trainers.Sdca(
                labelColumnName: "Label",
                featureColumnName: "Features",
                maximumNumberOfIterations: 100));

        var trainedModel = pipeline.Fit(dataView);

        lock (_lock)
        {
            _model = trainedModel;
            _predEngine = _mlContext.Model.CreatePredictionEngine<StudentFeature, ScorePrediction>(_model);
            _lastTrainedAt = DateTime.UtcNow;
        }

        Console.WriteLine($"✓ ML.NET model trained with {features.Count} samples at {DateTime.UtcNow:HH:mm:ss}");
    }

    /// <summary>Generate synthetic data for bootstrapping when real data is scarce</summary>
    private static List<StudentFeature> GenerateSyntheticData()
    {
        var rng = new Random(42);
        var data = new List<StudentFeature>();

        for (int i = 0; i < 100; i++)
        {
            var attendance = (float)(60 + rng.NextDouble() * 40);   // 60-100%
            var midterm    = (float)(rng.NextDouble() * 10);         // 0-10
            var assignment = (float)(rng.NextDouble() * 10);         // 0-10
            var absent     = (float)(rng.Next(0, 15));
            var late       = (float)(rng.Next(0, 8));
            var disc       = (float)(rng.Next(0, 3));

            // Simulate realistic final score based on features
            var final_ = midterm * 0.4f + assignment * 0.25f
                        + (attendance / 100f) * 2.5f
                        - disc * 0.5f
                        + (float)(rng.NextDouble() * 1.5 - 0.75); // noise
            final_ = Math.Clamp(final_, 0f, 10f);

            data.Add(new StudentFeature
            {
                AttendanceRate    = attendance,
                MidtermScore      = midterm,
                AssignmentScore   = assignment,
                AbsentCount       = absent,
                LateCount         = late,
                DisciplinaryCount = disc,
                Label             = final_
            });
        }

        return data;
    }

    // ── Core Prediction Logic ─────────────────────────────────────

    private async Task<List<StudentRiskDto>> ComputeAllRisksAsync(Guid? classId, Guid? courseId)
    {
        // Ensure ML model is trained
        await EnsureModelTrainedAsync();

        // 1) Get all grades
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

        // 2) Attendance data
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

        // 3) Disciplinary data
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

        // 4) Predict for each student-course using ML.NET
        var results = new List<StudentRiskDto>();

        foreach (var grade in grades)
        {
            float attendanceRate = 100f;
            float absentCount = 0f, lateCount = 0f;
            if (attendanceByStudent.TryGetValue(grade.StudentId, out var att) && att.Total > 0)
            {
                attendanceRate = (float)(att.Present + att.Late) / att.Total * 100f;
                absentCount    = att.Absent;
                lateCount      = att.Late;
            }

            float discCount = 0f;
            bool hasSevere = false;
            if (disciplinaryByStudent.TryGetValue(grade.StudentId, out var disc))
            {
                discCount = disc.Count;
                hasSevere = disc.HasSevere;
            }

            var midterm    = (float)(grade.MidtermScore    ?? 5m);
            var assignment = (float)(grade.AssignmentScore ?? 5m);

            // ★ ML.NET Prediction ★
            float predictedFinal;
            lock (_lock)
            {
                if (_predEngine != null)
                {
                    var input = new StudentFeature
                    {
                        AttendanceRate    = attendanceRate,
                        MidtermScore      = midterm,
                        AssignmentScore   = assignment,
                        AbsentCount       = absentCount,
                        LateCount         = lateCount,
                        DisciplinaryCount = discCount,
                    };
                    predictedFinal = Math.Clamp(_predEngine.Predict(input).PredictedScore, 0f, 10f);
                }
                else
                {
                    // Fallback if model not ready
                    predictedFinal = midterm * 0.5f + assignment * 0.3f + (attendanceRate / 100f) * 2f;
                    predictedFinal = Math.Clamp(predictedFinal, 0f, 10f);
                }
            }

            // Risk score: invert predicted final (low predicted = high risk)
            var riskScore = (decimal)Math.Clamp((10f - predictedFinal) * 10f, 0f, 100f);

            // Attendance penalty boost
            if (attendanceRate < 70) riskScore = Math.Min(riskScore + 15m, 100m);
            // Disciplinary penalty boost
            if (hasSevere) riskScore = Math.Min(riskScore + 20m, 100m);
            else if (discCount > 0) riskScore = Math.Min(riskScore + (decimal)discCount * 5m, 100m);

            riskScore = Math.Round(riskScore, 1);

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

            if (discCount > 0)
                factors.Add(new RiskFactorDto("disciplinary",
                    $"Có {(int)discCount} vi phạm kỷ luật",
                    hasSevere ? "high" : "medium"));

            if (predictedFinal < 5)
                factors.Add(new RiskFactorDto("ml_prediction",
                    $"ML dự đoán điểm cuối kỳ: {predictedFinal:F1}/10 (dưới trung bình)",
                    predictedFinal < 3 ? "high" : "medium"));

            results.Add(new StudentRiskDto(
                grade.StudentId,
                grade.Student?.StudentCode ?? "",
                grade.Student?.FullName ?? "",
                grade.CourseId,
                grade.Course?.Code ?? "",
                grade.Course?.Name ?? "",
                grade.ClassId,
                grade.Class?.Name ?? "",
                Math.Round((decimal)attendanceRate, 1),
                grade.MidtermScore,
                grade.AssignmentScore,
                grade.FinalScore,
                Math.Round((decimal)predictedFinal, 1),
                riskScore,
                riskLevel,
                factors
            ));
        }

        return results;
    }
}
