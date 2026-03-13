using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto>       CreateAsync(DepartmentCreateDto dto);
    Task<DepartmentDto?>      UpdateAsync(Guid id, DepartmentCreateDto dto);
    Task<bool>                DeleteAsync(Guid id);
}

public class DepartmentService : IDepartmentService
{
    private readonly AppDbContext _db;
    public DepartmentService(AppDbContext db) => _db = db;

    public async Task<List<DepartmentDto>> GetAllAsync()
    {
        var departments = await _db.Departments.ToListAsync();
        var result = new List<DepartmentDto>();

        foreach (var d in departments)
        {
            var studentCount = await _db.Students.CountAsync(s => s.DepartmentId == d.Id);
            var courseCount = await _db.Courses.CountAsync(c => c.DepartmentId == d.Id);
            var classCount = await _db.Classes.CountAsync(c => c.DepartmentId == d.Id);
            
            result.Add(new DepartmentDto(d.Id, d.Code, d.Name, studentCount, courseCount, classCount));
        }

        return result.OrderBy(d => d.Code).ToList();
    }

    public async Task<DepartmentDto> CreateAsync(DepartmentCreateDto dto)
    {
        if (await _db.Departments.AnyAsync(d => d.Code == dto.Code))
            throw new InvalidOperationException($"Mã khoa '{dto.Code}' đã tồn tại.");

        var dept = new Department { Code = dto.Code, Name = dto.Name };
        _db.Departments.Add(dept);
        await _db.SaveChangesAsync();
        return new DepartmentDto(dept.Id, dept.Code, dept.Name, 0, 0, 0);
    }

    public async Task<DepartmentDto?> UpdateAsync(Guid id, DepartmentCreateDto dto)
    {
        var dept = await _db.Departments.FindAsync(id);
        if (dept is null) return null;

        if (await _db.Departments.AnyAsync(d => d.Code == dto.Code && d.Id != id))
            throw new InvalidOperationException($"Mã khoa '{dto.Code}' đã tồn tại.");

        dept.Code = dto.Code;
        dept.Name = dto.Name;
        await _db.SaveChangesAsync();

        var studentCount = await _db.Students.CountAsync(s => s.DepartmentId == id);
        var courseCount  = await _db.Courses.CountAsync(c => c.DepartmentId  == id);
        var classCount   = await _db.Classes.CountAsync(c => c.DepartmentId  == id);
        return new DepartmentDto(dept.Id, dept.Code, dept.Name, studentCount, courseCount, classCount);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var dept = await _db.Departments.FindAsync(id);
        if (dept is null) return false;

        // Không xóa nếu còn sinh viên
        if (await _db.Students.AnyAsync(s => s.DepartmentId == id))
            throw new InvalidOperationException("Không thể xóa khoa còn sinh viên.");

        _db.Departments.Remove(dept);
        await _db.SaveChangesAsync();
        return true;
    }
}
