using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/announcements")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly AnnouncementService _svc;
    public AnnouncementsController(AnnouncementService svc) => _svc = svc;

    private Guid CurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? type = null,
        [FromQuery] string? targetGroup = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetAllAsync(type, targetGroup, page, pageSize));

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
        => Ok(await _svc.GetActiveAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var a = await _svc.GetByIdAsync(id);
        return a is null ? NotFound() : Ok(a);
    }

    [HttpPost, Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Create([FromBody] AnnouncementCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto, CurrentUserId())); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AnnouncementCreateDto dto)
    {
        var a = await _svc.UpdateAsync(id, dto);
        return a is null ? NotFound() : Ok(a);
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPatch("{id}/pin"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> TogglePin(Guid id)
    {
        var a = await _svc.TogglePinAsync(id);
        return a is null ? NotFound() : Ok(a);
    }
}
