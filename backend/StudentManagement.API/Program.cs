// Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StudentManagement.API.Data;
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
        p.WithOrigins("http://localhost:3000")
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
