# QuanLySinhVien - Student Management System

## 📚 Giới thiệu
Hệ thống quản lý sinh viên toàn diện được xây dựng bằng ASP.NET Core 8.0 và Next.js

## 🔧 Tech Stack

### Backend
- **Framework:** ASP.NET Core 8.0 Web API
- **Database:** PostgreSQL 14+
- **ORM:** Entity Framework Core
- **Authentication:** JWT Bearer Token
- **Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## 🗂️ Cấu trúc dự án
```
QuanLySinhVien/
├── backend/
│   ├── StudentManagement.API/      # ASP.NET Core Web API
│   │   ├── Controllers/            # API Controllers
│   │   ├── Services/               # Business Logic
│   │   ├── Models/                 # Entities & DTOs
│   │   ├── Data/                   # DbContext
│   │   └── Program.cs
│   ├── BACKEND_BUSINESS_PLAN.md    # Business requirements
│   └── API_QUICK_START_GUIDE.md    # API documentation
├── frontend/                       # Next.js application
├── database/
│   └── db.sql                      # Database schema & seed data
└── README.md
```

## 🚀 Features

### ✅ Core Modules (Implemented)
- 🔐 Authentication & Authorization (JWT)
- 👨‍🎓 Student Management
- 📊 Grade Management
- 💰 Tuition Management
- 🏫 Department & Class Management
- 📚 Course Management
- 📋 Dashboard & Statistics
- ✅ Attendance Tracking
- 👨‍🏫 Instructor Management

### 🚧 In Progress
- 📝 Student Registration
- 📅 Exam Schedules
- 🎓 Scholarships
- 📢 Announcements
- 🏢 Facility Management
- 📄 Document Management
- ⚖️ Disciplinary Actions
- 📝 Leave Requests
- ⭐ Course Evaluations

## 📦 Database Schema
22 tables covering:
- Core entities (students, courses, classes, departments)
- Academic management (grades, attendance, exams)
- Financial management (tuition, scholarships)
- Administrative (disciplinary, leave requests, documents)
- Facilities & announcements

## 🛠️ Setup & Installation

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 14+
- Node.js 18+

### Backend Setup
```bash
cd backend/StudentManagement.API

# Restore packages
dotnet restore

# Update connection string in appsettings.json
# Run database script
psql -U postgres -d student_management -f ../../database/db.sql

# Run API
dotnet run
```

API sẽ chạy tại: https://localhost:7xxx  
Swagger UI: https://localhost:7xxx/swagger

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## 📖 API Documentation
- **Swagger UI:** `/swagger`
- **Quick Start Guide:** `backend/API_QUICK_START_GUIDE.md`
- **Business Plan:** `backend/BACKEND_BUSINESS_PLAN.md`

## 🔑 Default Credentials
```
Username: admin
Password: password123
```

## 📊 API Endpoints Overview

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`
- POST `/api/auth/change-password`

### Students
- GET/POST/PUT/DELETE `/api/students`
- GET `/api/students/{id}/grades`
- GET `/api/students/{id}/tuition`

### Attendance (NEW)
- GET/POST/PUT/DELETE `/api/attendance`
- POST `/api/attendance/bulk`
- GET `/api/attendance/statistics/{studentId}`
- GET `/api/attendance/report/absences`

### Instructors (NEW)
- GET/POST/PUT/DELETE `/api/instructors`
- GET `/api/instructors/{id}/schedule`
- GET `/api/instructors/{id}/evaluations`

*...and 150+ more endpoints - see API_QUICK_START_GUIDE.md*

## 🎯 Business Rules

### Attendance
- Mark up to 7 days in past
- Absence rate > 20%: Warning
- Absence rate > 30%: Cannot take final exam

### Registration
- Check tuition payment status
- Validate prerequisites
- Check class capacity
- Detect schedule conflicts
- Credit limit: 15-24 per semester

### Scholarships
- Academic: GPA >= 3.2
- Max 2 scholarships per semester
- Attendance >= 80%

## 📈 Project Progress
- ✅ Database: 22 tables (100%)
- ✅ Backend: 9/17 modules (53%)
- 🚧 Frontend: Basic setup
- 📝 Documentation: Complete

## 👨‍💻 Author
- GitHub: [@hoaibao3112](https://github.com/hoaibao3112)

## 📝 License
MIT License

## 🤝 Contributing
Contributions are welcome! Please read the business plan before submitting PRs.

---

**Last Updated:** March 11, 2026  
**Version:** 1.0.0-beta
