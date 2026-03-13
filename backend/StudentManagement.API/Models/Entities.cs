// Models/Entities.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.API.Models;

// ── USERS ────────────────────────────────────────────────────
[Table("users")]
public class User
{
    [Column("id")]            public Guid    Id           { get; set; } = Guid.NewGuid();
    [Column("username")]      public string  Username     { get; set; } = "";
    [Column("email")]         public string  Email        { get; set; } = "";
    [Column("password_hash")] public string  PasswordHash { get; set; } = "";
    [Column("role")]          public string  Role         { get; set; } = "staff";
    [Column("is_active")]     public bool    IsActive     { get; set; } = true;
    [Column("created_at")]    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
    [Column("updated_at")]    public DateTime UpdatedAt   { get; set; } = DateTime.UtcNow;
}

// ── DEPARTMENTS ──────────────────────────────────────────────
[Table("departments")]
public class Department
{
    [Column("id")]         public Guid     Id        { get; set; } = Guid.NewGuid();
    [Column("code")]       public string   Code      { get; set; } = "";
    [Column("name")]       public string   Name      { get; set; } = "";
    [Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Class>   Classes  { get; set; } = new List<Class>();
    public ICollection<Course>  Courses  { get; set; } = new List<Course>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}

// ── CLASSES ──────────────────────────────────────────────────
[Table("classes")]
public class Class
{
    [Column("id")]            public Guid    Id           { get; set; } = Guid.NewGuid();
    [Column("code")]          public string  Code         { get; set; } = "";
    [Column("name")]          public string  Name         { get; set; } = "";
    [Column("department_id")] public Guid?   DepartmentId { get; set; }
    [Column("academic_year")] public string  AcademicYear { get; set; } = "";
    [Column("semester")]      public int     Semester     { get; set; }
    [Column("max_students")]  public int     MaxStudents  { get; set; } = 40;
    [Column("created_at")]    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;

    public Department?             Department   { get; set; }
    public ICollection<Student>    Students     { get; set; } = new List<Student>();
    public ICollection<ClassCourse> ClassCourses { get; set; } = new List<ClassCourse>();
}

// ── COURSES ──────────────────────────────────────────────────
[Table("courses")]
public class Course
{
    [Column("id")]            public Guid    Id           { get; set; } = Guid.NewGuid();
    [Column("code")]          public string  Code         { get; set; } = "";
    [Column("name")]          public string  Name         { get; set; } = "";
    [Column("department_id")] public Guid?   DepartmentId { get; set; }
    [Column("credits")]       public int     Credits      { get; set; } = 3;
    [Column("description")]   public string? Description  { get; set; }
    [Column("created_at")]    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;

    public Department?              Department   { get; set; }
    public ICollection<ClassCourse> ClassCourses { get; set; } = new List<ClassCourse>();
    public ICollection<Grade>       Grades       { get; set; } = new List<Grade>();
}

// ── STUDENTS ─────────────────────────────────────────────────
[Table("students")]
public class Student
{
    [Column("id")]              public Guid     Id             { get; set; } = Guid.NewGuid();
    [Column("student_code")]    public string   StudentCode    { get; set; } = "";
    [Column("full_name")]       public string   FullName       { get; set; } = "";
    [Column("date_of_birth")]   public DateOnly? DateOfBirth   { get; set; }
    [Column("gender")]          public string?  Gender         { get; set; }
    [Column("email")]           public string?  Email          { get; set; }
    [Column("phone")]           public string?  Phone          { get; set; }
    [Column("address")]         public string?  Address        { get; set; }
    [Column("avatar_url")]      public string?  AvatarUrl      { get; set; }
    [Column("class_id")]        public Guid?    ClassId        { get; set; }
    [Column("department_id")]   public Guid?    DepartmentId   { get; set; }
    [Column("enrollment_year")] public int?     EnrollmentYear { get; set; }
    [Column("status")]          public string   Status         { get; set; } = "active";
    [Column("created_at")]      public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;
    [Column("updated_at")]      public DateTime UpdatedAt      { get; set; } = DateTime.UtcNow;

    public Class?               Class    { get; set; }
    public Department?          Department { get; set; }
    public ICollection<Grade>   Grades   { get; set; } = new List<Grade>();
    public ICollection<Tuition> Tuitions { get; set; } = new List<Tuition>();
}

// ── CLASS_COURSES ─────────────────────────────────────────────
[Table("class_courses")]
public class ClassCourse
{
    [Column("id")]           public Guid    Id          { get; set; } = Guid.NewGuid();
    [Column("class_id")]     public Guid    ClassId     { get; set; }
    [Column("course_id")]    public Guid    CourseId    { get; set; }
    [Column("teacher_name")] public string? TeacherName { get; set; }
    [Column("schedule")]     public string? Schedule    { get; set; }
    [Column("room")]         public string? Room        { get; set; }
    [Column("registration_period_id")] public Guid? RegistrationPeriodId { get; set; }

    public Class?             Class              { get; set; }
    public Course?            Course             { get; set; }
    public RegistrationPeriod? RegistrationPeriod { get; set; }
}

// ── GRADES ────────────────────────────────────────────────────
[Table("grades")]
public class Grade
{
    [Column("id")]               public Guid     Id              { get; set; } = Guid.NewGuid();
    [Column("student_id")]       public Guid     StudentId       { get; set; }
    [Column("course_id")]        public Guid     CourseId        { get; set; }
    [Column("class_id")]         public Guid     ClassId         { get; set; }
    [Column("assignment_score")] public decimal? AssignmentScore { get; set; }
    [Column("midterm_score")]    public decimal? MidtermScore    { get; set; }
    [Column("final_score")]      public decimal? FinalScore      { get; set; }
    [Column("gpa")]              public decimal? Gpa             { get; set; }   // computed by DB
    [Column("letter_grade")]     public string?  LetterGrade     { get; set; }
    [Column("semester")]         public int      Semester        { get; set; }
    [Column("academic_year")]    public string   AcademicYear    { get; set; } = "";
    [Column("created_at")]       public DateTime CreatedAt       { get; set; } = DateTime.UtcNow;
    [Column("updated_at")]       public DateTime UpdatedAt       { get; set; } = DateTime.UtcNow;

    public Student? Student { get; set; }
    public Course?  Course  { get; set; }
    public Class?   Class   { get; set; }
}

// ── TUITION ───────────────────────────────────────────────────
[Table("tuition")]
public class Tuition
{
    [Column("id")]            public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("student_id")]    public Guid     StudentId    { get; set; }
    [Column("academic_year")] public string   AcademicYear { get; set; } = "";
    [Column("semester")]      public int      Semester     { get; set; }
    [Column("amount")]        public decimal  Amount       { get; set; }
    [Column("paid_amount")]   public decimal  PaidAmount   { get; set; } = 0;
    [Column("due_date")]      public DateOnly? DueDate     { get; set; }
    [Column("paid_date")]     public DateOnly? PaidDate    { get; set; }
    [Column("status")]        public string   Status       { get; set; } = "unpaid";
    [Column("notes")]         public string?  Notes        { get; set; }
    [Column("created_at")]    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;
    [Column("updated_at")]    public DateTime UpdatedAt    { get; set; } = DateTime.UtcNow;

    public Student? Student { get; set; }
}

// ── INSTRUCTORS ───────────────────────────────────────────────
[Table("instructors")]
public class Instructor
{
    [Column("id")]            public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("code")]          public string   Code         { get; set; } = "";
    [Column("full_name")]     public string   FullName     { get; set; } = "";
    [Column("email")]         public string?  Email        { get; set; }
    [Column("phone")]         public string?  Phone        { get; set; }
    [Column("department_id")] public Guid?    DepartmentId { get; set; }
    [Column("created_at")]    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public Department? Department { get; set; }
}

// ── ATTENDANCE ────────────────────────────────────────────────
[Table("attendance")]
public class Attendance
{
    [Column("id")]              public Guid     Id            { get; set; } = Guid.NewGuid();
    [Column("student_id")]      public Guid     StudentId     { get; set; }
    [Column("class_course_id")] public Guid     ClassCourseId { get; set; }
    [Column("check_date")]      public DateOnly CheckDate     { get; set; }
    [Column("status")]          public string   Status        { get; set; } = "present";
    [Column("notes")]           public string?  Notes         { get; set; }
    [Column("created_at")]      public DateTime CreatedAt     { get; set; } = DateTime.UtcNow;

    public Student?     Student     { get; set; }
    public ClassCourse? ClassCourse { get; set; }
}

// ── EXAM_SCHEDULES ────────────────────────────────────────────
[Table("exam_schedules")]
public class ExamSchedule
{
    [Column("id")]            public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("course_id")]     public Guid     CourseId     { get; set; }
    [Column("class_id")]      public Guid     ClassId      { get; set; }
    [Column("exam_type")]     public string   ExamType     { get; set; } = "";
    [Column("exam_date")]     public DateTime ExamDate     { get; set; }
    [Column("duration")]      public int      Duration     { get; set; }
    [Column("room")]          public string?  Room         { get; set; }
    [Column("academic_year")] public string   AcademicYear { get; set; } = "";
    [Column("semester")]      public int      Semester     { get; set; }
    [Column("notes")]         public string?  Notes        { get; set; }
    [Column("created_at")]    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public Course? Course { get; set; }
    public Class?  Class  { get; set; }
}

// ── SCHOLARSHIPS ──────────────────────────────────────────────
[Table("scholarships")]
public class Scholarship
{
    [Column("id")]           public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("code")]         public string   Code         { get; set; } = "";
    [Column("name")]         public string   Name         { get; set; } = "";
    [Column("description")]  public string?  Description  { get; set; }
    [Column("amount")]       public decimal  Amount       { get; set; }
    [Column("type")]         public string   Type         { get; set; } = "";
    [Column("requirements")] public string?  Requirements { get; set; }
    [Column("is_active")]    public bool     IsActive     { get; set; } = true;
    [Column("created_at")]   public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public ICollection<StudentScholarship> StudentScholarships { get; set; } = new List<StudentScholarship>();
}

// ── STUDENT_SCHOLARSHIPS ──────────────────────────────────────
[Table("student_scholarships")]
public class StudentScholarship
{
    [Column("id")]              public Guid     Id              { get; set; } = Guid.NewGuid();
    [Column("student_id")]      public Guid     StudentId       { get; set; }
    [Column("scholarship_id")]  public Guid     ScholarshipId   { get; set; }
    [Column("academic_year")]   public string   AcademicYear    { get; set; } = "";
    [Column("semester")]        public int      Semester        { get; set; }
    [Column("amount_received")] public decimal  AmountReceived  { get; set; }
    [Column("awarded_date")]    public DateOnly? AwardedDate    { get; set; }
    [Column("status")]          public string   Status          { get; set; } = "pending";
    [Column("notes")]           public string?  Notes           { get; set; }
    [Column("created_at")]      public DateTime CreatedAt       { get; set; } = DateTime.UtcNow;

    public Student?     Student     { get; set; }
    public Scholarship? Scholarship { get; set; }
}

// ── DISCIPLINARY_ACTIONS ──────────────────────────────────────
[Table("disciplinary_actions")]
public class DisciplinaryAction
{
    [Column("id")]          public Guid     Id         { get; set; } = Guid.NewGuid();
    [Column("student_id")]  public Guid     StudentId  { get; set; }
    [Column("action_type")] public string   ActionType { get; set; } = "";
    [Column("reason")]      public string   Reason     { get; set; } = "";
    [Column("action_date")] public DateOnly ActionDate { get; set; }
    [Column("end_date")]    public DateOnly? EndDate   { get; set; }
    [Column("status")]      public string   Status     { get; set; } = "active";
    [Column("issued_by")]   public Guid?    IssuedBy   { get; set; }
    [Column("notes")]       public string?  Notes      { get; set; }
    [Column("created_at")]  public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;

    public Student? Student  { get; set; }
    public User?    IssuedByUser { get; set; }
}

// ── LEAVE_REQUESTS ────────────────────────────────────────────
[Table("leave_requests")]
public class LeaveRequest
{
    [Column("id")]            public Guid     Id            { get; set; } = Guid.NewGuid();
    [Column("student_id")]    public Guid     StudentId     { get; set; }
    [Column("request_type")]  public string   RequestType   { get; set; } = "";
    [Column("start_date")]    public DateOnly StartDate     { get; set; }
    [Column("end_date")]      public DateOnly EndDate       { get; set; }
    [Column("reason")]        public string   Reason        { get; set; } = "";
    [Column("status")]        public string   Status        { get; set; } = "pending";
    [Column("approved_by")]   public Guid?    ApprovedBy    { get; set; }
    [Column("approved_date")] public DateOnly? ApprovedDate { get; set; }
    [Column("documents")]     public string?  Documents     { get; set; }
    [Column("notes")]         public string?  Notes         { get; set; }
    [Column("created_at")]    public DateTime CreatedAt     { get; set; } = DateTime.UtcNow;

    public Student? Student      { get; set; }
    public User?    ApprovedByUser { get; set; }
}

// ── STUDENT_DOCUMENTS ─────────────────────────────────────────
[Table("student_documents")]
public class StudentDocument
{
    [Column("id")]            public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("student_id")]    public Guid     StudentId    { get; set; }
    [Column("document_type")] public string   DocumentType { get; set; } = "";
    [Column("document_name")] public string   DocumentName { get; set; } = "";
    [Column("file_url")]      public string?  FileUrl      { get; set; }
    [Column("issued_date")]   public DateOnly? IssuedDate  { get; set; }
    [Column("expiry_date")]   public DateOnly? ExpiryDate  { get; set; }
    [Column("notes")]         public string?  Notes        { get; set; }
    [Column("uploaded_by")]   public Guid?    UploadedBy   { get; set; }
    [Column("created_at")]    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public Student? Student        { get; set; }
    public User?    UploadedByUser { get; set; }
}

// ── COURSE_EVALUATIONS ────────────────────────────────────────
[Table("course_evaluations")]
public class CourseEvaluation
{
    [Column("id")]              public Guid     Id             { get; set; } = Guid.NewGuid();
    [Column("student_id")]      public Guid     StudentId      { get; set; }
    [Column("course_id")]       public Guid     CourseId       { get; set; }
    [Column("instructor_id")]   public Guid?    InstructorId   { get; set; }
    [Column("class_id")]        public Guid     ClassId        { get; set; }
    [Column("academic_year")]   public string   AcademicYear   { get; set; } = "";
    [Column("semester")]        public int      Semester       { get; set; }
    [Column("content_rating")]  public int?     ContentRating  { get; set; }
    [Column("teaching_rating")] public int?     TeachingRating { get; set; }
    [Column("material_rating")] public int?     MaterialRating { get; set; }
    [Column("overall_rating")]  public int?     OverallRating  { get; set; }
    [Column("comments")]        public string?  Comments       { get; set; }
    [Column("is_anonymous")]    public bool     IsAnonymous    { get; set; } = true;
    [Column("created_at")]      public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;

    public Student?    Student    { get; set; }
    public Course?     Course     { get; set; }
    public Instructor? Instructor { get; set; }
    public Class?      Class      { get; set; }
}

// ── FACILITIES ────────────────────────────────────────────────
[Table("facilities")]
public class Facility
{
    [Column("id")]        public Guid     Id        { get; set; } = Guid.NewGuid();
    [Column("code")]      public string   Code      { get; set; } = "";
    [Column("name")]      public string   Name      { get; set; } = "";
    [Column("type")]      public string   Type      { get; set; } = "";
    [Column("building")]  public string?  Building  { get; set; }
    [Column("floor")]     public int?     Floor     { get; set; }
    [Column("capacity")]  public int?     Capacity  { get; set; }
    [Column("equipment")] public string?  Equipment { get; set; }
    [Column("status")]    public string   Status    { get; set; } = "available";
    [Column("notes")]     public string?  Notes     { get; set; }
    [Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<FacilityBooking> Bookings { get; set; } = new List<FacilityBooking>();
}

// ── FACILITY_BOOKINGS ─────────────────────────────────────────
[Table("facility_bookings")]
public class FacilityBooking
{
    [Column("id")]          public Guid     Id         { get; set; } = Guid.NewGuid();
    [Column("facility_id")] public Guid     FacilityId { get; set; }
    [Column("booked_by")]   public Guid?    BookedBy   { get; set; }
    [Column("purpose")]     public string   Purpose    { get; set; } = "";
    [Column("start_time")]  public DateTime StartTime  { get; set; }
    [Column("end_time")]    public DateTime EndTime    { get; set; }
    [Column("status")]      public string   Status     { get; set; } = "pending";
    [Column("notes")]       public string?  Notes      { get; set; }
    [Column("created_at")]  public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;

    public Facility? Facility      { get; set; }
    public User?     BookedByUser  { get; set; }
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────
[Table("announcements")]
public class Announcement
{
    [Column("id")]           public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("title")]        public string   Title        { get; set; } = "";
    [Column("content")]      public string   Content      { get; set; } = "";
    [Column("type")]         public string   Type         { get; set; } = "";
    [Column("target_group")] public string?  TargetGroup  { get; set; }
    [Column("target_id")]    public Guid?    TargetId     { get; set; }
    [Column("published_by")] public Guid?    PublishedBy  { get; set; }
    [Column("published_at")] public DateTime PublishedAt  { get; set; } = DateTime.UtcNow;
    [Column("expires_at")]   public DateTime? ExpiresAt   { get; set; }
    [Column("is_pinned")]    public bool     IsPinned     { get; set; } = false;
    [Column("attachments")]  public string?  Attachments  { get; set; }
    [Column("created_at")]   public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public User? PublishedByUser { get; set; }
}

// ── STUDENT_REGISTRATIONS ─────────────────────────────────────
[Table("student_registrations")]
public class StudentRegistration
{
    [Column("id")]                public Guid     Id                { get; set; } = Guid.NewGuid();
    [Column("student_id")]        public Guid     StudentId         { get; set; }
    [Column("class_course_id")]   public Guid?    ClassCourseId     { get; set; }
    [Column("semester_course_id")] public Guid?   SemesterCourseId  { get; set; }
    [Column("academic_year")]     public string   AcademicYear      { get; set; } = "";
    [Column("semester")]          public int      Semester          { get; set; }
    [Column("registration_date")] public DateTime RegistrationDate  { get; set; } = DateTime.UtcNow;
    [Column("status")]            public string   Status            { get; set; } = "registered";
    [Column("notes")]             public string?  Notes             { get; set; }
    [Column("created_at")]        public DateTime CreatedAt         { get; set; } = DateTime.UtcNow;

    public Student?     Student     { get; set; }
    public ClassCourse? ClassCourse { get; set; }
    public SemesterCourse? SemesterCourse { get; set; }
}

// ── REGISTRATION_PERIODS ──────────────────────────────────────
[Table("registration_periods")]
public class RegistrationPeriod
{
    [Column("id")]            public Guid     Id           { get; set; } = Guid.NewGuid();
    [Column("name")]          public string   Name         { get; set; } = "";
    [Column("academic_year")] public string   AcademicYear { get; set; } = "";
    [Column("semester")]      public int      Semester     { get; set; }
    [Column("start_at")]      public DateTime StartAt      { get; set; }
    [Column("end_at")]        public DateTime EndAt        { get; set; }
    [Column("status")]        public string   Status       { get; set; } = "upcoming";
    [Column("description")]   public string?  Description  { get; set; }
    [Column("created_at")]    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public ICollection<SemesterCourse> SemesterCourses { get; set; } = new List<SemesterCourse>();
    public ICollection<ClassCourse>    ClassCourses    { get; set; } = new List<ClassCourse>();
}

// ── SEMESTER_COURSES ──────────────────────────────────────────
[Table("semester_courses")]
public class SemesterCourse
{
    [Column("id")]                     public Guid     Id                     { get; set; } = Guid.NewGuid();
    [Column("registration_period_id")] public Guid     RegistrationPeriodId   { get; set; }
    [Column("course_id")]              public Guid     CourseId               { get; set; }
    [Column("teacher_name")]            public string?  TeacherName            { get; set; }
    [Column("schedule")]                public string?  Schedule               { get; set; }
    [Column("room")]                    public string?  Room                   { get; set; }
    [Column("total_periods")]           public int?     TotalPeriods           { get; set; }
    [Column("periods_per_session")]     public int?     PeriodsPerSession      { get; set; }
    [Column("max_students")]            public int      MaxStudents            { get; set; } = 40;
    [Column("is_active")]              public bool     IsActive               { get; set; } = true;
    [Column("created_at")]             public DateTime CreatedAt              { get; set; } = DateTime.UtcNow;

    public RegistrationPeriod? RegistrationPeriod { get; set; }
    public Course?            Course             { get; set; }
}

