using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/dashboard"), Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _svc;
    public DashboardController(IDashboardService svc) => _svc = svc;

    /// <summary>Thống kê tổng quan cho trang chủ</summary>
    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _svc.GetAsync());
}
