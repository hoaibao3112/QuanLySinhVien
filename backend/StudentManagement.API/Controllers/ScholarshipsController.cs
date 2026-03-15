using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/scholarships")]
[Authorize]
public class ScholarshipsController : ControllerBase
{
    private readonly ScholarshipService _svc;
    public ScholarshipsController(ScholarshipService svc) => _svc = svc;

    private Guid CurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Scholarship Programs ──────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? isActive = null)
        => Ok(await _svc.GetAllAsync(isActive));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _svc.GetByIdAsync(id);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPost, Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] ScholarshipCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ScholarshipCreateDto dto)
    {
        var s = await _svc.UpdateAsync(id, dto);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/student-scholarships")]
[Authorize]
public class StudentScholarshipsController : ControllerBase
{
    private readonly ScholarshipService _svc;
    public StudentScholarshipsController(ScholarshipService svc) => _svc = svc;

    private Guid CurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? studentId,
        [FromQuery] string? status,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetStudentScholarshipsAsync(studentId, status, academicYear, semester, page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _svc.GetStudentScholarshipByIdAsync(id);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] StudentScholarshipApplyDto dto)
    {
        try { return Ok(await _svc.ApplyAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/approve"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] string? notes = null)
    {
        var s = await _svc.UpdateStatusAsync(id, "approved", notes);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPatch("{id}/reject"), Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] string? notes = null)
    {
        var s = await _svc.UpdateStatusAsync(id, "rejected", notes);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPatch("{id}/disburse"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Disburse(Guid id)
    {
        try
        {
            var s = await _svc.DisburseAsync(id);
            return s is null ? NotFound() : Ok(s);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpGet("eligible")]
    public async Task<IActionResult> GetEligible([FromQuery] Guid scholarshipId)
        => Ok(await _svc.GetEligibleStudentsAsync(scholarshipId));

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] string? academicYear)
        => Ok(await _svc.GetStatisticsAsync(academicYear));
}
