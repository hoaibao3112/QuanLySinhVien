using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/grades"), Authorize]
public class GradesController : ControllerBase
{
    private readonly IGradeService _svc;
    public GradesController(IGradeService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? academicYear = null,
        [FromQuery] int?    semester     = null,
        [FromQuery] Guid?   classId      = null,
        [FromQuery] Guid?   courseId     = null)
        => Ok(await _svc.GetAllAsync(academicYear, semester, classId, courseId));

    /// <summary>Nhập / cập nhật điểm (upsert)</summary>
    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] GradeUpsertDto dto)
    {
        try { return Ok(await _svc.UpsertAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex)         { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] GradeUpdateDto dto)
    {
        try
        {
            var g = await _svc.UpdateAsync(id, dto);
            return g is null ? NotFound() : Ok(g);
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
