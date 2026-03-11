# API QUICK START GUIDE

## 🚀 Getting Started

### 1. Setup & Configuration

#### Update Program.cs
Add new services to dependency injection:

```csharp
// Add to Program.cs after existing services:
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddScoped<InstructorService>();
builder.Services.AddScoped<ExamScheduleService>();
builder.Services.AddScoped<ScholarshipService>();
builder.Services.AddScoped<StudentRegistrationService>();
// Add more services as you implement them
```

#### Update AppDbContext
Add new DbSets in `Data/AppDbContext.cs`:

```csharp
public DbSet<Instructor> Instructors => Set<Instructor>();
public DbSet<Attendance> Attendances => Set<Attendance>();
public DbSet<ExamSchedule> ExamSchedules => Set<ExamSchedule>();
public DbSet<Scholarship> Scholarships => Set<Scholarship>();
public DbSet<StudentScholarship> StudentScholarships => Set<StudentScholarship>();
public DbSet<DisciplinaryAction> DisciplinaryActions => Set<DisciplinaryAction>();
public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
public DbSet<StudentDocument> StudentDocuments => Set<StudentDocument>();
public DbSet<CourseEvaluation> CourseEvaluations => Set<CourseEvaluation>();
public DbSet<Facility> Facilities => Set<Facility>();
public DbSet<FacilityBooking> FacilityBookings => Set<FacilityBooking>();
public DbSet<Announcement> Announcements => Set<Announcement>();
public DbSet<StudentRegistration> StudentRegistrations => Set<StudentRegistration>();
```

### 2. Database Migration

Run migrations to create new tables:

```bash
# Create migration
dotnet ef migrations add AddNewModules

# Apply to database
dotnet ef database update
```

---

## 📚 API MODULES IMPLEMENTED

### ✅ Module 1: Authentication & Users
**Status:** Already implemented
- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/change-password

### ✅ Module 2: Attendance Management
**Controller:** `AttendanceController.cs`
**Service:** `AttendanceService.cs`

**Endpoints:**
```http
GET    /api/attendance                      # List with filters
GET    /api/attendance/{id}                 # Get by ID
POST   /api/attendance                      # Mark single attendance
POST   /api/attendance/bulk                 # Mark multiple students
PUT    /api/attendance/{id}                 # Update attendance
DELETE /api/attendance/{id}                 # Delete attendance
GET    /api/attendance/statistics/{studentId} # Student stats
GET    /api/attendance/class-course/{id}    # By class-course
GET    /api/attendance/student/{studentId}  # Student history
GET    /api/attendance/report/absences      # Absence report
```

**Example Usage:**

```json
// Mark single attendance
POST /api/attendance
{
  "studentId": "50000000-0000-0000-0000-000000000001",
  "classCourseId": "cc000001-0000-0000-0000-000000000000",
  "checkDate": "2024-03-11",
  "status": "present",
  "notes": ""
}

// Mark bulk attendance
POST /api/attendance/bulk
{
  "classCourseId": "cc000001-0000-0000-0000-000000000000",
  "checkDate": "2024-03-11",
  "students": [
    { "studentId": "50000000-0000-0000-0000-000000000001", "status": "present" },
    { "studentId": "50000000-0000-0000-0000-000000000002", "status": "absent" },
    { "studentId": "50000000-0000-0000-0000-000000000003", "status": "late" }
  ]
}

// Get attendance statistics
GET /api/attend ance/statistics/50000000-0000-0000-0000-000000000001
Response:
{
  "totalSessions": 20,
  "presentCount": 18,
  "absentCount": 2,
  "lateCount": 0,
  "excusedCount": 0,
  "attendanceRate": 90.00
}
```

**Business Rules:**
- ✅ Can mark up to 7 days in past
- ✅ Cannot mark for future dates
- ✅ Status: present, absent, late, excused
- ✅ Auto-check absence rate: >20% = Warning, >30% = Cannot take final exam
- ✅ Unique: (student_id, class_course_id, check_date)

---

### ✅ Module 3: Instructor Management
**Controller:** `InstructorsController.cs`
**Service:** `InstructorService.cs`

**Endpoints:**
```http
GET    /api/instructors                 # List with search & filters
GET    /api/instructors/{id}            # Get by ID
POST   /api/instructors                 # Create instructor
PUT    /api/instructors/{id}            # Update instructor
DELETE /api/instructors/{id}            # Delete instructor
GET    /api/instructors/{id}/schedule   # Teaching schedule
GET    /api/instructors/{id}/classes    # Assigned classes
GET    /api/instructors/{id}/evaluations # Course evaluations
```

**Example Usage:**

```json
// Create instructor
POST /api/instructors
{
  "code": "GV006",
  "fullName": "ThS. Phạm Văn Hùng",
  "email": "hung.pv@edu.vn",
  "phone": "0912000006",
  "departmentId": "d0000000-0000-0000-0000-000000000001"
}

// Get instructor evaluations
GET /api/instructors/{id}/evaluations?academicYear=2023-2024&semester=1
Response:
{
  "instructorId": "...",
  "instructorName": "ThS. Phạm Văn Hùng",
  "totalEvaluations": 45,
  "averageRatings": {
    "content": 4.5,
    "teaching": 4.7,
    "material": 4.3,
    "overall": 4.5
  },
  "evaluations": [...]
}
```

---

## 🔨 TO IMPLEMENT NEXT

### Module 4: Exam Schedules
Create files:
- `Controllers/ExamSchedulesController.cs`
- `Services/ExamScheduleService.cs`

**Endpoints to implement:**
```http
GET    /api/exam-schedules
GET    /api/exam-schedules/{id}
POST   /api/exam-schedules
PUT    /api/exam-schedules/{id}
DELETE /api/exam-schedules/{id}
GET    /api/exam-schedules/semester/{year}/{semester}
GET    /api/exam-schedules/student/{studentId}
GET    /api/exam-schedules/check-conflicts
```

**Key Business Rules:**
- Midterm: Week 7-8 of semester
- Final: After week 15
- Duration: min 60 minutes
- Check room capacity
- No overlapping exams for same instructor

---

### Module 5: Scholarships
Create files:
- `Controllers/ScholarshipsController.cs`
- `Services/ScholarshipService.cs`

**Endpoints to implement:**
```http
# Scholarship Programs
GET    /api/scholarships
POST   /api/scholarships
PUT    /api/scholarships/{id}
DELETE /api/scholarships/{id}

# Student Applications
GET    /api/student-scholarships
POST   /api/student-scholarships              # Apply
PATCH  /api/student-scholarships/{id}/approve
PATCH  /api/student-scholarships/{id}/reject
PATCH  /api/student-scholarships/{id}/disburse
GET    /api/student-scholarships/eligible     # Check eligibility
```

**Key Business Rules:**
- Academic scholarships: GPA >= 3.2
- Max 2 scholarships per semester
- Total amount <= tuition amount
- Workflow: pending → approved → disbursed

---

### Module 6: Student Registration
Create files:
- `Controllers/RegistrationsController.cs`
- `Services/RegistrationService.cs`

**Endpoints to implement:**
```http
GET    /api/registrations
POST   /api/registrations                # Student registers
DELETE /api/registrations/{id}           # Cancel
PATCH  /api/registrations/{id}/approve   # Staff approves
PATCH  /api/registrations/{id}/reject    # Staff rejects
POST   /api/registrations/validate       # Check eligibility
```

**Key Validations:**
- ✅ Student status = 'active'
- ✅ No overdue tuition
- ✅ Check class capacity
- ✅ Check schedule conflicts
- ✅ Check prerequisites
- ✅ Max credits per semester: 15-24

---

### Module 7: Disciplinary Actions
Create files:
- `Controllers/DisciplinaryController.cs`
- `Services/DisciplinaryService.cs`

**Endpoints:**
```http
GET    /api/disciplinary
POST   /api/disciplinary
PUT    /api/disciplinary/{id}
DELETE /api/disciplinary/{id}
PATCH  /api/disciplinary/{id}/complete
GET    /api/disciplinary/student/{id}
GET    /api/disciplinary/active
```

**Types:** warning → probation → suspension → expulsion

---

### Module 8: Leave Requests
Create files:
- `Controllers/LeaveRequestsController.cs`
- `Services/LeaveRequestService.cs`

**Endpoints:**
```http
GET    /api/leave-requests
POST   /api/leave-requests              # Student submits
PATCH  /api/leave-requests/{id}/approve
PATCH  /api/leave-requests/{id}/reject
GET    /api/leave-requests/student/{id}
GET    /api/leave-requests/pending
```

**Types:** sick_leave, personal_leave, academic_leave, maternity_leave

---

### Module 9: Student Documents
Create files:
- `Controllers/DocumentsController.cs`
- `Services/DocumentService.cs`

**Endpoints:**
```http
GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/{id}/download
DELETE /api/documents/{id}
GET    /api/documents/student/{id}
```

---

### Module 10: Course Evaluations
Create files:
- `Controllers/EvaluationsController.cs`
- `Services/EvaluationService.cs`

**Endpoints:**
```http
GET    /api/evaluations
POST   /api/evaluations                  # Student submits
GET    /api/evaluations/course/{id}      # Course ratings
GET    /api/evaluations/instructor/{id}  # Instructor ratings
GET    /api/evaluations/statistics
```

**Ratings:** content, teaching, materials, overall (1-5 stars)

---

### Module 11: Facilities & Bookings
Create files:
- `Controllers/FacilitiesController.cs`
- `Services/FacilityService.cs`

**Endpoints:**
```http
# Facilities
GET    /api/facilities
POST   /api/facilities
PUT    /api/facilities/{id}
PATCH  /api/facilities/{id}/status

# Bookings
GET    /api/facility-bookings
POST   /api/facility-bookings
PATCH  /api/facility-bookings/{id}/approve
GET    /api/facility-bookings/check-conflict
```

---

### Module 12: Announcements
Create files:
- `Controllers/AnnouncementsController.cs`
- `Services/AnnouncementService.cs`

**Endpoints:**
```http
GET    /api/announcements
POST   /api/announcements
PUT    /api/announcements/{id}
DELETE /api/announcements/{id}
PATCH  /api/announcements/{id}/pin
GET    /api/announcements/active
```

---

## 🔐 AUTHENTICATION

All endpoints require JWT Bearer token (except login):

```http
Authorization: Bearer {your_jwt_token}
```

**Get token:**
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "admin",
  "email": "admin@edu.vn",
  "role": "admin",
  "expiresAt": "2024-03-11T11:30:00Z"
}
```

---

## 📊 STANDARD RESPONSES

### Success Response
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ],
  "timestamp": "2024-03-11T10:30:00Z"
}
```

### Paged Response
```json
{
  "data": [ /* items */ ],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

---

## 🧪 TESTING

### Using Swagger
Navigate to: `https://localhost:7xxx/swagger`

### Using curl
```bash
# Login
curl -X POST https://localhost:7xxx/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Use API with token
curl -X GET https://localhost:7xxx/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using .http file
See `StudentManagement.API.http` for ready-to-use requests

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Core (DONE ✅)
- [x] Authentication
- [x] Students
- [x] Grades
- [x] Tuition
- [x] Departments
- [x] Classes
- [x] Courses
- [x] Attendance
- [x] Instructors

### Phase 2: Academic (IN PROGRESS)
- [ ] Exam Schedules
- [ ] Student Registration
- [ ] Course Evaluations

### Phase 3: Financial
- [ ] Scholarships
- [ ] Scholarship Applications

### Phase 4: Administrative
- [ ] Disciplinary Actions
- [ ] Leave Requests
- [ ] Student Documents

### Phase 5: Facilities
- [ ] Facilities Management
- [ ] Facility Bookings

### Phase 6: Communication
- [ ] Announcements
- [ ] Notifications

---

## 🚦 NEXT STEPS

1. **Register Services** - Add new services to Program.cs
2. **Update DbContext** - Add DbSets for new entities
3. **Run Migration** - Create and apply database migration
4. **Test APIs** - Use Swagger to test each endpoint
5. **Implement Remaining Modules** - Follow patterns from Attendance & Instructor modules

---

## 📖 RESOURCES

- **Business Plan:** `/backend/BACKEND_BUSINESS_PLAN.md`
- **Database Schema:** `/database/db.sql`
- **API Docs:** Swagger UI at `/swagger`

---

## 💡 TIPS

1. **Follow the Pattern**: Use AttendanceController/Service as template
2. **Business Logic in Services**: Keep controllers thin
3. **Validate Early**: Check all constraints before saving
4. **Use DTOs**: Never expose entities directly
5. **Handle Errors**: Use try-catch and return meaningful messages
6. **Test with Real Data**: Use seed data from db.sql

---

## 🐛 COMMON ISSUES

### Issue: Services not found
**Solution:** Add to Program.cs:
```csharp
builder.Services.AddScoped<YourService>();
```

### Issue: DbSet not found
**Solution:** Add to AppDbContext.cs:
```csharp
public DbSet<YourEntity> YourEntities => Set<YourEntity>();
```

### Issue: Migration fails
**Solution:** 
```bash
dotnet ef migrations remove
dotnet ef migrations add YourMigration
dotnet ef database update
```

---

**Happy Coding! 🚀**
