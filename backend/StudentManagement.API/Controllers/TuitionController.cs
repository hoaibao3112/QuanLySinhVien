using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/tuition"), Authorize]
public class TuitionController : ControllerBase
{
    private readonly ITuitionService _svc;
    public TuitionController(ITuitionService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status       = null,
        [FromQuery] string? academicYear = null,
        [FromQuery] int?    semester     = null)
        => Ok(await _svc.GetAllAsync(status, academicYear, semester));

    /// <summary>Tạo hóa đơn học phí cho sinh viên</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TuitionCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex)         { return BadRequest(new { message = ex.Message }); }
    }

    /// <summary>Thanh toán học phí (cộng dồn)</summary>
    [HttpPost("{id}/pay")]
    public async Task<IActionResult> Pay(Guid id, [FromBody] TuitionPayDto dto)
    {
        try
        {
            var t = await _svc.PayAsync(id, dto);
            return t is null ? NotFound() : Ok(t);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex)         { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();
}
