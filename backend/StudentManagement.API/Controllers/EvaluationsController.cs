using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/evaluations")]
[Authorize]
public class EvaluationsController : ControllerBase
{
    private readonly EvaluationService _svc;
    public EvaluationsController(EvaluationService svc) => _svc = svc;

    private Guid CurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? studentId,
        [FromQuery] Guid? courseId,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _svc.GetAllAsync(studentId, courseId, academicYear, semester, page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var e = await _svc.GetByIdAsync(id);
        return e is null ? NotFound() : Ok(e);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CourseEvaluationCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex)         { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpGet("course/{courseId}")]
    public async Task<IActionResult> GetByCourse(Guid courseId,
        [FromQuery] string? academicYear, [FromQuery] int? semester)
        => Ok(await _svc.GetCourseRatingsAsync(courseId, academicYear, semester));

    [HttpGet("instructor/{instructorId}")]
    public async Task<IActionResult> GetByInstructor(Guid instructorId,
        [FromQuery] string? academicYear, [FromQuery] int? semester)
        => Ok(await _svc.GetInstructorRatingsAsync(instructorId, academicYear, semester));

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] string? academicYear)
        => Ok(await _svc.GetStatisticsAsync(academicYear));
}
