# 🔐 HỆ THỐNG PHÂN QUYỀN

## 📋 Tổng quan

Hệ thống có 2 loại người dùng chính với quyền hạn khác nhau:

---

## 👨‍💼 ADMIN - Quản trị hệ thống

### Quyền hạn:
✅ **Quản lý toàn bộ hệ thống**
- Xem và quản lý tất cả dữ liệu
- Thêm, sửa, xóa mọi thông tin
- Truy cập tất cả chức năng quản trị

### Menu điều hướng:
1. **Tổng quan** (`/dashboard`)
   - Thống kê tổng quan hệ thống
   - Biểu đồ và báo cáo
   
2. **Sinh viên** (`/students`)
   - Danh sách toàn bộ sinh viên
   - Thêm/Sửa/Xóa sinh viên
   - Xem chi tiết hồ sơ
   
3. **Giảng viên** (`/instructors`)
   - Quản lý giảng viên
   - Xem lịch giảng dạy
   
4. **Lớp học** (`/classes`)
   - Quản lý lớp học
   - Phân công môn học
   
5. **Môn học** (`/courses`)
   - Danh sách môn học
   - Thống kê tín chỉ
   
6. **Khoa** (`/departments`)
   - Quản lý các khoa
   
7. **Điểm danh** (`/attendance`)
   - Xem và quản lý điểm danh
   - Báo cáo vắng mặt
   
8. **Điểm số** (`/grades`)
   - Nhập và quản lý điểm
   - Xem bảng điểm
   
9. **Học phí** (`/tuition`)
   - Quản lý học phí
   - Theo dõi thanh toán

---

## 👨‍🎓 SINH VIÊN - Cổng thông tin sinh viên

### Quyền hạn:
✅ **Xem và quản lý thông tin cá nhân**
- Chỉ xem được thông tin của chính mình
- Đăng ký môn học
- Xem điểm và lịch học
- Thanh toán học phí

❌ **Không thể:**
- Xem thông tin sinh viên khác
- Sửa điểm số
- Quản lý hệ thống

### Menu điều hướng:
1. **Trang chủ** (`/dashboard`)
   - Thống kê cá nhân
   - Thông báo quan trọng
   - Lịch học gần nhất
   
2. **Hồ sơ cá nhân** (`/students/profile`)
   - Thông tin cá nhân (Email, SĐT, địa chỉ, ngày sinh)
   - GPA và thống kê học tập
   - Điểm danh
   - 3 tabs:
     - 📝 Thông tin cá nhân
     - 📊 Bảng điểm
     - 📅 Lịch học
   
3. **Xem điểm** (`/grades`)
   - Bảng điểm các học kỳ
   - Điểm từng môn (Giữa kỳ, Cuối kỳ)
   - GPA tích lũy
   - Xếp loại
   
4. **Thời khóa biểu** (`/schedule`)
   - Lịch học theo tuần
   - Hiển thị dạng lưới (Weekly View)
   - Hiển thị dạng danh sách (List View)
   - Thông tin: Môn học, Giảng viên, Phòng, Giờ học
   - Chọn năm học và học kỳ
   - Xuất PDF, In lịch
   
5. **Đăng ký môn học** (`/registrations`)
   - Xem môn đã đăng ký
   - Đăng ký môn mới
   - Hủy đăng ký (nếu còn thời gian)
   - Trạng thái: Chờ duyệt, Đã duyệt, Từ chối
   - Thống kê tín chỉ
   
6. **Lịch thi** (`/exams`)
   - Xem lịch thi (Giữa kỳ, Cuối kỳ, Thi lại)
   - Thông tin: Ngày thi, Giờ thi, Phòng thi, Thời gian
   - Đếm ngược ngày thi
   - Cảnh báo thi gần
   - Xuất PDF, In lịch thi
   
7. **Học phí** (`/tuition`)
   - Xem công nợ học phí
   - Lịch sử thanh toán
   - Số tiền cần đóng
   - Hạn thanh toán
   - Thanh toán online

---

## 🎨 Tính năng giao diện

### Cho Sinh viên:
- ✨ Giao diện hiện đại, thân thiện
- 📱 Responsive (Hỗ trợ mobile)
- 🎨 Màu sắc phân biệt rõ ràng
- 📊 Biểu đồ thống kê trực quan
- 🔔 Thông báo quan trọng
- 📥 Xuất PDF cho tất cả báo cáo
- 🖨️ In trực tiếp từ trình duyệt

### Cho Admin:
- 📋 Bảng quản lý đầy đủ
- 🔍 Tìm kiếm và lọc mạnh mẽ
- 📊 Dashboard tổng quan
- 📈 Báo cáo và thống kê chi tiết

---

## 🔒 Bảo mật

### Authentication:
- JWT Token
- Expire sau 8 giờ
- Lưu token trong localStorage

### Authorization:
- Kiểm tra role trên mỗi request
- Backend verify token
- Frontend ẩn/hiện menu theo role

### Helper Functions:
```typescript
// Kiểm tra role
isAdmin()      // true nếu là admin
isStudent()    // true nếu là sinh viên
isInstructor() // true nếu là giảng viên

// Lấy thông tin user
getUser()      // { id, username, email, role, ... }

// Đăng xuất
logout()       // Xóa token và chuyển về trang login
```

---

## 📁 Cấu trúc thư mục Frontend

```
src/
├── app/(dashboard)/
│   ├── dashboard/         # Trang chủ (Admin & Sinh viên)
│   ├── students/
│   │   ├── page.tsx       # Danh sách SV (Admin only)
│   │   └── profile/       # Hồ sơ cá nhân (Sinh viên)
│   ├── grades/            # Xem điểm (Admin & Sinh viên)
│   ├── schedule/          # Thời khóa biểu (Sinh viên)
│   ├── registrations/     # Đăng ký môn học (Sinh viên)
│   ├── exams/             # Lịch thi (Sinh viên)
│   ├── tuition/           # Học phí (Admin & Sinh viên)
│   ├── instructors/       # Giảng viên (Admin only)
│   ├── classes/           # Lớp học (Admin only)
│   ├── courses/           # Môn học (Admin only)
│   ├── departments/       # Khoa (Admin only)
│   └── attendance/        # Điểm danh (Admin only)
│
├── components/
│   ├── Sidebar.tsx        # Menu với phân quyền
│   ├── Header.tsx         # Header với user info
│   └── PageHeader.tsx     # Header cho từng trang
│
└── lib/
    ├── auth.ts            # Authentication helpers
    └── api.ts             # API client

```

---

## 🚀 Sử dụng

### Đăng nhập:
1. Truy cập `/login`
2. Nhập username/password
3. Hệ thống tự động chuyển đến dashboard phù hợp

### Admin:
```
Username: admin
Password: password123
```

Sau khi đăng nhập, sidebar sẽ hiển thị tất cả menu quản trị.

### Sinh viên:
Đăng nhập bằng tài khoản sinh viên được cấp.
Sidebar chỉ hiển thị các chức năng dành cho sinh viên.

---

## 📝 Ghi chú

- Tất cả các trang đều có phân quyền rõ ràng
- Sidebar tự động thay đổi dựa trên role
- Các API endpoint đều được bảo vệ bởi JWT
- Frontend kiểm tra role để ẩn/hiện chức năng
- Backend kiểm tra role để cho phép/từ chối request

---

## 🔄 Cập nhật gần đây

✅ Tạo trang **Hồ sơ cá nhân** cho sinh viên  
✅ Tạo trang **Thời khóa biểu** với phân quyền  
✅ Tạo trang **Đăng ký môn học**  
✅ Tạo trang **Lịch thi**  
✅ Cập nhật **Sidebar** với phân quyền đầy đủ  
✅ Thêm helper functions kiểm tra role  
✅ Integration với API endpoints  

---

**Phiên bản:** 1.0.0  
**Cập nhật:** Tháng 3, 2026
