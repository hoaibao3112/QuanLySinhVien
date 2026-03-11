import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduManage - Hệ thống quản lý sinh viên",
  description: "Student Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
