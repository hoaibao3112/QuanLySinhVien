/* ──────────────────────────────────────────────────
   PageHeader.tsx
────────────────────────────────────────────────── */
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export default function PageHeader({ title, description, action, icon }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 animate-fade-up">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #3b96f3, #1d72e8)', boxShadow: '0 4px 14px rgba(29,114,232,0.3)' }}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-[22px] font-bold text-navy" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title}
          </h1>
          {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}