using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Controllers;

[ApiController, Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public TestController(AppDbContext db) => _db = db;
    
    [HttpPost("seed-admin")]
    public async Task<IActionResult> SeedAdmin()
    {
        // Check if admin exists
        var existingAdmin = await _db.Users.FirstOrDefaultAsync(u => u.Username == "admin");
        if (existingAdmin != null)
        {
            return Ok(new { message = "Admin already exists", user = new { existingAdmin.Username, existingAdmin.Email, existingAdmin.IsActive } });
        }
        
        // Create admin user
        var adminUser = new User
        {
            Id = Guid.Parse("a0000000-0000-0000-0000-000000000001"),
            Username = "admin",
            Email = "admin@edu.vn",
            PasswordHash = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe", // password123
            Role = "admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _db.Users.Add(adminUser);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Admin user created successfully", username = "admin", email = "admin@edu.vn", password = "password123" });
    }
    
    [HttpGet("list-users")]
    public async Task<IActionResult> ListUsers()
    {
        var users = await _db.Users.Select(u => new { u.Id, u.Username, u.Email, u.Role, u.IsActive }).ToListAsync();
        return Ok(new { count = users.Count, users });
    }
    
    [HttpPost("test-hash")]
    public IActionResult TestHash([FromBody] string password)
    {
        var storedHash = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe";
        var isValid = BCrypt.Net.BCrypt.Verify(password, storedHash);
        return Ok(new { password, storedHash, isValid });
    }
    
    [HttpPost("reset-admin-password")]
    public async Task<IActionResult> ResetAdminPassword([FromBody] string newPassword)
    {
        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Username == "admin");
        if (admin == null)
        {
            return NotFound(new { message = "Admin user not found" });
        }
        
        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        admin.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Admin password reset successfully", username = "admin", newPassword });
    }
}
