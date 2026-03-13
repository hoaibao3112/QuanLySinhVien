using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.API.Models;
using StudentManagement.API.Services;

namespace StudentManagement.API.Controllers;

[ApiController]
[Route("api/facilities")]
[Authorize]
public class FacilitiesController : ControllerBase
{
    private readonly FacilityService _facilityService;

    public FacilitiesController(FacilityService facilityService)
    {
        _facilityService = facilityService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<FacilityDto>>>> GetAll([FromQuery] string? type)
    {
        var result = await _facilityService.GetAllAsync(type);
        return Ok(new ApiResponse<List<FacilityDto>>(true, result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<FacilityDto>>> GetById(Guid id)
    {
        var facility = await _facilityService.GetByIdAsync(id);
        if (facility == null)
            return NotFound(new ApiResponse<FacilityDto>(false, null, "Facility not found"));

        return Ok(new ApiResponse<FacilityDto>(true, facility));
    }
}
