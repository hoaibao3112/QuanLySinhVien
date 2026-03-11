// Services/GradeService.cs
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface IGradeService
{
    Task<List<GradeDto>> GetAllAsync(string? academicYear, int? semester, Guid? classId, Guid? courseId);
    Task<GradeDto>       UpsertAsync(GradeUpsertDto dto);
    Task<GradeDto?>      UpdateAsync(Guid id, GradeUpdateDto dto);
    Task<bool>           DeleteAsync(Guid id);
}

public class GradeService : IGradeService
{
    private readonly AppDbContext _db;
    public GradeService(AppDbContext db) => _db = db;

    public async Task<List<GradeDto>> GetAllAsync(
        string? academicYear, int? semester, Guid? classId, Guid? courseId)
    {
        var q = _db.Grades
            .Include(g => g.Student)
            .Include(g => g.Course)
            .Include(g => g.Class)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(academicYear)) q = q.Where(g => g.AcademicYear == academicYear);
        if (semester.HasValue)  q = q.Where(g => g.Semester  == semester);
        if (classId.HasValue)   q = q.Where(g => g.ClassId   == classId);
        if (courseId.HasValue)  q = q.Where(g => g.CourseId  == courseId);

        return await q
            .OrderBy(g => g.Student!.FullName)
            .ThenBy(g => g.Course!.Name)
            .Select(g => ToDto(g))
            .ToListAsync();
    }

    public async Task<GradeDto> UpsertAsync(GradeUpsertDto dto)
    {
        // Sinh viên phải thuộc lớp này (hoặc ít nhất tồn tại)
        var student = await _db.Students.FindAsync(dto.StudentId)
            ?? throw new InvalidOperationException("Sinh viên không tồn tại.");

        var course = await _db.Courses.FindAsync(dto.CourseId)
            ?? throw new InvalidOperationException("Môn học không tồn tại.");

        // Kiểm tra lớp có dạy môn này không
        var classCourse = await _db.ClassCourses
            .FirstOrDefaultAsync(cc => cc.ClassId == dto.ClassId && cc.CourseId == dto.CourseId);
        if (classCourse is null)
            throw new InvalidOperationException(
                "Môn học này không thuộc lớp được chọn. Vui lòng phân công môn học cho lớp trước.");

        // Validate điểm
        ValidateScores(dto.AssignmentScore, dto.MidtermScore, dto.FinalScore);

        var existing = await _db.Grades.FirstOrDefaultAsync(g =>
            g.StudentId    == dto.StudentId &&
            g.CourseId     == dto.CourseId  &&
            g.AcademicYear == dto.AcademicYear &&
            g.Semester     == dto.Semester);

        if (existing is not null)
        {
            existing.AssignmentScore = dto.AssignmentScore;
            existing.MidtermScore    = dto.MidtermScore;
            existing.FinalScore      = dto.FinalScore;
            existing.UpdatedAt       = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            // Reload để lấy GPA computed
            await _db.Entry(existing).ReloadAsync();
            existing.LetterGrade = CalcLetterGrade(existing.Gpa);
            await _db.SaveChangesAsync();
            await _db.Entry(existing).Reference(g => g.Student).LoadAsync();
            await _db.Entry(existing).Reference(g => g.Course).LoadAsync();
            await _db.Entry(existing).Reference(g => g.Class).LoadAsync();
            return ToDto(existing);
        }
        else
        {
            var grade = new Grade
            {
                StudentId       = dto.StudentId,
                CourseId        = dto.CourseId,
                ClassId         = dto.ClassId,
                AssignmentScore = dto.AssignmentScore,
                MidtermScore    = dto.MidtermScore,
                FinalScore      = dto.FinalScore,
                Semester        = dto.Semester,
                AcademicYear    = dto.AcademicYear
            };
            _db.Grades.Add(grade);
            await _db.SaveChangesAsync();
            await _db.Entry(grade).ReloadAsync();
            grade.LetterGrade = CalcLetterGrade(grade.Gpa);
            await _db.SaveChangesAsync();
            await _db.Entry(grade).Reference(g => g.Student).LoadAsync();
            await _db.Entry(grade).Reference(g => g.Course).LoadAsync();
            await _db.Entry(grade).Reference(g => g.Class).LoadAsync();
            return ToDto(grade);
        }
    }

    public async Task<GradeDto?> UpdateAsync(Guid id, GradeUpdateDto dto)
    {
        var grade = await _db.Grades
            .Include(g => g.Student).Include(g => g.Course).Include(g => g.Class)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (grade is null) return null;

        ValidateScores(dto.AssignmentScore, dto.MidtermScore, dto.FinalScore);

        grade.AssignmentScore = dto.AssignmentScore;
        grade.MidtermScore    = dto.MidtermScore;
        grade.FinalScore      = dto.FinalScore;
        grade.UpdatedAt       = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _db.Entry(grade).ReloadAsync();
        grade.LetterGrade = CalcLetterGrade(grade.Gpa);
        await _db.SaveChangesAsync();
        return ToDto(grade);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var g = await _db.Grades.FindAsync(id);
        if (g is null) return false;
        _db.Grades.Remove(g);
        await _db.SaveChangesAsync();
        return true;
    }

    // ── Helpers (public static để StudentService dùng) ────────
    public static string? CalcLetterGrade(decimal? gpa) => gpa switch
    {
        >= 9.0m => "A+",
        >= 8.0m => "A",
        >= 7.0m => "B+",
        >= 6.0m => "B",
        >= 5.0m => "C+",
        >= 4.0m => "C",
        >= 3.0m => "D+",
        >= 2.0m => "D",
        _ => "F"
    };

    private static void ValidateScores(decimal? assignment, decimal? midterm, decimal? final)
    {
        if (assignment is < 0 or > 10) throw new ArgumentException("Điểm bài tập phải từ 0 đến 10.");
        if (midterm    is < 0 or > 10) throw new ArgumentException("Điểm giữa kỳ phải từ 0 đến 10.");
        if (final      is < 0 or > 10) throw new ArgumentException("Điểm cuối kỳ phải từ 0 đến 10.");
    }

    public static GradeDto ToDto(Grade g) => new(
        g.Id,
        g.StudentId, g.Student?.StudentCode ?? "", g.Student?.FullName ?? "",
        g.CourseId,  g.Course?.Code ?? "",         g.Course?.Name ?? "",
        g.ClassId,
        g.AssignmentScore, g.MidtermScore, g.FinalScore,
        g.Gpa, g.LetterGrade,
        g.Semester, g.AcademicYear,
        g.UpdatedAt);
}
