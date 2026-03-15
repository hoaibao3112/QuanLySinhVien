using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class LeaveRequestService
{
    public Task<PagedResult<LeaveRequestDto>> GetAllAsync(string? requestType, string? status, Guid? studentId, int page, int pageSize) => Task.FromResult(new PagedResult<LeaveRequestDto>(new(), 0, page, pageSize, 0));
    public Task<LeaveRequestDto?> GetByIdAsync(Guid id) => Task.FromResult<LeaveRequestDto?>(null);
    public Task<LeaveRequestDto> CreateAsync(LeaveRequestCreateDto dto) => Task.FromResult(new LeaveRequestDto(Guid.NewGuid(), dto.StudentId, "", "", dto.RequestType, dto.StartDate, dto.EndDate, dto.Reason, "pending", null, null, null, dto.Documents, dto.Notes, DateTime.UtcNow));
    public Task<LeaveRequestDto?> UpdateAsync(Guid id, LeaveRequestCreateDto dto) => Task.FromResult<LeaveRequestDto?>(null);
    public Task<bool> DeleteAsync(Guid id) => Task.FromResult(false);
    public Task<LeaveRequestDto?> ApproveAsync(Guid id, Guid userId) => Task.FromResult<LeaveRequestDto?>(null);
    public Task<LeaveRequestDto?> RejectAsync(Guid id, Guid userId, string? notes) => Task.FromResult<LeaveRequestDto?>(null);
    public Task<List<LeaveRequestDto>> GetByStudentAsync(Guid studentId) => Task.FromResult(new List<LeaveRequestDto>());
    public Task<List<LeaveRequestDto>> GetPendingAsync() => Task.FromResult(new List<LeaveRequestDto>());
}
