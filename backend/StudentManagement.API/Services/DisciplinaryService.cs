using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class DisciplinaryService
{
    public Task<PagedResult<DisciplinaryActionDto>> GetAllAsync(string? actionType, string? status, Guid? studentId, int page, int pageSize) => Task.FromResult(new PagedResult<DisciplinaryActionDto>(new(), 0, page, pageSize, 0));
    public Task<DisciplinaryActionDto?> GetByIdAsync(Guid id) => Task.FromResult<DisciplinaryActionDto?>(null);
    public Task<DisciplinaryActionDto> CreateAsync(DisciplinaryActionCreateDto dto, Guid userId) => Task.FromResult(new DisciplinaryActionDto(Guid.NewGuid(), dto.StudentId, "", "", dto.ActionType, dto.Reason, dto.ActionDate, dto.EndDate, "active", userId, "", dto.Notes, DateTime.UtcNow));
    public Task<DisciplinaryActionDto?> UpdateAsync(Guid id, DisciplinaryActionCreateDto dto) => Task.FromResult<DisciplinaryActionDto?>(null);
    public Task<bool> DeleteAsync(Guid id) => Task.FromResult(false);
    public Task<DisciplinaryActionDto?> CompleteAsync(Guid id) => Task.FromResult<DisciplinaryActionDto?>(null);
    public Task<List<DisciplinaryActionDto>> GetByStudentAsync(Guid studentId) => Task.FromResult(new List<DisciplinaryActionDto>());
    public Task<List<DisciplinaryActionDto>> GetActiveAsync() => Task.FromResult(new List<DisciplinaryActionDto>());
}
