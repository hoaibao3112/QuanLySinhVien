using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/classes"), Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _svc;
    public ClassesController(IClassService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid?   departmentId = null,
        [FromQuery] string? academicYear = null,
        [FromQuery] int?    semester     = null)
        => Ok(await _svc.GetAllAsync(departmentId, academicYear, semester));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var c = await _svc.GetByIdAsync(id);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ClassCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (ArgumentException ex)         { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ClassCreateDto dto)
    {
        try
        {
            var c = await _svc.UpdateAsync(id, dto);
            return c is null ? NotFound() : Ok(c);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { return await _svc.DeleteAsync(id) ? NoContent() : NotFound(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    /// <summary>Danh sách môn học được phân công cho lớp</summary>
    [HttpGet("{id}/courses")]
    public async Task<IActionResult> GetCourses(Guid id)
        => Ok(await _svc.GetCoursesAsync(id));

    /// <summary>Phân công môn học cho lớp</summary>
    [HttpPost("{id}/courses")]
    public async Task<IActionResult> AssignCourse(Guid id, [FromBody] ClassCourseAssignDto dto)
    {
        try { return Ok(await _svc.AssignCourseAsync(id, dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    /// <summary>Gỡ môn học khỏi lớp</summary>
    [HttpDelete("{id}/courses/{courseId}")]
    public async Task<IActionResult> RemoveCourse(Guid id, Guid courseId)
    {
        try { return await _svc.RemoveCourseAsync(id, courseId) ? NoContent() : NotFound(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
