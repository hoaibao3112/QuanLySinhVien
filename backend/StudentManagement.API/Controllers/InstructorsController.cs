using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/instructors")]
[Authorize]
public class InstructorsController : ControllerBase
{
    private readonly InstructorService _instructorService;

    public InstructorsController(InstructorService instructorService)
    {
        _instructorService = instructorService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<InstructorDto>>> GetInstructors(
        [FromQuery] string? search,
        [FromQuery] Guid? departmentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _instructorService.GetInstructorsAsync(search, departmentId, page, pageSize);
        return Ok(new ApiResponse<PagedResult<InstructorDto>>(true, result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InstructorDto>> GetInstructor(Guid id)
    {
        var instructor = await _instructorService.GetInstructorByIdAsync(id);
        if (instructor == null)
            return NotFound(new { message = "Instructor not found" });

        return Ok(instructor);
    }

    [HttpPost]
    public async Task<ActionResult<InstructorDto>> CreateInstructor([FromBody] InstructorCreateDto dto)
    {
        try
        {
            var instructor = await _instructorService.CreateInstructorAsync(dto);
            return CreatedAtAction(nameof(GetInstructor), new { id = instructor.Id }, instructor);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InstructorDto>> UpdateInstructor(Guid id, [FromBody] InstructorCreateDto dto)
    {
        try
        {
            var instructor = await _instructorService.UpdateInstructorAsync(id, dto);
            if (instructor == null)
                return NotFound(new { message = "Instructor not found" });

            return Ok(instructor);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInstructor(Guid id)
    {
        var success = await _instructorService.DeleteInstructorAsync(id);
        if (!success)
            return NotFound(new { message = "Instructor not found" });

        return NoContent();
    }

    [HttpGet("{id}/schedule")]
    public async Task<ActionResult> GetInstructorSchedule(
        Guid id,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester)
    {
        var schedule = await _instructorService.GetInstructorScheduleAsync(id, academicYear, semester);
        return Ok(schedule);
    }

    [HttpGet("{id}/classes")]
    public async Task<ActionResult> GetInstructorClasses(Guid id)
    {
        var classes = await _instructorService.GetInstructorClassesAsync(id);
        return Ok(classes);
    }

    [HttpGet("{id}/evaluations")]
    public async Task<ActionResult> GetInstructorEvaluations(
        Guid id,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester)
    {
        var evaluations = await _instructorService.GetInstructorEvaluationsAsync(id, academicYear, semester);
        return Ok(evaluations);
    }
}
