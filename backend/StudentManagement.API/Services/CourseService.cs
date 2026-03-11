using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface ICourseService
{
    Task<List<CourseDto>> GetAllAsync(Guid? departmentId);
    Task<CourseDto>       CreateAsync(CourseCreateDto dto);
    Task<CourseDto?>      UpdateAsync(Guid id, CourseCreateDto dto);
    Task<bool>            DeleteAsync(Guid id);
}

public class CourseService : ICourseService
{
    private readonly AppDbContext _db;
    public CourseService(AppDbContext db) => _db = db;

    public async Task<List<CourseDto>> GetAllAsync(Guid? departmentId)
    {
        var q = _db.Courses.Include(c => c.Department).AsQueryable();
        if (departmentId.HasValue) q = q.Where(c => c.DepartmentId == departmentId);
        return await q.OrderBy(c => c.Code)
            .Select(c => new CourseDto(c.Id, c.Code, c.Name,
                c.DepartmentId, c.Department!.Name, c.Credits, c.Description))
            .ToListAsync();
    }

    public async Task<CourseDto> CreateAsync(CourseCreateDto dto)
    {
        if (await _db.Courses.AnyAsync(c => c.Code == dto.Code))
            throw new InvalidOperationException($"Mã môn học '{dto.Code}' đã tồn tại.");
        if (dto.Credits is < 1 or > 10)
            throw new ArgumentException("Số tín chỉ phải từ 1 đến 10.");

        var course = new Course
        {
            Code = dto.Code, Name = dto.Name, DepartmentId = dto.DepartmentId,
            Credits = dto.Credits, Description = dto.Description
        };
        _db.Courses.Add(course);
        await _db.SaveChangesAsync();
        await _db.Entry(course).Reference(c => c.Department).LoadAsync();
        return new CourseDto(course.Id, course.Code, course.Name,
            course.DepartmentId, course.Department?.Name, course.Credits, course.Description);
    }

    public async Task<CourseDto?> UpdateAsync(Guid id, CourseCreateDto dto)
    {
        var course = await _db.Courses.Include(c => c.Department).FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return null;

        if (await _db.Courses.AnyAsync(c => c.Code == dto.Code && c.Id != id))
            throw new InvalidOperationException($"Mã môn học '{dto.Code}' đã tồn tại.");

        course.Code = dto.Code; course.Name = dto.Name; course.DepartmentId = dto.DepartmentId;
        course.Credits = dto.Credits; course.Description = dto.Description;
        await _db.SaveChangesAsync();

        if (course.Department?.Id != dto.DepartmentId)
            await _db.Entry(course).Reference(c => c.Department).LoadAsync();

        return new CourseDto(course.Id, course.Code, course.Name,
            course.DepartmentId, course.Department?.Name, course.Credits, course.Description);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course is null) return false;

        if (await _db.Grades.AnyAsync(g => g.CourseId == id))
            throw new InvalidOperationException("Không thể xóa môn học đã có điểm số.");
        if (await _db.ClassCourses.AnyAsync(cc => cc.CourseId == id))
            throw new InvalidOperationException("Không thể xóa môn học đã phân công cho lớp. Gỡ khỏi lớp trước.");

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return true;
    }
}
