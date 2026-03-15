using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/leave-requests")]
[Authorize]
public class LeaveRequestsController : ControllerBase
{
    private readonly LeaveRequestService _svc;
    public LeaveRequestsController(LeaveRequestService svc) => _svc = svc;

    private Guid CurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? requestType = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? studentId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetAllAsync(requestType, status, studentId, page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lr = await _svc.GetByIdAsync(id);
        return lr is null ? NotFound() : Ok(lr);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LeaveRequestCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex)         { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] LeaveRequestCreateDto dto)
    {
        try
        {
            var lr = await _svc.UpdateAsync(id, dto);
            return lr is null ? NotFound() : Ok(lr);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPatch("{id}/approve"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Approve(Guid id)
    {
        try
        {
            var lr = await _svc.ApproveAsync(id, CurrentUserId());
            return lr is null ? NotFound() : Ok(lr);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/reject"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] string? notes = null)
    {
        var lr = await _svc.RejectAsync(id, CurrentUserId(), notes);
        return lr is null ? NotFound() : Ok(lr);
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(Guid studentId)
        => Ok(await _svc.GetByStudentAsync(studentId));

    [HttpGet("pending"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> GetPending()
        => Ok(await _svc.GetPendingAsync());
}
