// Services/StudentService.cs
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface IStudentService
{
    Task<PagedResult<StudentDto>> GetAllAsync(
        int page, int pageSize,
        string? search, Guid? classId, Guid? departmentId, string? status);
    Task<StudentDto?>    GetByIdAsync(Guid id);
    Task<StudentDto>     CreateAsync(StudentCreateDto dto);
    Task<StudentDto?>    UpdateAsync(Guid id, StudentUpdateDto dto);
    Task<bool>           DeleteAsync(Guid id);
    Task<List<GradeDto>>   GetGradesAsync(Guid studentId, string? academicYear, int? semester);
    Task<List<TuitionDto>> GetTuitionsAsync(Guid studentId);
    Task<List<StudentRegistrationDto>> GetScheduleAsync(Guid studentId, string? academicYear = null, int? semester = null);
}

public class StudentService : IStudentService
{
    private readonly AppDbContext _db;
    public StudentService(AppDbContext db) => _db = db;

    public async Task<PagedResult<StudentDto>> GetAllAsync(
        int page, int pageSize,
        string? search, Guid? classId, Guid? departmentId, string? status)
    {
        var q = _db.Students
            .Include(s => s.Class)
            .Include(s => s.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(s =>
                s.FullName.ToLower().Contains(search.ToLower()) ||
                s.StudentCode.ToLower().Contains(search.ToLower()) ||
                (s.Email != null && s.Email.ToLower().Contains(search.ToLower())));

        if (classId.HasValue)      q = q.Where(s => s.ClassId      == classId);
        if (departmentId.HasValue) q = q.Where(s => s.DepartmentId == departmentId);
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(s => s.Status == status);

        var total = await q.CountAsync();

        var items = await q
            .OrderBy(s => s.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<StudentDto>(
            items.Select(ToDto).ToList(),
            total, page, pageSize,
            (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<StudentDto?> GetByIdAsync(Guid id)
    {
        var s = await _db.Students
            .Include(s => s.Class)
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == id);
        return s is null ? null : ToDto(s);
    }

    public async Task<StudentDto> CreateAsync(StudentCreateDto dto)
    {
        // Kiểm tra mã SV trùng
        if (await _db.Students.AnyAsync(s => s.StudentCode == dto.StudentCode))
            throw new InvalidOperationException($"Mã sinh viên '{dto.StudentCode}' đã tồn tại.");

        // Kiểm tra email trùng
        if (dto.Email is not null && await _db.Students.AnyAsync(s => s.Email == dto.Email))
            throw new InvalidOperationException($"Email '{dto.Email}' đã được sử dụng.");

        // Kiểm tra lớp còn chỗ không
        if (dto.ClassId.HasValue)
        {
            var cls = await _db.Classes.Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            if (cls is not null && cls.Students.Count >= cls.MaxStudents)
                throw new InvalidOperationException(
                    $"Lớp '{cls.Name}' đã đủ sĩ số ({cls.MaxStudents} sinh viên).");
        }

        var student = new Student
        {
            StudentCode    = dto.StudentCode,
            FullName       = dto.FullName,
            DateOfBirth    = dto.DateOfBirth,
            Gender         = dto.Gender,
            Email          = dto.Email,
            Phone          = dto.Phone,
            Address        = dto.Address,
            ClassId        = dto.ClassId,
            DepartmentId   = dto.DepartmentId,
            EnrollmentYear = dto.EnrollmentYear,
            Status         = dto.Status
        };

        _db.Students.Add(student);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(student.Id) ?? ToDto(student);
    }

    public async Task<StudentDto?> UpdateAsync(Guid id, StudentUpdateDto dto)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return null;

        // Email trùng người khác?
        if (dto.Email is not null &&
            await _db.Students.AnyAsync(s => s.Email == dto.Email && s.Id != id))
            throw new InvalidOperationException($"Email '{dto.Email}' đã được sử dụng.");

        // Kiểm tra lớp còn chỗ khi đổi lớp
        if (dto.ClassId.HasValue && dto.ClassId != student.ClassId)
        {
            var cls = await _db.Classes.Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            if (cls is not null && cls.Students.Count(s => s.Id != id) >= cls.MaxStudents)
                throw new InvalidOperationException(
                    $"Lớp '{cls.Name}' đã đủ sĩ số ({cls.MaxStudents} sinh viên).");
        }

        student.FullName       = dto.FullName;
        student.DateOfBirth    = dto.DateOfBirth;
        student.Gender         = dto.Gender;
        student.Email          = dto.Email;
        student.Phone          = dto.Phone;
        student.Address        = dto.Address;
        student.ClassId        = dto.ClassId;
        student.DepartmentId   = dto.DepartmentId;
        student.EnrollmentYear = dto.EnrollmentYear;
        if (dto.Status is not null) student.Status = dto.Status;
        student.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var s = await _db.Students.FindAsync(id);
        if (s is null) return false;
        _db.Students.Remove(s);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<GradeDto>> GetGradesAsync(Guid studentId, string? academicYear, int? semester)
    {
        var q = _db.Grades
            .Include(g => g.Student)
            .Include(g => g.Course)
            .Include(g => g.Class)
            .Where(g => g.StudentId == studentId);

        if (!string.IsNullOrWhiteSpace(academicYear)) q = q.Where(g => g.AcademicYear == academicYear);
        if (semester.HasValue) q = q.Where(g => g.Semester == semester);

        return await q.OrderBy(g => g.AcademicYear).ThenBy(g => g.Semester)
            .Select(g => GradeService.ToDto(g)).ToListAsync();
    }

    public async Task<List<TuitionDto>> GetTuitionsAsync(Guid studentId)
    {
        return await _db.Tuitions
            .Include(t => t.Student)
            .Where(t => t.StudentId == studentId)
            .OrderBy(t => t.AcademicYear).ThenBy(t => t.Semester)
            .Select(t => TuitionService.ToDto(t)).ToListAsync();
    }

    public async Task<List<StudentRegistrationDto>> GetScheduleAsync(Guid studentId, string? academicYear = null, int? semester = null)
    {
        var q = _db.StudentRegistrations
            .Include(r => r.Student)
            .Include(r => r.ClassCourse).ThenInclude(cc => cc!.Course)
            .Include(r => r.ClassCourse).ThenInclude(cc => cc!.Class)
            .Where(r => r.StudentId == studentId);

        if (!string.IsNullOrWhiteSpace(academicYear)) q = q.Where(r => r.AcademicYear == academicYear);
        if (semester.HasValue) q = q.Where(r => r.Semester == semester);

        var items = await q.ToListAsync();
        return items.Select(ToRegistrationDto).ToList();
    }

    private static StudentRegistrationDto ToRegistrationDto(StudentRegistration r) => new(
        r.Id,
        r.StudentId,
        r.ClassCourse!.CourseId,
        r.ClassCourse.Course!.Code,
        r.ClassCourse.Course.Name,
        r.ClassCourse.Course.Credits,
        r.ClassCourse.Class!.Code,
        r.ClassCourse.Class.Name,
        r.ClassCourse.TeacherName,
        r.ClassCourse.Schedule,
        r.ClassCourse.Room,
        r.AcademicYear,
        r.Semester,
        r.Status
    );

    public static StudentDto ToDto(Student s) => new(
        s.Id, s.StudentCode, s.FullName, s.DateOfBirth,
        s.Gender, s.Email, s.Phone, s.Address, s.AvatarUrl,
        s.ClassId,      s.Class?.Name,
        s.DepartmentId, s.Department?.Name,
        s.EnrollmentYear, s.Status,
        s.CreatedAt, s.UpdatedAt);
}
