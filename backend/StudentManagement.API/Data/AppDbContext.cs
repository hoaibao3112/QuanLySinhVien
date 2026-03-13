// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using StudentManagement.API.Models;

namespace StudentManagement.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Original DbSets
    public DbSet<User>        Users        => Set<User>();
    public DbSet<Department>  Departments  => Set<Department>();
    public DbSet<Class>       Classes      => Set<Class>();
    public DbSet<Course>      Courses      => Set<Course>();
    public DbSet<Student>     Students     => Set<Student>();
    public DbSet<ClassCourse> ClassCourses => Set<ClassCourse>();
    public DbSet<Grade>       Grades       => Set<Grade>();
    public DbSet<Tuition>     Tuitions     => Set<Tuition>();

    // New DbSets for expanded modules
    public DbSet<Instructor>           Instructors           => Set<Instructor>();
    public DbSet<Attendance>           Attendances           => Set<Attendance>();
    public DbSet<ExamSchedule>         ExamSchedules         => Set<ExamSchedule>();
    public DbSet<Scholarship>          Scholarships          => Set<Scholarship>();
    public DbSet<StudentScholarship>   StudentScholarships   => Set<StudentScholarship>();
    public DbSet<DisciplinaryAction>   DisciplinaryActions   => Set<DisciplinaryAction>();
    public DbSet<LeaveRequest>         LeaveRequests         => Set<LeaveRequest>();
    public DbSet<StudentDocument>      StudentDocuments      => Set<StudentDocument>();
    public DbSet<CourseEvaluation>     CourseEvaluations     => Set<CourseEvaluation>();
    public DbSet<Facility>             Facilities            => Set<Facility>();
    public DbSet<FacilityBooking>      FacilityBookings      => Set<FacilityBooking>();
    public DbSet<Announcement>         Announcements         => Set<Announcement>();
    public DbSet<StudentRegistration>  StudentRegistrations  => Set<StudentRegistration>();
    public DbSet<RegistrationPeriod>   RegistrationPeriods   => Set<RegistrationPeriod>();
    public DbSet<SemesterCourse>       SemesterCourses       => Set<SemesterCourse>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // USER
        b.Entity<User>(e => {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // DEPARTMENT
        b.Entity<Department>(e => {
            e.HasIndex(d => d.Code).IsUnique();
        });

        // CLASS
        b.Entity<Class>(e => {
            e.HasIndex(c => c.Code).IsUnique();
            e.HasOne(c => c.Department)
             .WithMany(d => d.Classes)
             .HasForeignKey(c => c.DepartmentId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // COURSE
        b.Entity<Course>(e => {
            e.HasIndex(c => c.Code).IsUnique();
            e.HasOne(c => c.Department)
             .WithMany(d => d.Courses)
             .HasForeignKey(c => c.DepartmentId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // STUDENT
        b.Entity<Student>(e => {
            e.HasIndex(s => s.StudentCode).IsUnique();
            e.HasIndex(s => s.Email).IsUnique();
            e.HasOne(s => s.Class)
             .WithMany(c => c.Students)
             .HasForeignKey(s => s.ClassId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(s => s.Department)
             .WithMany(d => d.Students)
             .HasForeignKey(s => s.DepartmentId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // CLASS_COURSE
        b.Entity<ClassCourse>(e => {
            e.HasIndex(cc => new { cc.ClassId, cc.CourseId }).IsUnique();
            e.HasOne(cc => cc.Class)
             .WithMany(c => c.ClassCourses)
             .HasForeignKey(cc => cc.ClassId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(cc => cc.Course)
             .WithMany(c => c.ClassCourses)
             .HasForeignKey(cc => cc.CourseId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(cc => cc.RegistrationPeriod)
             .WithMany(rp => rp.ClassCourses)
             .HasForeignKey(cc => cc.RegistrationPeriodId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // REGISTRATION_PERIOD
        b.Entity<RegistrationPeriod>(e => {
            e.HasIndex(rp => new { rp.AcademicYear, rp.Semester, rp.Name }).IsUnique();
        });

        // SEMESTER_COURSE
        b.Entity<SemesterCourse>(e => {
            e.HasIndex(sc => new { sc.RegistrationPeriodId, sc.CourseId }).IsUnique();
            e.HasOne(sc => sc.RegistrationPeriod)
             .WithMany(rp => rp.SemesterCourses)
             .HasForeignKey(sc => sc.RegistrationPeriodId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(sc => sc.Course)
             .WithMany()
             .HasForeignKey(sc => sc.CourseId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // GRADE - gpa là computed column từ DB, EF không ghi
        b.Entity<Grade>(e => {
            e.HasIndex(g => new { g.StudentId, g.CourseId, g.AcademicYear, g.Semester }).IsUnique();
            e.Property(g => g.Gpa)
             .HasComputedColumnSql(
                "ROUND((COALESCE(assignment_score,0)*0.2 + COALESCE(midterm_score,0)*0.3 + COALESCE(final_score,0)*0.5)::NUMERIC, 2)",
                stored: true);
            e.HasOne(g => g.Student)
             .WithMany(s => s.Grades)
             .HasForeignKey(g => g.StudentId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(g => g.Course)
             .WithMany(c => c.Grades)
             .HasForeignKey(g => g.CourseId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // TUITION
        b.Entity<Tuition>(e => {
            e.HasIndex(t => new { t.StudentId, t.AcademicYear, t.Semester }).IsUnique();
            e.HasOne(t => t.Student)
             .WithMany(s => s.Tuitions)
             .HasForeignKey(t => t.StudentId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
