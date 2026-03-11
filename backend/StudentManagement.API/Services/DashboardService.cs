using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetAsync();
}

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;
    public DashboardService(AppDbContext db) => _db = db;

    public async Task<DashboardDto> GetAsync()
    {
        var totalStudents  = await _db.Students.CountAsync();
        var totalClasses   = await _db.Classes.CountAsync();
        var totalCourses   = await _db.Courses.CountAsync();
        var activeStudents = await _db.Students.CountAsync(s => s.Status == "active");

        var unpaidTuitions = await _db.Tuitions
            .Where(t => t.Status == "unpaid" || t.Status == "partial" || t.Status == "overdue")
            .ToListAsync();
        var unpaidCount  = unpaidTuitions.Count;
        var unpaidAmount = unpaidTuitions.Sum(t => t.Amount - t.PaidAmount);

        var gpas = await _db.Grades
            .Where(g => g.Gpa != null)
            .Select(g => g.Gpa!.Value)
            .ToListAsync();
        var avgGpa = gpas.Count > 0 ? Math.Round(gpas.Average(), 2) : 0;

        var studentsByStatus = await _db.Students
            .GroupBy(s => s.Status)
            .Select(g => new StatusCountDto(g.Key, g.Count()))
            .ToListAsync();

        var tuitionByStatus = await _db.Tuitions
            .GroupBy(t => t.Status)
            .Select(g => new TuitionSummaryDto(g.Key, g.Count(), g.Sum(t => t.Amount)))
            .ToListAsync();

        return new DashboardDto(
            totalStudents, totalClasses, totalCourses, activeStudents,
            unpaidCount, unpaidAmount, avgGpa,
            studentsByStatus, tuitionByStatus);
    }
}
