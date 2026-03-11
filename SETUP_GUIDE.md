# 🎓 HƯỚNG DẪN CHẠY HỆ THỐNG QUẢN LÝ SINH VIÊN

## 📦 Cấu trúc dự án

```
QuanlySinhVien/
├── backend/                    # ASP.NET Core API
│   └── StudentManagement.API/
├── frontend/                   # Next.js Frontend
└── database/                   # SQL Scripts
```

## 🚀 HƯỚNG DẪN KHỞI CHẠY

### Bước 1: Chuẩn bị Database

```bash
# 1. Khởi động PostgreSQL
# 2. Tạo database mới
CREATE DATABASE StudentManagement;

# 3. Chạy file db.sql
psql -U postgres -d StudentManagement -f database/db.sql
```

### Bước 2: Khởi động Backend API

```bash
cd backend/StudentManagement.API

# Cập nhật connection string trong appsettings.json
# "DefaultConnection": "Host=localhost;Database=StudentManagement;Username=postgres;Password=yourpassword"

# Chạy migration (nếu dùng EF Core)
dotnet ef database update

# Chạy API
dotnet run
```

Backend sẽ chạy tại: `https://localhost:7xxx`

### Bước 3: Khởi động Frontend

```bash
cd frontend

# Cài đặt dependencies (lần đầu tiên)
npm install

# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=https://localhost:7xxx/api" > .env.local

# NOTE: Thay 7xxx bằng port thực tế của backend

# Chạy frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 🔐 Đăng nhập hệ thống

### Tài khoản mặc định:
- **Username**: `admin`
- **Password**: `password123`

Hoặc tạo user mới thông qua API hoặc database.

## 📋 Checklist trước khi chạy

### Backend
- [ ] PostgreSQL đã cài đặt và đang chạy
- [ ] Database đã được tạo
- [ ] Connection string đã được cấu hình đúng
- [ ] Các NuGet packages đã được restore
- [ ] CORS đã được enable cho `http://localhost:3000`

### Frontend
- [ ] Node.js 18+ đã cài đặt
- [ ] Dependencies đã được cài (`npm install`)
- [ ] File `.env.local` đã có URL đúng của backend
- [ ] Backend đang chạy

## 🔧 Cấu hình CORS (Backend)

Trong `Program.cs`, đảm bảo có:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ...

app.UseCors();
```

## 🌐 Các URL quan trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Ứng dụng web |
| Backend API | https://localhost:7xxx | REST API |
| Swagger UI | https://localhost:7xxx/swagger | API Documentation |

## 🎯 Luồng hoạt động

1. **Người dùng truy cập** `http://localhost:3000`
2. **Redirect đến** `/login`
3. **Nhập credentials** → Call `POST /api/auth/login`
4. **Nhận JWT token** → Lưu vào localStorage
5. **Redirect đến** `/dashboard`
6. **Mọi API call** đều gửi kèm token trong header

## 🐛 Xử lý lỗi thường gặp

### 1. Backend không chạy
```
Error: Failed to fetch
```
**Giải pháp**: Kiểm tra backend đã chạy chưa, xem log console

### 2. CORS Error
```
Access to fetch at 'https://localhost:7xxx/api/...' from origin 
'http://localhost:3000' has been blocked by CORS policy
```
**Giải pháp**: 
- Thêm CORS policy trong `Program.cs`
- Restart backend

### 3. Database Connection Error
```
Npgsql.PostgresException: Connection refused
```
**Giải pháp**:
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra connection string
- Kiểm tra username/password

### 4. SSL Certificate Error (Development)
```
NET::ERR_CERT_AUTHORITY_INVALID
```
**Giải pháp**: 
- Chấp nhận certificate trong browser
- Hoặc dùng HTTP thay vì HTTPS

### 5. Module Not Found (Frontend)
```
Error: Cannot find module '@/lib/api'
```
**Giải pháp**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Kiểm tra hệ thống

### Test Backend
```bash
# Test health endpoint
curl https://localhost:7xxx/api/health

# Test login
curl -X POST https://localhost:7xxx/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Test Frontend
1. Mở `http://localhost:3000`
2. Kiểm tra redirect đến `/login`
3. Đăng nhập với tài khoản admin
4. Kiểm tra các menu và trang

## 🔄 Development Workflow

### Khi thay đổi Backend
1. Sửa code
2. Backend tự động reload (hot reload)
3. Refresh frontend nếu cần

### Khi thay đổi Frontend
1. Sửa code
2. Next.js tự động reload (Fast Refresh)
3. Thay đổi hiển thị ngay lập tức

## 📱 Tính năng đã triển khai

### ✅ Hoàn thành
- [x] Đăng nhập/Đăng xuất
- [x] Dashboard tổng quan
- [x] Quản lý Sinh viên (CRUD)
- [x] Quản lý Giảng viên (CRUD)
- [x] Quản lý Môn học (CRUD)
- [x] Quản lý Lớp học (CRUD)
- [x] Quản lý Khoa (CRUD)
- [x] Điểm danh
- [x] Quản lý Điểm
- [x] Quản lý Học phí

### 🚧 Đang phát triển
- [ ] Modal forms cho CRUD operations
- [ ] Xác thực form chi tiết
- [ ] Export Excel/PDF
- [ ] Real-time notifications
- [ ] Upload ảnh sinh viên

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log (F12)
2. Kiểm tra backend log
3. Kiểm tra database connection
4. Xem file README.md trong từng thư mục

## 📚 Tài liệu chi tiết

- [Backend API Guide](backend/API_QUICK_START_GUIDE.md)
- [Backend Business Plan](backend/BACKEND_BUSINESS_PLAN.md)
- [Frontend Documentation](frontend/FRONTEND_README.md)

---

**Chúc bạn làm việc hiệu quả! 🎉**
