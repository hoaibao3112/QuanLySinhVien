using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/me"), Authorize]
public class MeController : ControllerBase
{
    private readonly IStudentService _studentSvc;
    public MeController(IStudentService studentSvc) => _studentSvc = studentSvc;

    /// <summary>Lấy thông tin sinh viên của user hiện tại</summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        
        var s = await _studentSvc.GetByIdAsync(Guid.Parse(userIdStr));
        return s is null ? NotFound(new { message = "Không tìm thấy hồ sơ sinh viên." }) : Ok(s);
    }

    /// <summary>Cập nhật hồ sơ sinh viên hiện tại</summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] StudentUpdateDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        try
        {
            var s = await _studentSvc.UpdateAsync(Guid.Parse(userIdStr), dto);
            return s is null ? NotFound(new { message = "Không tìm thấy hồ sơ sinh viên." }) : Ok(s);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    /// <summary>Điểm của sinh viên hiện tại</summary>
    [HttpGet("grades")]
    public async Task<IActionResult> GetGrades([FromQuery] string? academicYear = null, [FromQuery] int? semester = null)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        return Ok(await _studentSvc.GetGradesAsync(Guid.Parse(userIdStr), academicYear, semester));
    }

    /// <summary>Thời khóa biểu của sinh viên hiện tại</summary>
    [HttpGet("schedule")]
    public async Task<IActionResult> GetSchedule([FromQuery] string? academicYear = null, [FromQuery] int? semester = null)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        return Ok(await _studentSvc.GetScheduleAsync(Guid.Parse(userIdStr), academicYear, semester));
    }
}
