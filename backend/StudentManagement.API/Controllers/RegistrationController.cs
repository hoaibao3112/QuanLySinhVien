using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegistrationController : ControllerBase
{
    private readonly AppDbContext _db;

    public RegistrationController(AppDbContext db)
    {
        _db = db;
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null ? Guid.Parse(claim.Value) : Guid.Empty;
    }

    // ── REGISTRATION PERIODS (Admin/Staff) ────────────────────

    [HttpGet("periods")]
    public async Task<ActionResult<ApiResponse<List<RegistrationPeriodDto>>>> GetPeriods()
    {
        var periods = await _db.RegistrationPeriods
            .Include(p => p.SemesterCourses)
            .OrderByDescending(p => p.StartAt)
            .Select(p => new RegistrationPeriodDto(
                p.Id,
                p.Name,
                p.AcademicYear,
                p.Semester,
                p.StartAt,
                p.EndAt,
                p.Status,
                p.Description,
                p.CreatedAt,
                p.SemesterCourses.Count
            ))
            .ToListAsync();

        return Ok(new ApiResponse<List<RegistrationPeriodDto>>(true, periods));
    }

    [HttpPost("periods")]
    public async Task<ActionResult<ApiResponse<RegistrationPeriodDto>>> CreatePeriod(RegistrationPeriodCreateDto dto)
    {
        var period = new RegistrationPeriod
        {
            Name = dto.Name,
            AcademicYear = dto.AcademicYear,
            Semester = dto.Semester,
            StartAt = dto.StartAt,
            EndAt = dto.EndAt,
            Description = dto.Description,
            Status = dto.Status
        };

        _db.RegistrationPeriods.Add(period);
        await _db.SaveChangesAsync();

        var result = new RegistrationPeriodDto(
            period.Id, period.Name, period.AcademicYear, period.Semester,
            period.StartAt, period.EndAt, period.Status, period.Description,
            period.CreatedAt, 0
        );

        return Ok(new ApiResponse<RegistrationPeriodDto>(true, result));
    }

    [HttpPut("periods/{id}")]
    public async Task<ActionResult<ApiResponse<RegistrationPeriodDto>>> UpdatePeriod(Guid id, RegistrationPeriodCreateDto dto)
    {
        var period = await _db.RegistrationPeriods.FindAsync(id);
        if (period == null) return NotFound(new ApiResponse<RegistrationPeriodDto>(false, null, "Not found"));

        period.Name = dto.Name;
        period.AcademicYear = dto.AcademicYear;
        period.Semester = dto.Semester;
        period.StartAt = dto.StartAt;
        period.EndAt = dto.EndAt;
        period.Description = dto.Description;
        period.Status = dto.Status;

        await _db.SaveChangesAsync();

        var result = new RegistrationPeriodDto(
            period.Id, period.Name, period.AcademicYear, period.Semester,
            period.StartAt, period.EndAt, period.Status, period.Description,
            period.CreatedAt, 0
        );

        return Ok(new ApiResponse<RegistrationPeriodDto>(true, result));
    }

    // ── SEMESTER COURSES (Course Offerings) ───────────────────

    [HttpGet("periods/{periodId}/courses")]
    public async Task<ActionResult<ApiResponse<List<SemesterCourseDto>>>> GetSemesterCourses(Guid periodId)
    {
        var courses = await _db.SemesterCourses
            .Include(sc => sc.Course)
            .Where(sc => sc.RegistrationPeriodId == periodId)
            .Select(sc => new SemesterCourseDto(
                sc.Id,
                sc.RegistrationPeriodId,
                sc.CourseId,
                sc.Course!.Code,
                sc.Course.Name,
                sc.Course.Credits,
                sc.TeacherName,
                sc.Schedule,
                sc.Room,
                sc.TotalPeriods,
                sc.PeriodsPerSession,
                sc.IsActive
            ))
            .ToListAsync();

        return Ok(new ApiResponse<List<SemesterCourseDto>>(true, courses));
    }

    [HttpPost("periods/{periodId}/courses")]
    public async Task<ActionResult<ApiResponse<SemesterCourseDto>>> AddSemesterCourse(Guid periodId, SemesterCourseCreateDto dto)
    {
        var course = await _db.Courses.FindAsync(dto.CourseId);
        if (course == null) return NotFound(new ApiResponse<SemesterCourseDto>(false, null, "Course not found"));

        var semesterCourse = new SemesterCourse
        {
            RegistrationPeriodId = periodId,
            CourseId = dto.CourseId,
            TeacherName = dto.TeacherName,
            Schedule = dto.Schedule,
            Room = dto.Room,
            TotalPeriods = dto.TotalPeriods,
            PeriodsPerSession = dto.PeriodsPerSession
        };

        _db.SemesterCourses.Add(semesterCourse);
        await _db.SaveChangesAsync();

        var result = new SemesterCourseDto(
            semesterCourse.Id,
            semesterCourse.RegistrationPeriodId,
            semesterCourse.CourseId,
            course.Code,
            course.Name,
            course.Credits,
            semesterCourse.TeacherName,
            semesterCourse.Schedule,
            semesterCourse.Room,
            semesterCourse.TotalPeriods,
            semesterCourse.PeriodsPerSession,
            semesterCourse.IsActive
        );

        return Ok(new ApiResponse<SemesterCourseDto>(true, result));
    }

    [HttpDelete("courses/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveSemesterCourse(Guid id)
    {
        var sc = await _db.SemesterCourses.FindAsync(id);
        if (sc == null) return NotFound(new ApiResponse<bool>(false, false, "Not found"));

        _db.SemesterCourses.Remove(sc);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<bool>(true, true));
    }

    // ── STUDENT REGISTRATION (Student) ────────────────────────

    [HttpGet("active-period")]
    public async Task<ActionResult<ApiResponse<RegistrationPeriodDto>>> GetActivePeriod()
    {
        var now = DateTime.UtcNow;
        var period = await _db.RegistrationPeriods
            .Include(p => p.SemesterCourses)
            .Where(p => p.Status == "active" && p.StartAt <= now && p.EndAt >= now)
            .FirstOrDefaultAsync();

        if (period == null) return Ok(new ApiResponse<RegistrationPeriodDto>(true, null, "No active registration period"));

        var result = new RegistrationPeriodDto(
            period.Id, period.Name, period.AcademicYear, period.Semester,
            period.StartAt, period.EndAt, period.Status, period.Description,
            period.CreatedAt, period.SemesterCourses.Count
        );

        return Ok(new ApiResponse<RegistrationPeriodDto>(true, result));
    }

    [HttpGet("available-classes")]
    public async Task<ActionResult<ApiResponse<List<ClassCourseDto>>>> GetAvailableClasses()
    {
        var now = DateTime.UtcNow;
        var activePeriod = await _db.RegistrationPeriods
            .Where(p => p.Status == "active" && p.StartAt <= now && p.EndAt >= now)
            .FirstOrDefaultAsync();

        if (activePeriod == null) return Ok(new ApiResponse<List<ClassCourseDto>>(true, new List<ClassCourseDto>(), "No active period"));

        var classes = await _db.ClassCourses
            .Include(cc => cc.Course)
            .Include(cc => cc.Class)
            .Where(cc => cc.RegistrationPeriodId == activePeriod.Id)
            .Select(cc => new ClassCourseDto(
                cc.Id,
                cc.CourseId,
                cc.Course!.Code,
                cc.Course!.Name,
                cc.Course!.Credits,
                cc.TeacherName,
                cc.Schedule,
                cc.Room,
                cc.RegistrationPeriodId
            ))
            .ToListAsync();

        var semesterCourses = await _db.SemesterCourses
            .Include(sc => sc.Course)
            .Where(sc => sc.RegistrationPeriodId == activePeriod.Id && sc.IsActive)
            .Select(sc => new ClassCourseDto(
                sc.Id,
                sc.CourseId,
                sc.Course!.Code,
                sc.Course!.Name,
                sc.Course!.Credits,
                sc.TeacherName,
                sc.Schedule,
                sc.Room,
                sc.RegistrationPeriodId
            ))
            .ToListAsync();

        classes.AddRange(semesterCourses);
        return Ok(new ApiResponse<List<ClassCourseDto>>(true, classes));
    }

    [HttpGet("my-registrations")]
    public async Task<ActionResult<ApiResponse<List<StudentRegistrationDto>>>> GetMyRegistrations()
    {
        var studentId = GetCurrentUserId();
        var registrations = await _db.StudentRegistrations
            .Include(r => r.Student)
            .Include(r => r.ClassCourse).ThenInclude(cc => cc!.Course)
            .Include(r => r.ClassCourse).ThenInclude(cc => cc!.Class)
            .Include(r => r.SemesterCourse).ThenInclude(sc => sc!.Course)
            .Where(r => r.StudentId == studentId)
            .Select(r => new StudentRegistrationDto(
                r.Id,
                r.StudentId,
                (r.ClassCourse != null ? r.ClassCourse.CourseId : (r.SemesterCourse != null ? r.SemesterCourse.CourseId : Guid.Empty)),
                (r.ClassCourse != null ? r.ClassCourse.Course!.Code : (r.SemesterCourse != null ? r.SemesterCourse.Course!.Code : "")),
                (r.ClassCourse != null ? r.ClassCourse.Course!.Name : (r.SemesterCourse != null ? r.SemesterCourse.Course!.Name : "")),
                (r.ClassCourse != null ? r.ClassCourse.Course!.Credits : (r.SemesterCourse != null ? r.SemesterCourse.Course!.Credits : 0)),
                (r.ClassCourse != null ? (r.ClassCourse.Class != null ? r.ClassCourse.Class.Code : "N/A") : "N/A"),
                (r.ClassCourse != null ? (r.ClassCourse.Class != null ? r.ClassCourse.Class.Name : "N/A") : "N/A"),
                (r.ClassCourse != null ? r.ClassCourse.TeacherName : (r.SemesterCourse != null ? r.SemesterCourse.TeacherName : "")),
                (r.ClassCourse != null ? r.ClassCourse.Schedule : (r.SemesterCourse != null ? r.SemesterCourse.Schedule : "")),
                (r.ClassCourse != null ? r.ClassCourse.Room : (r.SemesterCourse != null ? r.SemesterCourse.Room : "")),
                r.AcademicYear,
                r.Semester,
                r.Status
            ))
            .ToListAsync();

        return Ok(new ApiResponse<List<StudentRegistrationDto>>(true, registrations));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<StudentRegistrationDto>>> Register(StudentRegistrationCreateDto dto)
    {
        var studentId = GetCurrentUserId();
        var student = await _db.Students.FindAsync(studentId);
        if (student == null) return Unauthorized(new ApiResponse<StudentRegistrationDto>(false, null, "User not authorized"));

        var now = DateTime.UtcNow;
        // In the simplified register dto, ClassCourseId could be either ClassCourse or SemesterCourse Id
        
        var classCourse = await _db.ClassCourses
            .Include(cc => cc.Course)
            .Include(cc => cc.Class)
            .FirstOrDefaultAsync(cc => cc.Id == dto.ClassCourseId);

        var semesterCourse = await _db.SemesterCourses
            .Include(sc => sc.Course)
            .FirstOrDefaultAsync(sc => sc.Id == dto.ClassCourseId);

        if (classCourse == null && semesterCourse == null) 
            return NotFound(new ApiResponse<StudentRegistrationDto>(false, null, "Course not found"));

        var periodId = classCourse?.RegistrationPeriodId ?? semesterCourse?.RegistrationPeriodId;
        var period = await _db.RegistrationPeriods.FindAsync(periodId);
        
        if (period == null || period.Status != "active" || period.StartAt > now || period.EndAt < now)
        {
            return BadRequest(new ApiResponse<StudentRegistrationDto>(false, null, "Registration period is not active"));
        }

        // Check if already registered
        var exists = await _db.StudentRegistrations.AnyAsync(r =>
            r.StudentId == studentId && (r.ClassCourseId == dto.ClassCourseId || r.SemesterCourseId == dto.ClassCourseId));
        if (exists)
            return BadRequest(new ApiResponse<StudentRegistrationDto>(false, null, "Already registered for this course"));

        // Check capacity
        int registeredCount = 0;
        int maxStudents = 40;

        if (classCourse != null)
        {
            registeredCount = await _db.StudentRegistrations.CountAsync(r => r.ClassCourseId == classCourse.Id);
            maxStudents = classCourse.Class?.MaxStudents ?? 40;
        }
        else if (semesterCourse != null)
        {
            registeredCount = await _db.StudentRegistrations.CountAsync(r => r.SemesterCourseId == semesterCourse.Id);
            maxStudents = semesterCourse.MaxStudents;
        }

        if (registeredCount >= maxStudents)
            return BadRequest(new ApiResponse<StudentRegistrationDto>(false, null, "Class/Course is full"));

        var registration = new StudentRegistration
        {
            StudentId = studentId,
            ClassCourseId = classCourse?.Id,
            SemesterCourseId = semesterCourse?.Id,
            AcademicYear = dto.AcademicYear,
            Semester = dto.Semester,
            Notes = dto.Notes
        };

        _db.StudentRegistrations.Add(registration);
        await _db.SaveChangesAsync();

        var result = new StudentRegistrationDto(
            registration.Id,
            registration.StudentId,
            classCourse?.CourseId ?? semesterCourse!.CourseId,
            classCourse?.Course!.Code ?? semesterCourse!.Course!.Code,
            classCourse?.Course!.Name ?? semesterCourse!.Course!.Name,
            classCourse?.Course!.Credits ?? semesterCourse!.Course!.Credits,
            classCourse?.Class!.Code ?? "N/A",
            classCourse?.Class!.Name ?? "N/A",
            classCourse?.TeacherName ?? semesterCourse?.TeacherName,
            classCourse?.Schedule ?? semesterCourse?.Schedule,
            classCourse?.Room ?? semesterCourse?.Room,
            registration.AcademicYear,
            registration.Semester,
            registration.Status
        );

        return Ok(new ApiResponse<StudentRegistrationDto>(true, result));
    }

    [HttpPost("unregister/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Unregister(Guid id)
    {
        var studentId = GetCurrentUserId();
        var registration = await _db.StudentRegistrations
            .Include(r => r.ClassCourse).ThenInclude(cc => cc!.RegistrationPeriod)
            .Include(r => r.SemesterCourse).ThenInclude(sc => sc!.RegistrationPeriod)
            .FirstOrDefaultAsync(r => r.Id == id && r.StudentId == studentId);

        if (registration == null) return NotFound(new ApiResponse<bool>(false, false, "Registration not found"));

        var now = DateTime.UtcNow;
        var period = registration.ClassCourse?.RegistrationPeriod ?? registration.SemesterCourse?.RegistrationPeriod;
        
        if (period == null || period.Status != "active" || period.StartAt > now || period.EndAt < now)
        {
            return BadRequest(new ApiResponse<bool>(false, false, "Cannot unregister: Registration period is not active"));
        }

        _db.StudentRegistrations.Remove(registration);
        await _db.SaveChangesAsync();

        return Ok(new ApiResponse<bool>(true, true));
    }
}
