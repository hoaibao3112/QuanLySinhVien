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
    
    [HttpGet("test-password/{username}")]
    public async Task<IActionResult> TestPassword(string username, [FromQuery] string password)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound($"User {username} not found");
        
        var isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        return Ok(new { 
            username = user.Username, 
            role = user.Role, 
            isActive = user.IsActive,
            passwordHash = user.PasswordHash.Substring(0, 20) + "...",
            passwordTest = password,
            isValid 
        });
    }
    
    [HttpGet("hash-password")]
    public IActionResult HashPassword([FromQuery] string password)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        return Ok(new { password, hash });
    }
    
    [HttpPost("fix-student-password")]
    public async Task<IActionResult> FixStudentPassword()
    {
        var student = await _db.Users.FirstOrDefaultAsync(u => u.Username == "student1");
        if (student == null) return NotFound("student1 not found");
        
        student.PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        student.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Password updated for student1", username = "student1", password = "password123" });
    }
    
    [HttpPost("create-student-record")]
    public async Task<IActionResult> CreateStudentRecord()
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == "student1");
        if (user == null) return NotFound("User student1 not found");
        
        var existingStudent = await _db.Students.FirstOrDefaultAsync(s => s.Id == user.Id);
        if (existingStudent != null) 
            return Ok(new { message = "Student record already exists", student = existingStudent });
        
        var department = await _db.Departments.FirstOrDefaultAsync();
        var studentClass = await _db.Classes.FirstOrDefaultAsync();
        
        // Use raw SQL to insert student record
        var sql = @"
            INSERT INTO students (id, student_code, full_name, date_of_birth, gender, email, phone, address, class_id, department_id, enrollment_year, status, created_at, updated_at)
            VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12, @p13)
        ";
        
        try
        {
            var studentCode = $"SV{user.Id.ToString().Substring(0, 4).ToUpper()}";
            var emailToUse = $"sv{user.Id.ToString().Substring(0, 8)}@edu.vn";
            
            await _db.Database.ExecuteSqlRawAsync(sql,
                user.Id,                                    // id
                studentCode,                                 // student_code
                "Nguyễn Văn A",                             // full_name
                new DateOnly(2000, 1, 1),                   // date_of_birth
                "Nam",                                       // gender
                emailToUse,                                  // email
                "0123456789",                                // phone
                "123 Nguyễn Huệ, Quận 1, TP.HCM",          // address
                studentClass?.Id,                            // class_id
                department?.Id,                              // department_id
                2020,                                        // enrollment_year
                "active",                                    // status
                DateTime.UtcNow,                             // created_at
                DateTime.UtcNow                              // updated_at
            );
            
            var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == user.Id);
            
            return Ok(new { 
                message = "Student record created successfully", 
                student = new {
                    student?.Id,
                    student?.StudentCode,
                    student?.FullName,
                    student?.Email,
                    student?.Status,
                    departmentName = department?.Name,
                    className = studentClass?.Name
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create student", error = ex.Message, innerError = ex.InnerException?.Message });
        }
    }
    
    [HttpPost("link-existing-student-to-user")]
    public async Task<IActionResult> LinkExistingStudentToUser()
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == "student1");
        if (user == null) return NotFound("User student1 not found");
        
        // Check if already linked
        var existingStudent = await _db.Students.FirstOrDefaultAsync(s => s.Id == user.Id);
        if (existingStudent != null)
            return Ok(new { message = "User already linked to student", student = existingStudent });
        
        // Get any random student to link (pick the first one without a user link)
        var availableStudent = await _db.Students
            .Where(s => !_db.Users.Any(u => u.Id == s.Id && u.Role == "student"))
            .FirstOrDefaultAsync();
            
        if (availableStudent == null)
            return NotFound("No available student records found to link");
        
        // Update the student's ID to match the user ID
        var oldId = availableStudent.Id;
        var sql = "UPDATE students SET id = @p0 WHERE id = @p1";
        
        try
        {
            await _db.Database.ExecuteSqlRawAsync(sql, user.Id, oldId);
            var linkedStudent = await _db.Students.Include(s => s.Class).Include(s => s.Department).FirstOrDefaultAsync(s => s.Id == user.Id);
            
            return Ok(new {
                message = "Successfully linked student to user",
                student = new {
                    linkedStudent?.Id,
                    linkedStudent?.StudentCode,
                    linkedStudent?.FullName,
                    linkedStudent?.Email,
                    linkedStudent?.Status,
                    className = linkedStudent?.Class?.Name,
                    departmentName = linkedStudent?.Department?.Name
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to link student", error = ex.Message, innerError = ex.InnerException?.Message });
        }
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
