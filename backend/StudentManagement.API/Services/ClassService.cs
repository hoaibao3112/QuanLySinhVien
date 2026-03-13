using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface IClassService
{
    Task<List<ClassDto>>          GetAllAsync(Guid? departmentId, string? academicYear, int? semester);
    Task<ClassDto?>               GetByIdAsync(Guid id);
    Task<ClassDto>                CreateAsync(ClassCreateDto dto);
    Task<ClassDto?>               UpdateAsync(Guid id, ClassCreateDto dto);
    Task<bool>                    DeleteAsync(Guid id);
    Task<List<ClassCourseDto>>    GetCoursesAsync(Guid classId);
    Task<ClassCourseDto>          AssignCourseAsync(Guid classId, ClassCourseAssignDto dto);
    Task<bool>                    RemoveCourseAsync(Guid classId, Guid courseId);
}

public class ClassService : IClassService
{
    private readonly AppDbContext _db;
    public ClassService(AppDbContext db) => _db = db;

    public async Task<List<ClassDto>> GetAllAsync(Guid? departmentId, string? academicYear, int? semester)
    {
        var q = _db.Classes.Include(c => c.Department).Include(c => c.Students).AsQueryable();
        if (departmentId.HasValue) q = q.Where(c => c.DepartmentId  == departmentId);
        if (!string.IsNullOrWhiteSpace(academicYear)) q = q.Where(c => c.AcademicYear == academicYear);
        if (semester.HasValue)     q = q.Where(c => c.Semester      == semester);

        return await q.OrderBy(c => c.Code)
            .Select(c => new ClassDto(
                c.Id, c.Code, c.Name, c.DepartmentId, c.Department!.Name,
                c.AcademicYear, c.Semester, c.MaxStudents, c.Students.Count))
            .ToListAsync();
    }

    public async Task<ClassDto?> GetByIdAsync(Guid id)
    {
        var c = await _db.Classes.Include(c => c.Department).Include(c => c.Students)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (c is null) return null;
        return new ClassDto(c.Id, c.Code, c.Name, c.DepartmentId, c.Department?.Name,
            c.AcademicYear, c.Semester, c.MaxStudents, c.Students.Count);
    }

    public async Task<ClassDto> CreateAsync(ClassCreateDto dto)
    {
        if (await _db.Classes.AnyAsync(c => c.Code == dto.Code))
            throw new InvalidOperationException($"Mã lớp '{dto.Code}' đã tồn tại.");
        if (dto.Semester is < 1 or > 3)
            throw new ArgumentException("Học kỳ chỉ được là 1, 2 hoặc 3.");

        var cls = new Class
        {
            Code         = dto.Code,
            Name         = dto.Name,
            DepartmentId = dto.DepartmentId,
            AcademicYear = dto.AcademicYear,
            Semester     = dto.Semester,
            MaxStudents  = dto.MaxStudents
        };
        _db.Classes.Add(cls);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(cls.Id) ?? throw new Exception();
    }

    public async Task<ClassDto?> UpdateAsync(Guid id, ClassCreateDto dto)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls is null) return null;

        if (await _db.Classes.AnyAsync(c => c.Code == dto.Code && c.Id != id))
            throw new InvalidOperationException($"Mã lớp '{dto.Code}' đã tồn tại.");

        cls.Code = dto.Code; cls.Name = dto.Name; cls.DepartmentId = dto.DepartmentId;
        cls.AcademicYear = dto.AcademicYear; cls.Semester = dto.Semester;
        cls.MaxStudents = dto.MaxStudents;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var cls = await _db.Classes.FindAsync(id);
        if (cls is null) return false;

        if (await _db.Students.AnyAsync(s => s.ClassId == id))
            throw new InvalidOperationException("Không thể xóa lớp còn sinh viên.");

        _db.Classes.Remove(cls);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ClassCourseDto>> GetCoursesAsync(Guid classId)
    {
        return await _db.ClassCourses
            .Include(cc => cc.Course).ThenInclude(c => c!.Department)
            .Where(cc => cc.ClassId == classId)
            .OrderBy(cc => cc.Course!.Code)
            .Select(cc => new ClassCourseDto(
                cc.Id, cc.CourseId, cc.Course!.Code, cc.Course.Name, cc.Course.Credits,
                cc.TeacherName, cc.Schedule, cc.Room, cc.RegistrationPeriodId))
            .ToListAsync();
    }

    public async Task<ClassCourseDto> AssignCourseAsync(Guid classId, ClassCourseAssignDto dto)
    {
        var exists = await _db.ClassCourses.AnyAsync(cc =>
            cc.ClassId == classId && cc.CourseId == dto.CourseId);
        if (exists)
            throw new InvalidOperationException("Môn học đã được phân công cho lớp này.");

        var cc = new ClassCourse
        {
            ClassId     = classId,
            CourseId    = dto.CourseId,
            TeacherName = dto.TeacherName,
            Schedule    = dto.Schedule,
            Room        = dto.Room
        };
        _db.ClassCourses.Add(cc);
        await _db.SaveChangesAsync();
        await _db.Entry(cc).Reference(x => x.Course).LoadAsync();
        return new ClassCourseDto(cc.Id, cc.CourseId, cc.Course!.Code, cc.Course.Name,
            cc.Course.Credits, cc.TeacherName, cc.Schedule, cc.Room, cc.RegistrationPeriodId);
    }

    public async Task<bool> RemoveCourseAsync(Guid classId, Guid courseId)
    {
        var cc = await _db.ClassCourses
            .FirstOrDefaultAsync(x => x.ClassId == classId && x.CourseId == courseId);
        if (cc is null) return false;

        // Có điểm rồi thì không cho xóa
        var hasGrades = await _db.Grades.AnyAsync(g =>
            g.ClassId == classId && g.CourseId == courseId);
        if (hasGrades)
            throw new InvalidOperationException(
                "Không thể bỏ môn học đã có điểm số. Xóa điểm trước.");

        _db.ClassCourses.Remove(cc);
        await _db.SaveChangesAsync();
        return true;
    }
}
