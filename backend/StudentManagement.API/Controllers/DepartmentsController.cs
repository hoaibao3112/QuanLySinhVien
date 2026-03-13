using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/departments"), Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _svc;
    public DepartmentsController(IDepartmentService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(new ApiResponse<List<DepartmentDto>>(true, await _svc.GetAllAsync()));

    [HttpPost, Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
    {
        try { return Ok(await _svc.CreateAsync(dto)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DepartmentCreateDto dto)
    {
        try
        {
            var d = await _svc.UpdateAsync(id, dto);
            return d is null ? NotFound() : Ok(d);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try { return await _svc.DeleteAsync(id) ? NoContent() : NotFound(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}
