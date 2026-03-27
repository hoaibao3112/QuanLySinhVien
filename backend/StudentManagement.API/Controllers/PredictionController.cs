using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/predictions"), Authorize]
public class PredictionController : ControllerBase
{
    private readonly PredictionService _svc;
    public PredictionController(PredictionService svc) => _svc = svc;

    /// <summary>Thống kê tổng quan rủi ro học tập</summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
        => Ok(await _svc.GetRiskSummaryAsync());

    /// <summary>Danh sách sinh viên kèm điểm rủi ro</summary>
    [HttpGet("students")]
    public async Task<IActionResult> GetStudents(
        [FromQuery] Guid? classId,
        [FromQuery] Guid? courseId)
        => Ok(await _svc.GetStudentsRiskAsync(classId, courseId));

    /// <summary>Chi tiết rủi ro của 1 sinh viên</summary>
    [HttpGet("students/{id}")]
    public async Task<IActionResult> GetStudent(Guid id)
    {
        var result = await _svc.GetStudentRiskAsync(id);
        return result.Count > 0 ? Ok(result) : NotFound();
    }
}
