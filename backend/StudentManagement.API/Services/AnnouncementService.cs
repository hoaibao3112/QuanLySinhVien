using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class AnnouncementService
{
    public Task<PagedResult<AnnouncementDto>> GetAllAsync(string? type, string? targetGroup, int page, int pageSize) => Task.FromResult(new PagedResult<AnnouncementDto>(new(), 0, page, pageSize, 0));
    public Task<List<AnnouncementDto>> GetActiveAsync() => Task.FromResult(new List<AnnouncementDto>());
    public Task<AnnouncementDto?> GetByIdAsync(Guid id) => Task.FromResult<AnnouncementDto?>(null);
    public Task<AnnouncementDto> CreateAsync(AnnouncementCreateDto dto, Guid userId) => Task.FromResult(new AnnouncementDto(Guid.NewGuid(), dto.Title, dto.Content, dto.Type, dto.TargetGroup, null, userId, "", DateTime.UtcNow, dto.ExpiresAt, dto.IsPinned, dto.Attachments, DateTime.UtcNow));
    public Task<AnnouncementDto?> UpdateAsync(Guid id, AnnouncementCreateDto dto) => Task.FromResult<AnnouncementDto?>(null);
    public Task<bool> DeleteAsync(Guid id) => Task.FromResult(false);
    public Task<AnnouncementDto?> TogglePinAsync(Guid id) => Task.FromResult<AnnouncementDto?>(null);
}
