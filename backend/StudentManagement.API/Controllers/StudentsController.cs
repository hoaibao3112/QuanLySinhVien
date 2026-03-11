using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/students"), Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _svc;
    public StudentsController(IStudentService svc) => _svc = svc;

    /// <summary>Danh sách sinh viên - có tìm kiếm, lọc, phân trang</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int    page         = 1,
        [FromQuery] int    pageSize     = 10,
        [FromQuery] string? search      = null,
        [FromQuery] Guid?   classId     = null,
        [FromQuery] Guid?   departmentId = null,
        [FromQuery] string? status      = null)
        => Ok(await _svc.GetAllAsync(page, pageSize, search, classId, departmentId, status));

    /// <summary>Chi tiết 1 sinh viên</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var s = await _svc.GetByIdAsync(id);
        return s is null ? NotFound(new { message = "Không tìm thấy sinh viên." }) : Ok(s);
    }

    /// <summary>Thêm sinh viên mới</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StudentCreateDto dto)
    {
        try
        {
            var s = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = s.Id }, s);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    /// <summary>Cập nhật thông tin sinh viên</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] StudentUpdateDto dto)
    {
        try
        {
            var s = await _svc.UpdateAsync(id, dto);
            return s is null ? NotFound(new { message = "Không tìm thấy sinh viên." }) : Ok(s);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    /// <summary>Xóa sinh viên (chỉ admin)</summary>
    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
        => await _svc.DeleteAsync(id) ? NoContent()
           : NotFound(new { message = "Không tìm thấy sinh viên." });

    /// <summary>Điểm của sinh viên</summary>
    [HttpGet("{id}/grades")]
    public async Task<IActionResult> GetGrades(Guid id,
        [FromQuery] string? academicYear = null, [FromQuery] int? semester = null)
        => Ok(await _svc.GetGradesAsync(id, academicYear, semester));

    /// <summary>Học phí của sinh viên</summary>
    [HttpGet("{id}/tuitions")]
    public async Task<IActionResult> GetTuitions(Guid id)
        => Ok(await _svc.GetTuitionsAsync(id));
}
