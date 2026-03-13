using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Data;
using StudentManagement.API.Models;

namespace StudentManagement.API.Services;

public class FacilityService
{
    private readonly AppDbContext _context;

    public FacilityService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FacilityDto>> GetAllAsync(string? type = null)
    {
        var query = _context.Set<Facility>().AsQueryable();

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(f => f.Type == type);
        }

        var facilities = await query.OrderBy(f => f.Code).ToListAsync();

        return facilities.Select(f => new FacilityDto(
            f.Id,
            f.Code,
            f.Name,
            f.Type,
            f.Building,
            f.Floor,
            f.Capacity,
            f.Equipment,
            f.Status,
            f.Notes,
            f.CreatedAt
        )).ToList();
    }

    public async Task<FacilityDto?> GetByIdAsync(Guid id)
    {
        var f = await _context.Set<Facility>().FindAsync(id);
        if (f == null) return null;

        return new FacilityDto(
            f.Id,
            f.Code,
            f.Name,
            f.Type,
            f.Building,
            f.Floor,
            f.Capacity,
            f.Equipment,
            f.Status,
            f.Notes,
            f.CreatedAt
        );
    }
}
