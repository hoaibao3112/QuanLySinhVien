using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _svc;
    public AuthController(IAuthService svc) => _svc = svc;

    /// <summary>Đăng nhập - trả về JWT token</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await _svc.LoginAsync(req);
        if (result is null)
            return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng." });
        return Ok(result);
    }

    /// <summary>Thông tin user đang đăng nhập</summary>
    [HttpGet("me"), Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var me = await _svc.GetMeAsync(userId);
        return me is null ? NotFound() : Ok(me);
    }

    /// <summary>Đổi mật khẩu</summary>
    [HttpPost("change-password"), Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var ok = await _svc.ChangePasswordAsync(userId, req);
        return ok ? Ok(new { message = "Đổi mật khẩu thành công." })
                  : BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
    }
}
