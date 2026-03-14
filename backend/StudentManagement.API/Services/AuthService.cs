// Services/AuthService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudentManagement.API.Data;
using StudentManagement.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StudentManagement.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest req);
    Task<bool>           ChangePasswordAsync(Guid userId, ChangePasswordRequest req);
    Task<MeResponse?>    GetMeAsync(Guid userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext    _db;
    private readonly IConfiguration _cfg;

    public AuthService(AppDbContext db, IConfiguration cfg)
    { _db = db; _cfg = cfg; }

    public async Task<LoginResponse?> LoginAsync(LoginRequest req)
    {
        // Allow login with either username or email
        var user = await _db.Users
            .FirstOrDefaultAsync(u => (u.Username == req.Username || u.Email == req.Username) && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        var expiresAt = DateTime.UtcNow.AddHours(
            _cfg.GetValue<int>("Jwt:ExpireHours", 8));

        var token = BuildToken(user, expiresAt);
        return new LoginResponse(user.Id, token, user.Username, user.Email, user.Role, expiresAt);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest req)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return false;
        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash)) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        user.UpdatedAt    = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<MeResponse?> GetMeAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user is null ? null
            : new MeResponse(user.Id, user.Username, user.Email, user.Role);
    }

    // ── private ──────────────────────────────────────────────
    private string BuildToken(Models.User user, DateTime expiresAt)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name,           user.Username),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Role,           user.Role)
        };

        var jwt = new JwtSecurityToken(
            issuer:             _cfg["Jwt:Issuer"],
            audience:           _cfg["Jwt:Audience"],
            claims:             claims,
            expires:            expiresAt,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}
