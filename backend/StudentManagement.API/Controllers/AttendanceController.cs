using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AttendanceService _attendanceService;

    public AttendanceController(AttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>
    /// Get all attendance records with filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<AttendanceDto>>> GetAttendances(
        [FromQuery] Guid? studentId,
        [FromQuery] Guid? classCourseId,
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _attendanceService.GetAttendancesAsync(
            studentId, classCourseId, fromDate, toDate, status, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get attendance by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AttendanceDto>> GetAttendance(Guid id)
    {
        var attendance = await _attendanceService.GetAttendanceByIdAsync(id);
        if (attendance == null)
            return NotFound(new { message = "Attendance record not found" });

        return Ok(attendance);
    }

    /// <summary>
    /// Mark single attendance
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AttendanceDto>> MarkAttendance([FromBody] AttendanceMarkDto dto)
    {
        try
        {
            var attendance = await _attendanceService.MarkAttendanceAsync(dto);
            return CreatedAtAction(nameof(GetAttendance), new { id = attendance.Id }, attendance);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Mark attendance for multiple students (bulk)
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult<List<AttendanceDto>>> MarkBulkAttendance([FromBody] AttendanceBulkDto dto)
    {
        try
        {
            var attendances = await _attendanceService.MarkBulkAttendanceAsync(dto);
            return Ok(new { message = "Attendance marked successfully", data = attendances });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update attendance record
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<AttendanceDto>> UpdateAttendance(Guid id, [FromBody] AttendanceMarkDto dto)
    {
        try
        {
            var attendance = await _attendanceService.UpdateAttendanceAsync(id, dto);
            if (attendance == null)
                return NotFound(new { message = "Attendance record not found" });

            return Ok(attendance);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete attendance record
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttendance(Guid id)
    {
        var success = await _attendanceService.DeleteAttendanceAsync(id);
        if (!success)
            return NotFound(new { message = "Attendance record not found" });

        return NoContent();
    }

    /// <summary>
    /// Get attendance statistics for a student
    /// </summary>
    [HttpGet("statistics/{studentId}")]
    public async Task<ActionResult<AttendanceStatsDto>> GetStudentAttendanceStats(
        Guid studentId,
        [FromQuery] Guid? classCourseId,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester)
    {
        var stats = await _attendanceService.GetStudentAttendanceStatsAsync(
            studentId, classCourseId, academicYear, semester);
        return Ok(stats);
    }

    /// <summary>
    /// Get attendance records by class-course
    /// </summary>
    [HttpGet("class-course/{classCourseId}")]
    public async Task<ActionResult<List<AttendanceDto>>> GetAttendanceByClassCourse(
        Guid classCourseId,
        [FromQuery] DateOnly? checkDate)
    {
        var attendances = await _attendanceService.GetAttendanceByClassCourseAsync(classCourseId, checkDate);
        return Ok(attendances);
    }

    /// <summary>
    /// Get attendance records by student
    /// </summary>
    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<PagedResult<AttendanceDto>>> GetAttendanceByStudent(
        Guid studentId,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _attendanceService.GetAttendanceByStudentAsync(
            studentId, academicYear, semester, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get absence report
    /// </summary>
    [HttpGet("report/absences")]
    public async Task<ActionResult> GetAbsenceReport(
        [FromQuery] Guid? classCourseId,
        [FromQuery] string? academicYear,
        [FromQuery] int? semester,
        [FromQuery] decimal? minAbsenceRate = 20)
    {
        var report = await _attendanceService.GetAbsenceReportAsync(
            classCourseId, academicYear, semester, minAbsenceRate);
        return Ok(report);
    }
}
