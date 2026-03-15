using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class ScholarshipService
{
    public Task<List<ScholarshipDto>> GetAllAsync(bool? isActive) => Task.FromResult(new List<ScholarshipDto>());
    public Task<ScholarshipDto?> GetByIdAsync(Guid id) => Task.FromResult<ScholarshipDto?>(null);
    public Task<ScholarshipDto> CreateAsync(ScholarshipCreateDto dto) => Task.FromResult(new ScholarshipDto(Guid.NewGuid(), dto.Code, dto.Name, dto.Description, dto.Amount, dto.Type, dto.Requirements, dto.IsActive, DateTime.UtcNow));
    public Task<ScholarshipDto?> UpdateAsync(Guid id, ScholarshipCreateDto dto) => Task.FromResult<ScholarshipDto?>(null);
    public Task<bool> DeleteAsync(Guid id) => Task.FromResult(false);

    public Task<PagedResult<StudentScholarshipDto>> GetStudentScholarshipsAsync(Guid? studentId, string? status, string? academicYear, int? semester, int page, int pageSize) => Task.FromResult(new PagedResult<StudentScholarshipDto>(new(), 0, page, pageSize, 0));
    public Task<StudentScholarshipDto?> GetStudentScholarshipByIdAsync(Guid id) => Task.FromResult<StudentScholarshipDto?>(null);
    public Task<StudentScholarshipDto> ApplyAsync(StudentScholarshipApplyDto dto) => Task.FromResult(new StudentScholarshipDto(Guid.NewGuid(), dto.StudentId, "", "", dto.ScholarshipId, "", dto.AcademicYear, dto.Semester, dto.AmountReceived, null, "pending", dto.Notes, DateTime.UtcNow));
    public Task<StudentScholarshipDto?> UpdateStatusAsync(Guid id, string status, string? notes) => Task.FromResult<StudentScholarshipDto?>(null);
    public Task<StudentScholarshipDto?> DisburseAsync(Guid id) => Task.FromResult<StudentScholarshipDto?>(null);
    public Task<List<StudentDto>> GetEligibleStudentsAsync(Guid scholarshipId) => Task.FromResult(new List<StudentDto>());
    public Task<object> GetStatisticsAsync(string? academicYear) => Task.FromResult<object>(new { });
}
