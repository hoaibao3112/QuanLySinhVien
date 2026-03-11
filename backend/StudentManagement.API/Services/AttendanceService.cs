using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class AttendanceService
{
    private readonly AppDbContext _context;

    public AttendanceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<AttendanceDto>> GetAttendancesAsync(
        Guid? studentId, Guid? classCourseId, DateOnly? fromDate, DateOnly? toDate,
        string? status, int page, int pageSize)
    {
        var query = _context.Set<Attendance>()
            .Include(a => a.Student)
            .Include(a => a.ClassCourse)
                .ThenInclude(cc => cc!.Course)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(a => a.StudentId == studentId.Value);

        if (classCourseId.HasValue)
            query = query.Where(a => a.ClassCourseId == classCourseId.Value);

        if (fromDate.HasValue)
            query = query.Where(a => a.CheckDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.CheckDate <= toDate.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        var total = await query.CountAsync();
        var attendances = await query
            .OrderByDescending(a => a.CheckDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var data = attendances.Select(a => new AttendanceDto(
            a.Id,
            a.StudentId,
            a.Student?.StudentCode ?? "",
            a.Student?.FullName ?? "",
            a.ClassCourseId,
            a.ClassCourse?.Course?.Name ?? "",
            a.CheckDate,
            a.Status,
            a.Notes,
            a.CreatedAt
        )).ToList();

        return new PagedResult<AttendanceDto>(
            data,
            total,
            page,
            pageSize,
            (int)Math.Ceiling(total / (double)pageSize)
        );
    }

    public async Task<AttendanceDto?> GetAttendanceByIdAsync(Guid id)
    {
        var attendance = await _context.Set<Attendance>()
            .Include(a => a.Student)
            .Include(a => a.ClassCourse)
                .ThenInclude(cc => cc!.Course)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (attendance == null) return null;

        return new AttendanceDto(
            attendance.Id,
            attendance.StudentId,
            attendance.Student?.StudentCode ?? "",
            attendance.Student?.FullName ?? "",
            attendance.ClassCourseId,
            attendance.ClassCourse?.Course?.Name ?? "",
            attendance.CheckDate,
            attendance.Status,
            attendance.Notes,
            attendance.CreatedAt
        );
    }

    public async Task<AttendanceDto> MarkAttendanceAsync(AttendanceMarkDto dto)
    {
        // Validate student exists
        var student = await _context.Set<Student>().FindAsync(dto.StudentId);
        if (student == null)
            throw new Exception("Student not found");

        // Validate class course exists
        var classCourse = await _context.Set<ClassCourse>().FindAsync(dto.ClassCourseId);
        if (classCourse == null)
            throw new Exception("Class course not found");

        // Check if attendance already exists
        var existing = await _context.Set<Attendance>()
            .FirstOrDefaultAsync(a =>
                a.StudentId == dto.StudentId &&
                a.ClassCourseId == dto.ClassCourseId &&
                a.CheckDate == dto.CheckDate);

        if (existing != null)
            throw new Exception("Attendance already marked for this date");

        // Validate check date (can mark up to 7 days in past)
        if (dto.CheckDate < DateOnly.FromDateTime(DateTime.Now.AddDays(-7)))
            throw new Exception("Cannot mark attendance more than 7 days in the past");

        if (dto.CheckDate > DateOnly.FromDateTime(DateTime.Now))
            throw new Exception("Cannot mark attendance for future dates");

        // Validate status
        var validStatuses = new[] { "present", "absent", "late", "excused" };
        if (!validStatuses.Contains(dto.Status.ToLower()))
            throw new Exception($"Invalid status. Must be one of: {string.Join(", ", validStatuses)}");

        var attendance = new Attendance
        {
            StudentId = dto.StudentId,
            ClassCourseId = dto.ClassCourseId,
            CheckDate = dto.CheckDate,
            Status = dto.Status.ToLower(),
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<Attendance>().Add(attendance);
        await _context.SaveChangesAsync();

        // Check absence rate and send warning if needed
        await CheckAbsenceRateAndNotifyAsync(dto.StudentId, dto.ClassCourseId);

        return await GetAttendanceByIdAsync(attendance.Id) ?? throw new Exception("Failed to retrieve attendance");
    }

    public async Task<List<AttendanceDto>> MarkBulkAttendanceAsync(AttendanceBulkDto dto)
    {
        var attendances = new List<Attendance>();

        foreach (var studentAttendance in dto.Students)
        {
            // Check if already exists
            var existing = await _context.Set<Attendance>()
                .FirstOrDefaultAsync(a =>
                    a.StudentId == studentAttendance.StudentId &&
                    a.ClassCourseId == dto.ClassCourseId &&
                    a.CheckDate == dto.CheckDate);

            if (existing != null)
                continue; // Skip if already marked

            var attendance = new Attendance
            {
                StudentId = studentAttendance.StudentId,
                ClassCourseId = dto.ClassCourseId,
                CheckDate = dto.CheckDate,
                Status = studentAttendance.Status.ToLower(),
                CreatedAt = DateTime.UtcNow
            };

            attendances.Add(attendance);
        }

        _context.Set<Attendance>().AddRange(attendances);
        await _context.SaveChangesAsync();

        // Check absence rates
        foreach (var att in attendances)
        {
            if (att.Status == "absent")
            {
                await CheckAbsenceRateAndNotifyAsync(att.StudentId, att.ClassCourseId);
            }
        }

        var result = new List<AttendanceDto>();
        foreach (var att in attendances)
        {
            var attDto = await GetAttendanceByIdAsync(att.Id);
            if (attDto != null) result.Add(attDto);
        }

        return result;
    }

    public async Task<AttendanceDto?> UpdateAttendanceAsync(Guid id, AttendanceMarkDto dto)
    {
        var attendance = await _context.Set<Attendance>().FindAsync(id);
        if (attendance == null) return null;

        attendance.Status = dto.Status.ToLower();
        attendance.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        return await GetAttendanceByIdAsync(id);
    }

    public async Task<bool> DeleteAttendanceAsync(Guid id)
    {
        var attendance = await _context.Set<Attendance>().FindAsync(id);
        if (attendance == null) return false;

        _context.Set<Attendance>().Remove(attendance);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<AttendanceStatsDto> GetStudentAttendanceStatsAsync(
        Guid studentId, Guid? classCourseId, string? academicYear, int? semester)
    {
        var query = _context.Set<Attendance>()
            .Where(a => a.StudentId == studentId);

        if (classCourseId.HasValue)
            query = query.Where(a => a.ClassCourseId == classCourseId.Value);

        // TODO: Add academic year and semester filtering via ClassCourse

        var attendances = await query.ToListAsync();

        var totalSessions = attendances.Count;
        var presentCount = attendances.Count(a => a.Status == "present");
        var absentCount = attendances.Count(a => a.Status == "absent");
        var lateCount = attendances.Count(a => a.Status == "late");
        var excusedCount = attendances.Count(a => a.Status == "excused");

        var attendanceRate = totalSessions > 0
            ? (decimal)(presentCount + lateCount) / totalSessions * 100
            : 0;

        return new AttendanceStatsDto(
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            excusedCount,
            Math.Round(attendanceRate, 2)
        );
    }

    public async Task<List<AttendanceDto>> GetAttendanceByClassCourseAsync(Guid classCourseId, DateOnly? checkDate)
    {
        var query = _context.Set<Attendance>()
            .Include(a => a.Student)
            .Include(a => a.ClassCourse)
                .ThenInclude(cc => cc!.Course)
            .Where(a => a.ClassCourseId == classCourseId);

        if (checkDate.HasValue)
            query = query.Where(a => a.CheckDate == checkDate.Value);

        var attendances = await query.OrderBy(a => a.Student!.FullName).ToListAsync();

        return attendances.Select(a => new AttendanceDto(
            a.Id,
            a.StudentId,
            a.Student?.StudentCode ?? "",
            a.Student?.FullName ?? "",
            a.ClassCourseId,
            a.ClassCourse?.Course?.Name ?? "",
            a.CheckDate,
            a.Status,
            a.Notes,
            a.CreatedAt
        )).ToList();
    }

    public async Task<PagedResult<AttendanceDto>> GetAttendanceByStudentAsync(
        Guid studentId, string? academicYear, int? semester, int page, int pageSize)
    {
        var query = _context.Set<Attendance>()
            .Include(a => a.Student)
            .Include(a => a.ClassCourse)
                .ThenInclude(cc => cc!.Course)
            .Where(a => a.StudentId == studentId);

        // TODO: Add academic year and semester filtering

        var total = await query.CountAsync();
        var attendances = await query
            .OrderByDescending(a => a.CheckDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var data = attendances.Select(a => new AttendanceDto(
            a.Id,
            a.StudentId,
            a.Student?.StudentCode ?? "",
            a.Student?.FullName ?? "",
            a.ClassCourseId,
            a.ClassCourse?.Course?.Name ?? "",
            a.CheckDate,
            a.Status,
            a.Notes,
            a.CreatedAt
        )).ToList();

        return new PagedResult<AttendanceDto>(
            data,
            total,
            page,
            pageSize,
            (int)Math.Ceiling(total / (double)pageSize)
        );
    }

    public async Task<object> GetAbsenceReportAsync(
        Guid? classCourseId, string? academicYear, int? semester, decimal? minAbsenceRate)
    {
        var query = _context.Set<Attendance>().AsQueryable();

        if (classCourseId.HasValue)
            query = query.Where(a => a.ClassCourseId == classCourseId.Value);

        var students = await query
            .GroupBy(a => a.StudentId)
            .Select(g => new
            {
                StudentId = g.Key,
                TotalSessions = g.Count(),
                AbsentCount = g.Count(a => a.Status == "absent"),
                AbsenceRate = g.Count() > 0 ? (decimal)g.Count(a => a.Status == "absent") / g.Count() * 100 : 0
            })
            .Where(x => x.AbsenceRate >= (minAbsenceRate ?? 20))
            .OrderByDescending(x => x.AbsenceRate)
            .ToListAsync();

        // Get student details
        var studentIds = students.Select(s => s.StudentId).ToList();
        var studentDetails = await _context.Set<Student>()
            .Where(s => studentIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id);

        var report = students.Select(s => new
        {
            StudentId = s.StudentId,
            StudentCode = studentDetails.GetValueOrDefault(s.StudentId)?.StudentCode ?? "",
            StudentName = studentDetails.GetValueOrDefault(s.StudentId)?.FullName ?? "",
            TotalSessions = s.TotalSessions,
            AbsentCount = s.AbsentCount,
            AbsenceRate = Math.Round(s.AbsenceRate, 2),
            Status = s.AbsenceRate >= 30 ? "Critical - Cannot take final exam" :
                     s.AbsenceRate >= 20 ? "Warning" : "Normal"
        }).ToList();

        return new
        {
            TotalStudentsWithIssues = report.Count,
            CriticalCount = report.Count(r => r.Status.StartsWith("Critical")),
            WarningCount = report.Count(r => r.Status == "Warning"),
            Students = report
        };
    }

    private async Task CheckAbsenceRateAndNotifyAsync(Guid studentId, Guid classCourseId)
    {
        var stats = await GetStudentAttendanceStatsAsync(studentId, classCourseId, null, null);

        var absenceRate = stats.TotalSessions > 0
            ? (decimal)stats.AbsentCount / stats.TotalSessions * 100
            : 0;

        if (absenceRate >= 30)
        {
            // TODO: Send critical notification - student cannot take final exam
            Console.WriteLine($"CRITICAL: Student {studentId} absence rate: {absenceRate}% - Cannot take final exam");
        }
        else if (absenceRate >= 20)
        {
            // TODO: Send warning notification
            Console.WriteLine($"WARNING: Student {studentId} absence rate: {absenceRate}%");
        }
    }
}
