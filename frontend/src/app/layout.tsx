import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduManage - Quản lý sinh viên',
  description: 'Hệ thống quản lý sinh viên toàn diện',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}