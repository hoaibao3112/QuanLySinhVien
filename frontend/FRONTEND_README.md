# 🎓 EduManage - Student Management System Frontend

Hệ thống quản lý sinh viên được xây dựng với Next.js 14 và Tailwind CSS.

## 🚀 Tính năng

### ✅ Đã hoàn thành:
- 🔐 **Authentication**: Đăng nhập, đăng xuất, quản lý phiên
- 📊 **Dashboard**: Tổng quan thống kê, biểu đồ, thông báo
- 👨‍🎓 **Quản lý Sinh viên**: CRUD, tìm kiếm, lọc, phân trang
- 👨‍🏫 **Quản lý Giảng viên**: CRUD, xem lịch giảng dạy
- 🏫 **Quản lý Khoa**: Danh sách các khoa
- 📚 **Quản lý Môn học**: CRUD môn học
- 🎓 **Quản lý Lớp học**: CRUD lớp học, thống kê sĩ số
- ✅ **Điểm danh**: Điểm danh hàng loạt theo lớp
- 📝 **Quản lý Điểm**: Nhập điểm cho sinh viên
- 💰 **Quản lý Học phí**: Theo dõi công nợ, thanh toán

## 📋 Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Backend API đang chạy (xem `/backend`)

## 🛠️ Cài đặt

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://localhost:7xxx/api
```

Thay `7xxx` bằng port của backend API.

### 3. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── layout.tsx        # Dashboard layout
│   │   │   ├── dashboard/        # Trang chủ
│   │   │   ├── students/         # Quản lý sinh viên
│   │   │   ├── instructors/      # Quản lý giảng viên
│   │   │   ├── courses/          # Quản lý môn học
│   │   │   ├── classes/          # Quản lý lớp học
│   │   │   ├── departments/      # Quản lý khoa
│   │   │   ├── attendance/       # Điểm danh
│   │   │   ├── grades/           # Quản lý điểm
│   │   │   └── tuition/          # Quản lý học phí
│   │   ├── login/                # Trang đăng nhập
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page (redirect)
│   ├── components/               # Reusable components
│   │   ├── Sidebar.tsx          # Sidebar navigation
│   │   ├── Header.tsx           # Header với search & user menu
│   │   └── PageHeader.tsx       # Page title component
│   ├── lib/
│   │   ├── api.ts               # API client & endpoints
│   │   └── auth.ts              # Authentication utilities
│   └── types/
│       └── index.ts             # TypeScript types
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
└── package.json
```

## 🎨 UI/UX

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons (SVG)
- **Colors**: Blue primary, với các accent colors
- **Fonts**: System fonts (sans-serif)

## 🔗 API Integration

### Authentication

```typescript
// Login
const response = await authApi.login({ username, password });
setAuthToken(response.token);

// Get current user
const user = await authApi.getMe();
```

### Data Fetching

```typescript
// Get students with filters
const students = await studentsApi.getAll({ 
  search: 'John',
  status: 'active',
  page: 1,
  pageSize: 20
});

// Get student by ID
const student = await studentsApi.getById(id);

// Create student
await studentsApi.create(formData);
```

## 🔒 Authentication Flow

1. User nhập username/password tại `/login`
2. Frontend gọi `POST /api/auth/login`
3. Backend trả về JWT token
4. Token được lưu vào `localStorage`
5. Mọi request sau đó đều gửi token qua `Authorization` header
6. Protected routes kiểm tra token trước khi render

## 📱 Responsive Design

- Desktop: Full sidebar + content
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation bar (có thể customize)

## 🚧 Tính năng sắp tới

- [ ] Modal forms để thêm/sửa dữ liệu
- [ ] Toast notifications
- [ ] Export Excel/PDF
- [ ] Real-time updates với WebSocket
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced filters & sorting
- [ ] Batch operations
- [ ] File upload cho ảnh sinh viên
- [ ] Print preview cho báo cáo

## 📝 Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### CORS Error
- Kiểm tra backend đã enable CORS cho `http://localhost:3000`
- Thêm origin vào `Program.cs`:
  ```csharp
  builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
      policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
  });
  ```

### API Connection Error
- Kiểm tra backend đang chạy
- Kiểm tra URL trong `.env.local`
- Kiểm tra SSL certificate nếu dùng HTTPS

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify JWT secret khớp với backend

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Backend API Documentation](../backend/API_QUICK_START_GUIDE.md)

## 👨‍💻 Development

### Thêm trang mới

1. Tạo file trong `src/app/(dashboard)/[tên-trang]/page.tsx`
2. Thêm route vào Sidebar (`src/components/Sidebar.tsx`)
3. Tạo API functions trong `src/lib/api.ts`

### Styling Guidelines

- Sử dụng Tailwind utilities
- Màu chính: `blue-600`
- Radius: `rounded-lg` (8px), `rounded-xl` (12px)
- Shadow: `shadow-sm` cho cards
- Spacing: `gap-4`, `gap-6` cho grid/flex

## 📄 License

MIT License - Copyright © 2024 EduManage

---

**Built with ❤️ using Next.js & Tailwind CSS**
