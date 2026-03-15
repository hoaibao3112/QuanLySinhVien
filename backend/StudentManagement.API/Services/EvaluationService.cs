using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class EvaluationService
{
    private readonly AppDbContext _db;
    public EvaluationService(AppDbContext db) => _db = db;

    public async Task<PagedResult<CourseEvaluationDto>> GetAllAsync(
        Guid? studentId, Guid? courseId, string? academicYear, int? semester, int page, int pageSize)
    {
        var q = _db.CourseEvaluations
            .Include(e => e.Student)
            .Include(e => e.Course)
            .Include(e => e.Instructor)
            .Include(e => e.Class)
            .AsQueryable();

        if (studentId.HasValue)                  q = q.Where(e => e.StudentId    == studentId.Value);
        if (courseId.HasValue)                   q = q.Where(e => e.CourseId     == courseId.Value);
        if (!string.IsNullOrEmpty(academicYear)) q = q.Where(e => e.AcademicYear == academicYear);
        if (semester.HasValue)                   q = q.Where(e => e.Semester     == semester.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(e => ToDto(e)).ToListAsync();

        return new PagedResult<CourseEvaluationDto>(items, total, page, pageSize,
            (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<CourseEvaluationDto?> GetByIdAsync(Guid id)
    {
        var e = await _db.CourseEvaluations
            .Include(x => x.Student).Include(x => x.Course)
            .Include(x => x.Instructor).Include(x => x.Class)
            .FirstOrDefaultAsync(x => x.Id == id);
        return e is null ? null : ToDto(e);
    }

    public async Task<CourseEvaluationDto> CreateAsync(CourseEvaluationCreateDto dto)
    {
        var validRating = (int? r) => r is null || (r >= 1 && r <= 5);
        if (!validRating(dto.ContentRating) || !validRating(dto.TeachingRating) ||
            !validRating(dto.MaterialRating) || !validRating(dto.OverallRating))
            throw new ArgumentException("Điểm đánh giá phải từ 1-5.");

        // One per (student, course, semester)
        var exists = await _db.CourseEvaluations.AnyAsync(e =>
            e.StudentId == dto.StudentId && e.CourseId == dto.CourseId &&
            e.AcademicYear == dto.AcademicYear && e.Semester == dto.Semester);
        if (exists)
            throw new InvalidOperationException("Sinh viên đã đánh giá môn học này trong học kỳ.");

        var e = new CourseEvaluation
        {
            StudentId      = dto.StudentId,
            CourseId       = dto.CourseId,
            InstructorId   = dto.InstructorId,
            ClassId        = dto.ClassId,
            AcademicYear   = dto.AcademicYear,
            Semester       = dto.Semester,
            ContentRating  = dto.ContentRating,
            TeachingRating = dto.TeachingRating,
            MaterialRating = dto.MaterialRating,
            OverallRating  = dto.OverallRating,
            Comments       = dto.Comments,
            IsAnonymous    = dto.IsAnonymous
        };
        _db.CourseEvaluations.Add(e);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(e.Id) ?? throw new Exception();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var e = await _db.CourseEvaluations.FindAsync(id);
        if (e is null) return false;
        _db.CourseEvaluations.Remove(e);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<object> GetCourseRatingsAsync(Guid courseId, string? academicYear, int? semester)
    {
        var q = _db.CourseEvaluations.Where(e => e.CourseId == courseId);
        if (!string.IsNullOrEmpty(academicYear)) q = q.Where(e => e.AcademicYear == academicYear);
        if (semester.HasValue) q = q.Where(e => e.Semester == semester.Value);

        var evals = await q.ToListAsync();
        var course = await _db.Courses.FindAsync(courseId);

        return new
        {
            CourseId = courseId, CourseName = course?.Name ?? "",
            TotalEvaluations = evals.Count,
            AverageRatings = new
            {
                Content  = evals.Any() ? Math.Round(evals.Average(e => e.ContentRating  ?? 0), 2) : 0,
                Teaching = evals.Any() ? Math.Round(evals.Average(e => e.TeachingRating ?? 0), 2) : 0,
                Material = evals.Any() ? Math.Round(evals.Average(e => e.MaterialRating ?? 0), 2) : 0,
                Overall  = evals.Any() ? Math.Round(evals.Average(e => e.OverallRating  ?? 0), 2) : 0,
            },
            Comments = evals.Where(e => e.Comments != null)
                .Select(e => new { e.Comments, e.IsAnonymous, e.CreatedAt })
                .ToList()
        };
    }

    public async Task<object> GetInstructorRatingsAsync(Guid instructorId, string? academicYear, int? semester)
    {
        var q = _db.CourseEvaluations.Where(e => e.InstructorId == instructorId);
        if (!string.IsNullOrEmpty(academicYear)) q = q.Where(e => e.AcademicYear == academicYear);
        if (semester.HasValue) q = q.Where(e => e.Semester == semester.Value);

        var evals = await q.ToListAsync();
        var instructor = await _db.Instructors.FindAsync(instructorId);

        return new
        {
            InstructorId = instructorId, InstructorName = instructor?.FullName ?? "",
            TotalEvaluations = evals.Count,
            AverageRatings = new
            {
                Content  = evals.Any() ? Math.Round(evals.Average(e => e.ContentRating  ?? 0), 2) : 0,
                Teaching = evals.Any() ? Math.Round(evals.Average(e => e.TeachingRating ?? 0), 2) : 0,
                Material = evals.Any() ? Math.Round(evals.Average(e => e.MaterialRating ?? 0), 2) : 0,
                Overall  = evals.Any() ? Math.Round(evals.Average(e => e.OverallRating  ?? 0), 2) : 0,
            }
        };
    }

    public async Task<object> GetStatisticsAsync(string? academicYear)
    {
        var q = _db.CourseEvaluations.AsQueryable();
        if (!string.IsNullOrEmpty(academicYear)) q = q.Where(e => e.AcademicYear == academicYear);

        var total = await q.CountAsync();
        var avg = await q.AverageAsync(e => (double?)(e.OverallRating ?? 0)) ?? 0;

        return new { TotalEvaluations = total, AverageOverall = Math.Round(avg, 2), AcademicYear = academicYear };
    }

    private static CourseEvaluationDto ToDto(CourseEvaluation e) => new(
        e.Id,
        e.StudentId, e.Student?.StudentCode ?? "", e.Student?.FullName ?? "",
        e.CourseId, e.Course?.Code ?? "", e.Course?.Name ?? "",
        e.InstructorId, e.Instructor?.FullName,
        e.ClassId, e.Class?.Name ?? "",
        e.AcademicYear, e.Semester,
        e.ContentRating, e.TeachingRating, e.MaterialRating, e.OverallRating,
        e.Comments, e.IsAnonymous, e.CreatedAt);
}
