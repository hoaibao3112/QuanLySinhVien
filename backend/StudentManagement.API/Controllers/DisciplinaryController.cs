using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/disciplinary")]
[Authorize]
public class DisciplinaryController : ControllerBase
{
    private readonly DisciplinaryService _svc;
    public DisciplinaryController(DisciplinaryService svc) => _svc = svc;

    private Guid CurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? actionType = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? studentId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetAllAsync(actionType, status, studentId, page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var d = await _svc.GetByIdAsync(id);
        return d is null ? NotFound() : Ok(d);
    }

    [HttpPost, Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Create([FromBody] DisciplinaryActionCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto, CurrentUserId())); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DisciplinaryActionCreateDto dto)
    {
        var d = await _svc.UpdateAsync(id, dto);
        return d is null ? NotFound() : Ok(d);
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpPatch("{id}/complete"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var d = await _svc.CompleteAsync(id);
        return d is null ? NotFound() : Ok(d);
    }

    [HttpGet("student/{studentId}")]
    public async Task<IActionResult> GetByStudent(Guid studentId)
        => Ok(await _svc.GetByStudentAsync(studentId));

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
        => Ok(await _svc.GetActiveAsync());
}
