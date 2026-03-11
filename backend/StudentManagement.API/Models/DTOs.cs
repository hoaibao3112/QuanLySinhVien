// Models/DTOs.cs
namespace StudentManagement.API.Models;

// ── AUTH ─────────────────────────────────────────────────────
public record LoginRequest(
    string Username,
    string Password
);

public record LoginResponse(
    string Token,
    string Username,
    string Email,
    string Role,
    DateTime ExpiresAt
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record MeResponse(
    Guid   Id,
    string Username,
    string Email,
    string Role
);

// ── PAGED ─────────────────────────────────────────────────────
public record PagedResult<T>(
    List<T> Data,
    int     Total,
    int     Page,
    int     PageSize,
    int     TotalPages
);

// ── DEPARTMENT ────────────────────────────────────────────────
public record DepartmentDto(
    Guid   Id,
    string Code,
    string Name,
    int    StudentCount,
    int    CourseCount,
    int    ClassCount
);

public record DepartmentCreateDto(
    [property: System.ComponentModel.DataAnnotations.Required] string Code,
    [property: System.ComponentModel.DataAnnotations.Required] string Name
);

// ── CLASS ─────────────────────────────────────────────────────
public record ClassDto(
    Guid    Id,
    string  Code,
    string  Name,
    Guid?   DepartmentId,
    string? DepartmentName,
    string  AcademicYear,
    int     Semester,
    int     MaxStudents,
    int     StudentCount
);

public record ClassCreateDto(
    string Code,
    string Name,
    Guid?  DepartmentId,
    string AcademicYear,
    int    Semester,
    int    MaxStudents = 40
);

public record ClassCourseDto(
    Guid    Id,
    Guid    CourseId,
    string  CourseCode,
    string  CourseName,
    int     Credits,
    string? TeacherName,
    string? Schedule,
    string? Room
);

public record ClassCourseAssignDto(
    Guid    CourseId,
    string? TeacherName,
    string? Schedule,
    string? Room
);

// ── COURSE ────────────────────────────────────────────────────
public record CourseDto(
    Guid    Id,
    string  Code,
    string  Name,
    Guid?   DepartmentId,
    string? DepartmentName,
    int     Credits,
    string? Description
);

public record CourseCreateDto(
    string  Code,
    string  Name,
    Guid?   DepartmentId,
    int     Credits,
    string? Description
);

// ── STUDENT ───────────────────────────────────────────────────
public record StudentDto(
    Guid     Id,
    string   StudentCode,
    string   FullName,
    DateOnly? DateOfBirth,
    string?  Gender,
    string?  Email,
    string?  Phone,
    string?  Address,
    string?  AvatarUrl,
    Guid?    ClassId,
    string?  ClassName,
    Guid?    DepartmentId,
    string?  DepartmentName,
    int?     EnrollmentYear,
    string   Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record StudentCreateDto(
    string   StudentCode,
    string   FullName,
    DateOnly? DateOfBirth,
    string?  Gender,
    string?  Email,
    string?  Phone,
    string?  Address,
    Guid?    ClassId,
    Guid?    DepartmentId,
    int?     EnrollmentYear,
    string   Status = "active"
);

public record StudentUpdateDto(
    string   FullName,
    DateOnly? DateOfBirth,
    string?  Gender,
    string?  Email,
    string?  Phone,
    string?  Address,
    Guid?    ClassId,
    Guid?    DepartmentId,
    int?     EnrollmentYear,
    string?  Status
);

// ── GRADE ─────────────────────────────────────────────────────
public record GradeDto(
    Guid    Id,
    Guid    StudentId,
    string  StudentCode,
    string  StudentName,
    Guid    CourseId,
    string  CourseCode,
    string  CourseName,
    Guid    ClassId,
    decimal? AssignmentScore,
    decimal? MidtermScore,
    decimal? FinalScore,
    decimal? Gpa,
    string?  LetterGrade,
    int     Semester,
    string  AcademicYear,
    DateTime UpdatedAt
);

public record GradeUpsertDto(
    Guid    StudentId,
    Guid    CourseId,
    Guid    ClassId,
    decimal? AssignmentScore,
    decimal? MidtermScore,
    decimal? FinalScore,
    int     Semester,
    string  AcademicYear
);

public record GradeUpdateDto(
    decimal? AssignmentScore,
    decimal? MidtermScore,
    decimal? FinalScore
);

// ── TUITION ───────────────────────────────────────────────────
public record TuitionDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    string   AcademicYear,
    int      Semester,
    decimal  Amount,
    decimal  PaidAmount,
    decimal  Remaining,
    DateOnly? DueDate,
    DateOnly? PaidDate,
    string   Status,
    string?  Notes,
    DateTime UpdatedAt
);

public record TuitionCreateDto(
    Guid     StudentId,
    string   AcademicYear,
    int      Semester,
    decimal  Amount,
    DateOnly? DueDate,
    string?  Notes
);

public record TuitionPayDto(
    decimal Amount,   // số tiền đóng thêm lần này
    string? Notes
);

// ── DASHBOARD ─────────────────────────────────────────────────
public record DashboardDto(
    int     TotalStudents,
    int     TotalClasses,
    int     TotalCourses,
    int     ActiveStudents,
    int     UnpaidTuitionCount,
    decimal UnpaidTuitionAmount,
    decimal AverageGpa,
    List<StatusCountDto> StudentsByStatus,
    List<TuitionSummaryDto> TuitionByStatus
);

public record StatusCountDto(string Status, int Count);
public record TuitionSummaryDto(string Status, int Count, decimal TotalAmount);

// ── INSTRUCTOR ────────────────────────────────────────────────
public record InstructorDto(
    Guid    Id,
    string  Code,
    string  FullName,
    string? Email,
    string? Phone,
    Guid?   DepartmentId,
    string? DepartmentName,
    DateTime CreatedAt
);

public record InstructorCreateDto(
    string  Code,
    string  FullName,
    string? Email,
    string? Phone,
    Guid?   DepartmentId
);

// ── ATTENDANCE ────────────────────────────────────────────────
public record AttendanceDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    Guid     ClassCourseId,
    string   CourseName,
    DateOnly CheckDate,
    string   Status,
    string?  Notes,
    DateTime CreatedAt
);

public record AttendanceMarkDto(
    Guid     StudentId,
    Guid     ClassCourseId,
    DateOnly CheckDate,
    string   Status, // present, absent, late, excused
    string?  Notes
);

public record AttendanceBulkDto(
    Guid                   ClassCourseId,
    DateOnly               CheckDate,
    List<StudentAttendanceDto> Students
);

public record StudentAttendanceDto(
    Guid    StudentId,
    string  Status // present, absent, late, excused
);

public record AttendanceStatsDto(
    int     TotalSessions,
    int     PresentCount,
    int     AbsentCount,
    int     LateCount,
    int     ExcusedCount,
    decimal AttendanceRate
);

// ── EXAM SCHEDULE ─────────────────────────────────────────────
public record ExamScheduleDto(
    Guid     Id,
    Guid     CourseId,
    string   CourseCode,
    string   CourseName,
    Guid     ClassId,
    string   ClassName,
    string   ExamType, // midterm, final, retest
    DateTime ExamDate,
    int      Duration,
    string?  Room,
    string   AcademicYear,
    int      Semester,
    string?  Notes
);

public record ExamScheduleCreateDto(
    Guid     CourseId,
    Guid     ClassId,
    string   ExamType,
    DateTime ExamDate,
    int      Duration,
    string?  Room,
    string   AcademicYear,
    int      Semester,
    string?  Notes
);

// ── SCHOLARSHIP ───────────────────────────────────────────────
public record ScholarshipDto(
    Guid     Id,
    string   Code,
    string   Name,
    string?  Description,
    decimal  Amount,
    string   Type,
    string?  Requirements,
    bool     IsActive,
    DateTime CreatedAt
);

public record ScholarshipCreateDto(
    string   Code,
    string   Name,
    string?  Description,
    decimal  Amount,
    string   Type, // academic, need-based, sponsor, government, other
    string?  Requirements,
    bool     IsActive = true
);

public record StudentScholarshipDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    Guid     ScholarshipId,
    string   ScholarshipName,
    string   AcademicYear,
    int      Semester,
    decimal  AmountReceived,
    DateOnly? AwardedDate,
    string   Status, // pending, approved, rejected, disbursed
    string?  Notes,
    DateTime CreatedAt
);

public record StudentScholarshipApplyDto(
    Guid     StudentId,
    Guid     ScholarshipId,
    string   AcademicYear,
    int      Semester,
    decimal  AmountReceived,
    string?  Notes
);

// ── DISCIPLINARY ACTION ───────────────────────────────────────
public record DisciplinaryActionDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    string   ActionType, // warning, probation, suspension, expulsion
    string   Reason,
    DateOnly ActionDate,
    DateOnly? EndDate,
    string   Status, // active, completed, cancelled
    Guid?    IssuedBy,
    string?  IssuedByName,
    string?  Notes,
    DateTime CreatedAt
);

public record DisciplinaryActionCreateDto(
    Guid     StudentId,
    string   ActionType,
    string   Reason,
    DateOnly ActionDate,
    DateOnly? EndDate,
    string?  Notes
);

// ── LEAVE REQUEST ─────────────────────────────────────────────
public record LeaveRequestDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    string   RequestType, // sick_leave, personal_leave, academic_leave, maternity_leave
    DateOnly StartDate,
    DateOnly EndDate,
    string   Reason,
    string   Status, // pending, approved, rejected, cancelled
    Guid?    ApprovedBy,
    string?  ApprovedByName,
    DateOnly? ApprovedDate,
    string?  Documents,
    string?  Notes,
    DateTime CreatedAt
);

public record LeaveRequestCreateDto(
    Guid     StudentId,
    string   RequestType,
    DateOnly StartDate,
    DateOnly EndDate,
    string   Reason,
    string?  Documents,
    string?  Notes
);

// ── STUDENT DOCUMENT ──────────────────────────────────────────
public record StudentDocumentDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    string   DocumentType, // transcript, certificate, id_card, diploma, recommendation, other
    string   DocumentName,
    string?  FileUrl,
    DateOnly? IssuedDate,
    DateOnly? ExpiryDate,
    string?  Notes,
    Guid?    UploadedBy,
    string?  UploadedByName,
    DateTime CreatedAt
);

public record StudentDocumentUploadDto(
    Guid     StudentId,
    string   DocumentType,
    string   DocumentName,
    string   FileUrl,
    DateOnly? IssuedDate,
    DateOnly? ExpiryDate,
    string?  Notes
);

// ── COURSE EVALUATION ─────────────────────────────────────────
public record CourseEvaluationDto(
    Guid    Id,
    Guid    StudentId,
    string  StudentCode,
    string  StudentName,
    Guid    CourseId,
    string  CourseCode,
    string  CourseName,
    Guid?   InstructorId,
    string? InstructorName,
    Guid    ClassId,
    string  ClassName,
    string  AcademicYear,
    int     Semester,
    int?    ContentRating,
    int?    TeachingRating,
    int?    MaterialRating,
    int?    OverallRating,
    string? Comments,
    bool    IsAnonymous,
    DateTime CreatedAt
);

public record CourseEvaluationCreateDto(
    Guid    StudentId,
    Guid    CourseId,
    Guid?   InstructorId,
    Guid    ClassId,
    string  AcademicYear,
    int     Semester,
    int     ContentRating,
    int     TeachingRating,
    int     MaterialRating,
    int     OverallRating,
    string? Comments,
    bool    IsAnonymous = true
);

// ── FACILITY ──────────────────────────────────────────────────
public record FacilityDto(
    Guid     Id,
    string   Code,
    string   Name,
    string   Type, // classroom, lab, library, auditorium, sports, other
    string?  Building,
    int?     Floor,
    int?     Capacity,
    string?  Equipment,
    string   Status, // available, occupied, maintenance, unavailable
    string?  Notes,
    DateTime CreatedAt
);

public record FacilityCreateDto(
    string   Code,
    string   Name,
    string   Type,
    string?  Building,
    int?     Floor,
    int?     Capacity,
    string?  Equipment,
    string   Status = "available",
    string?  Notes
);

public record FacilityBookingDto(
    Guid     Id,
    Guid     FacilityId,
    string   FacilityName,
    string   FacilityCode,
    Guid?    BookedBy,
    string?  BookedByName,
    string   Purpose,
    DateTime StartTime,
    DateTime EndTime,
    string   Status, // pending, approved, rejected, cancelled, completed
    string?  Notes,
    DateTime CreatedAt
);

public record FacilityBookingCreateDto(
    Guid     FacilityId,
    string   Purpose,
    DateTime StartTime,
    DateTime EndTime,
    string?  Notes
);

// ── ANNOUNCEMENT ──────────────────────────────────────────────
public record AnnouncementDto(
    Guid     Id,
    string   Title,
    string   Content,
    string   Type, // general, academic, event, deadline, urgent
    string?  TargetGroup, // all, department, class
    Guid?    TargetId,
    Guid?    PublishedBy,
    string?  PublishedByName,
    DateTime PublishedAt,
    DateTime? ExpiresAt,
    bool     IsPinned,
    string?  Attachments,
    DateTime CreatedAt
);

public record AnnouncementCreateDto(
    string   Title,
    string   Content,
    string   Type,
    string?  TargetGroup,
    Guid?    TargetId,
    DateTime? ExpiresAt,
    bool     IsPinned = false,
    string?  Attachments
);

// ── STUDENT REGISTRATION ──────────────────────────────────────
public record StudentRegistrationDto(
    Guid     Id,
    Guid     StudentId,
    string   StudentCode,
    string   StudentName,
    Guid     ClassCourseId,
    string   CourseCode,
    string   CourseName,
    string   ClassName,
    string   AcademicYear,
    int      Semester,
    DateTime RegistrationDate,
    string   Status, // registered, approved, cancelled, dropped
    string?  Notes,
    DateTime CreatedAt
);

public record StudentRegistrationCreateDto(
    Guid   StudentId,
    Guid   ClassCourseId,
    string AcademicYear,
    int    Semester,
    string? Notes
);

// ── STANDARD RESPONSES ────────────────────────────────────────
public record ApiResponse<T>(
    bool   Success,
    T?     Data,
    string? Message = null,
    List<string>? Errors = null
);

public record ApiError(
    int     StatusCode,
    string  Message,
    List<string>? Errors = null,
    DateTime Timestamp = default
)
{
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
};
