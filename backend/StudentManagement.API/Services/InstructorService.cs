using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class InstructorService
{
    private readonly AppDbContext _context;

    public InstructorService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<InstructorDto>> GetInstructorsAsync(
        string? search, Guid? departmentId, int page, int pageSize)
    {
        var query = _context.Set<Instructor>()
            .Include(i => i.Department)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i =>
                i.FullName.Contains(search) ||
                i.Code.Contains(search) ||
                (i.Email != null && i.Email.Contains(search)));
        }

        if (departmentId.HasValue)
            query = query.Where(i => i.DepartmentId == departmentId.Value);

        var total = await query.CountAsync();
        var instructors = await query
            .OrderBy(i => i.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var data = instructors.Select(i => new InstructorDto(
            i.Id,
            i.Code,
            i.FullName,
            i.Email,
            i.Phone,
            i.DepartmentId,
            i.Department?.Name,
            i.CreatedAt
        )).ToList();

        return new PagedResult<InstructorDto>(
            data,
            total,
            page,
            pageSize,
            (int)Math.Ceiling(total / (double)pageSize)
        );
    }

    public async Task<InstructorDto?> GetInstructorByIdAsync(Guid id)
    {
        var instructor = await _context.Set<Instructor>()
            .Include(i => i.Department)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instructor == null) return null;

        return new InstructorDto(
            instructor.Id,
            instructor.Code,
            instructor.FullName,
            instructor.Email,
            instructor.Phone,
            instructor.DepartmentId,
            instructor.Department?.Name,
            instructor.CreatedAt
        );
    }

    public async Task<InstructorDto> CreateInstructorAsync(InstructorCreateDto dto)
    {
        // Check if code already exists
        if (await _context.Set<Instructor>().AnyAsync(i => i.Code == dto.Code))
            throw new Exception($"Instructor code '{dto.Code}' already exists");

        // Validate email if provided
        if (!string.IsNullOrEmpty(dto.Email))
        {
            if (await _context.Set<Instructor>().AnyAsync(i => i.Email == dto.Email))
                throw new Exception($"Email '{dto.Email}' is already in use");
        }

        // Validate department if provided
        if (dto.DepartmentId.HasValue)
        {
            var deptExists = await _context.Set<Department>()
                .AnyAsync(d => d.Id == dto.DepartmentId.Value);
            if (!deptExists)
                throw new Exception("Department not found");
        }

        var instructor = new Instructor
        {
            Code = dto.Code,
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            DepartmentId = dto.DepartmentId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Instructor>().Add(instructor);
        await _context.SaveChangesAsync();

        return await GetInstructorByIdAsync(instructor.Id) 
            ?? throw new Exception("Failed to retrieve instructor");
    }

    public async Task<InstructorDto?> UpdateInstructorAsync(Guid id, InstructorCreateDto dto)
    {
        var instructor = await _context.Set<Instructor>().FindAsync(id);
        if (instructor == null) return null;

        // Check if code changed and not duplicate
        if (instructor.Code != dto.Code)
        {
            if (await _context.Set<Instructor>().AnyAsync(i => i.Code == dto.Code && i.Id != id))
                throw new Exception($"Instructor code '{dto.Code}' already exists");
        }

        // Check email if changed
        if (!string.IsNullOrEmpty(dto.Email) && instructor.Email != dto.Email)
        {
            if (await _context.Set<Instructor>().AnyAsync(i => i.Email == dto.Email && i.Id != id))
                throw new Exception($"Email '{dto.Email}' is already in use");
        }

        // Validate department
        if (dto.DepartmentId.HasValue)
        {
            var deptExists = await _context.Set<Department>()
                .AnyAsync(d => d.Id == dto.DepartmentId.Value);
            if (!deptExists)
                throw new Exception("Department not found");
        }

        instructor.Code = dto.Code;
        instructor.FullName = dto.FullName;
        instructor.Email = dto.Email;
        instructor.Phone = dto.Phone;
        instructor.DepartmentId = dto.DepartmentId;

        await _context.SaveChangesAsync();

        return await GetInstructorByIdAsync(id);
    }

    public async Task<bool> DeleteInstructorAsync(Guid id)
    {
        var instructor = await _context.Set<Instructor>().FindAsync(id);
        if (instructor == null) return false;

        // Check if instructor is teaching any courses
        var hasClasses = await _context.Set<ClassCourse>()
            .AnyAsync(cc => cc.Id == id); // Note: Assuming instructor_id is stored in ClassCourse

        if (hasClasses)
            throw new Exception("Cannot delete instructor who is currently teaching courses");

        _context.Set<Instructor>().Remove(instructor);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<object> GetInstructorScheduleAsync(Guid id, string? academicYear, int? semester)
    {
        var instructor = await _context.Set<Instructor>().FindAsync(id);
        if (instructor == null)
            throw new Exception("Instructor not found");

        // TODO: Query class_courses table with instructor_id
        // For now, return placeholder
        return new
        {
            InstructorId = id,
            InstructorName = instructor.FullName,
            AcademicYear = academicYear,
            Semester = semester,
            Classes = new List<object>()
        };
    }

    public async Task<object> GetInstructorClassesAsync(Guid id)
    {
        var instructor = await _context.Set<Instructor>().FindAsync(id);
        if (instructor == null)
            throw new Exception("Instructor not found");

        // TODO: Query class_courses table
        return new
        {
            InstructorId = id,
            InstructorName = instructor.FullName,
            TotalClasses = 0,
            Classes = new List<object>()
        };
    }

    public async Task<object> GetInstructorEvaluationsAsync(Guid id, string? academicYear, int? semester)
    {
        var instructor = await _context.Set<Instructor>().FindAsync(id);
        if (instructor == null)
            throw new Exception("Instructor not found");

        var query = _context.Set<CourseEvaluation>()
            .Where(e => e.InstructorId == id);

        if (!string.IsNullOrEmpty(academicYear))
            query = query.Where(e => e.AcademicYear == academicYear);

        if (semester.HasValue)
            query = query.Where(e => e.Semester == semester.Value);

        var evaluations = await query.ToListAsync();

        var avgContent = evaluations.Any() ? evaluations.Average(e => e.ContentRating ?? 0) : 0;
        var avgTeaching = evaluations.Any() ? evaluations.Average(e => e.TeachingRating ?? 0) : 0;
        var avgMaterial = evaluations.Any() ? evaluations.Average(e => e.MaterialRating ?? 0) : 0;
        var avgOverall = evaluations.Any() ? evaluations.Average(e => e.OverallRating ?? 0) : 0;

        return new
        {
            InstructorId = id,
            InstructorName = instructor.FullName,
            TotalEvaluations = evaluations.Count,
            AverageRatings = new
            {
                Content = Math.Round(avgContent, 2),
                Teaching = Math.Round(avgTeaching, 2),
                Material = Math.Round(avgMaterial, 2),
                Overall = Math.Round(avgOverall, 2)
            },
            Evaluations = evaluations.Select(e => new
            {
                e.Id,
                Course = e.CourseId,
                e.AcademicYear,
                e.Semester,
                e.ContentRating,
                e.TeachingRating,
                e.MaterialRating,
                e.OverallRating,
                e.Comments,
                e.CreatedAt
            }).ToList()
        };
    }
}
