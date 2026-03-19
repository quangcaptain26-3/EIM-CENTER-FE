/**
 * notification-item.tsx
 * Hiển thị một dòng thông báo trong danh sách hoặc dropdown.
 */

import { type NotificationModel, NotificationType } from '@/domain/system/models/notification.model';
import { cn } from '@/shared/lib/cn';
import { getNotificationLabel } from '@/domain/system/rules/system.rule';

/** Props của component NotificationItem */
interface NotificationItemProps {
  notification: NotificationModel;
  onRead: (id: string) => void;
  className?: string;
}

/** 
 * Hàm tính thời gian tương đối đơn giản (Relative Time) 
 * Trả về chuỗi: "vừa xong", "5 phút trước", "1 ngày trước"...
 */
const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'vừa xong';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  return past.toLocaleDateString('vi-VN');
};

/** Icon tương ứng cho từng loại thông báo (SVG) */
const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case NotificationType.OVERDUE_INVOICE:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
      );
    case NotificationType.RENEWAL_NEEDED:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
      );
    case NotificationType.TRIAL_PENDING:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.97 5.97 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
      );
    case NotificationType.SESSION_UNASSIGNED:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
      );
  }
};

export const NotificationItem = ({ notification, onRead, className }: NotificationItemProps) => {
  // const navigate = useNavigate(); // Hiện tại chưa dùng link điều hướng chi tiết

  const handleClick = () => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      onRead(notification.id);
    }
    
    // Xử lý điều hướng nếu cần (giả định logic điều hướng dựa trên type)
    // switch (notification.type) { ... }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative flex cursor-pointer gap-4 p-4 transition-all hover:bg-slate-50 border-b border-slate-100 last:border-0",
        !notification.isRead && "bg-blue-50/50 hover:bg-blue-50",
        className
      )}
    >
      {/* Icon */}
      <div className="shrink-0 pt-0.5">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm font-bold text-slate-800 leading-tight",
            !notification.isRead && "text-indigo-900"
          )}>
            {notification.title}
          </h4>
          <span className="shrink-0 text-[11px] font-medium text-slate-400">
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>
        
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {notification.body}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {getNotificationLabel(notification.type)}
          </span>
          {!notification.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
          )}
        </div>
      </div>
    </div>
  );
};
