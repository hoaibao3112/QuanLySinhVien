// Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StudentManagement.API.Data;
using StudentManagement.API.Models;
using StudentManagement.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── JWT Auth ─────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew                = TimeSpan.Zero   // token hết hạn đúng giờ
        };
    });

builder.Services.AddAuthorization();

// ── Services DI ───────────────────────────────────────────────
// Core Services
builder.Services.AddScoped<IAuthService,       AuthService>();
builder.Services.AddScoped<IStudentService,    StudentService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IClassService,      ClassService>();
builder.Services.AddScoped<ICourseService,     CourseService>();
builder.Services.AddScoped<IGradeService,      GradeService>();
builder.Services.AddScoped<ITuitionService,    TuitionService>();
builder.Services.AddScoped<IDashboardService,  DashboardService>();

// New Services (Attendance, Instructor, etc.)
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddScoped<InstructorService>();
// Add more services as you implement them:
// builder.Services.AddScoped<ExamScheduleService>();
// builder.Services.AddScoped<ScholarshipService>();
// builder.Services.AddScoped<StudentRegistrationService>();
// builder.Services.AddScoped<DisciplinaryService>();
// builder.Services.AddScoped<LeaveRequestService>();
// builder.Services.AddScoped<DocumentService>();
// builder.Services.AddScoped<EvaluationService>();
// builder.Services.AddScoped<FacilityService>();
// builder.Services.AddScoped<AnnouncementService>();

// ── CORS cho NextJS ──────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddPolicy("NextJS", p =>
        p.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials()));

// ── Swagger ───────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Student Management API",
        Version     = "v1",
        Description = "API quản lý sinh viên - C# ASP.NET Core 8"
    });

    // Cho phép nhập Bearer token trong Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.ApiKey,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Nhập: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {{
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        },
        Array.Empty<string>()
    }});
});

builder.Services.AddControllers();

// ── Build ─────────────────────────────────────────────────────
var app = builder.Build();

// ── Seed Database ─────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // ── Update Role Constraint FIRST ──────────────────────────
    try
    {
        await db.Database.ExecuteSqlRawAsync("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
        await db.Database.ExecuteSqlRawAsync("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'student', 'instructor'));");
        Console.WriteLine("✓ Role constraint updated to allow: admin, staff, student, instructor");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠ Failed to update role constraint: {ex.Message}");
    }
    
    try
    {
        // Seed default admin user if no users exist
        if (!await db.Users.AnyAsync())
        {
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

            var studentUser = new User
            {
                Id = Guid.Parse("b0000000-0000-0000-0000-000000000001"),
                Username = "student1",
                Email = "student1@edu.vn",
                PasswordHash = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe", // password123
                Role = "student",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            db.Users.Add(adminUser);
            db.Users.Add(studentUser);
            await db.SaveChangesAsync();
            
            Console.WriteLine("✓ Default users created:");
            Console.WriteLine("  - Admin: username=admin, password=password123");
            Console.WriteLine("  - Student: username=student1, password=password123");
        }
        else
        {
            // Add student user if not exists
            var existingStudent = await db.Users.FirstOrDefaultAsync(u => u.Username == "student1");
            if (existingStudent != null)
            {
                // Remove old student user to recreate with correct role
                db.Users.Remove(existingStudent);
                await db.SaveChangesAsync();
                Console.WriteLine("✓ Old student1 user removed");
            }
            
            // Create student user
            var studentUser = new User
            {
                Id = Guid.Parse("b0000000-0000-0000-0000-000000000001"),
                Username = "student1",
                Email = "student1@edu.vn",
                PasswordHash = "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVyc37xbJe", // password123
                Role = "student",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            db.Users.Add(studentUser);
            await db.SaveChangesAsync();
            Console.WriteLine("✓ Student user created (username: student1, password: password123)");
            Console.WriteLine("✓ Database already has users");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠ Database seeding error: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student Management API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("NextJS");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
