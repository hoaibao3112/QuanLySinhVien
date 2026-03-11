// Services/TuitionService.cs
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public interface ITuitionService
{
    Task<List<TuitionDto>> GetAllAsync(string? status, string? academicYear, int? semester);
    Task<TuitionDto>       CreateAsync(TuitionCreateDto dto);
    Task<TuitionDto?>      PayAsync(Guid id, TuitionPayDto dto);
    Task<bool>             DeleteAsync(Guid id);
}

public class TuitionService : ITuitionService
{
    private readonly AppDbContext _db;
    public TuitionService(AppDbContext db) => _db = db;

    public async Task<List<TuitionDto>> GetAllAsync(
        string? status, string? academicYear, int? semester)
    {
        var q = _db.Tuitions.Include(t => t.Student).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))       q = q.Where(t => t.Status       == status);
        if (!string.IsNullOrWhiteSpace(academicYear)) q = q.Where(t => t.AcademicYear == academicYear);
        if (semester.HasValue)                        q = q.Where(t => t.Semester     == semester);

        return await q
            .OrderBy(t => t.Student!.FullName)
            .Select(t => ToDto(t))
            .ToListAsync();
    }

    public async Task<TuitionDto> CreateAsync(TuitionCreateDto dto)
    {
        var student = await _db.Students.FindAsync(dto.StudentId)
            ?? throw new InvalidOperationException("Sinh viên không tồn tại.");

        // Không tạo học phí trùng kỳ
        var exists = await _db.Tuitions.AnyAsync(t =>
            t.StudentId    == dto.StudentId &&
            t.AcademicYear == dto.AcademicYear &&
            t.Semester     == dto.Semester);
        if (exists)
            throw new InvalidOperationException(
                $"Sinh viên đã có học phí kỳ {dto.Semester}/{dto.AcademicYear}.");

        // Không tạo học phí cho sv đã nghỉ/bị đuổi
        if (student.Status is "dropped")
            throw new InvalidOperationException("Không thể tạo học phí cho sinh viên đã nghỉ học.");

        if (dto.Amount <= 0)
            throw new ArgumentException("Số tiền học phí phải lớn hơn 0.");

        var tuition = new Tuition
        {
            StudentId    = dto.StudentId,
            AcademicYear = dto.AcademicYear,
            Semester     = dto.Semester,
            Amount       = dto.Amount,
            DueDate      = dto.DueDate,
            Notes        = dto.Notes,
            Status       = "unpaid"
        };

        _db.Tuitions.Add(tuition);
        await _db.SaveChangesAsync();
        await _db.Entry(tuition).Reference(t => t.Student).LoadAsync();
        return ToDto(tuition);
    }

    public async Task<TuitionDto?> PayAsync(Guid id, TuitionPayDto dto)
    {
        var tuition = await _db.Tuitions
            .Include(t => t.Student)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (tuition is null) return null;

        if (tuition.Status == "paid")
            throw new InvalidOperationException("Học phí này đã được thanh toán đầy đủ.");

        if (dto.Amount <= 0)
            throw new ArgumentException("Số tiền thanh toán phải lớn hơn 0.");

        var remaining = tuition.Amount - tuition.PaidAmount;
        if (dto.Amount > remaining)
            throw new InvalidOperationException(
                $"Số tiền vượt quá số còn thiếu ({remaining:N0}đ).");

        tuition.PaidAmount += dto.Amount;
        if (dto.Notes is not null) tuition.Notes = dto.Notes;

        // Tự động cập nhật trạng thái
        tuition.Status = tuition.PaidAmount >= tuition.Amount ? "paid"
                       : tuition.PaidAmount > 0               ? "partial"
                                                              : "unpaid";

        if (tuition.Status == "paid")
            tuition.PaidDate = DateOnly.FromDateTime(DateTime.Now);

        tuition.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToDto(tuition);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var t = await _db.Tuitions.FindAsync(id);
        if (t is null) return false;
        _db.Tuitions.Remove(t);
        await _db.SaveChangesAsync();
        return true;
    }

    public static TuitionDto ToDto(Tuition t) => new(
        t.Id,
        t.StudentId, t.Student?.StudentCode ?? "", t.Student?.FullName ?? "",
        t.AcademicYear, t.Semester,
        t.Amount, t.PaidAmount, t.Amount - t.PaidAmount,
        t.DueDate, t.PaidDate, t.Status, t.Notes,
        t.UpdatedAt);
}
