/**
 * notification-bell.tsx
 * Icon chuông thông báo trên Header kèm Badge và Dropdown danh sách.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useUnreadNotificationCount, useNotifications } from '@/presentation/hooks/system/use-notifications';
import { useMarkNotificationRead, useMarkAllNotificationsRead } from '@/presentation/hooks/system/use-notification-mutations';
import { NotificationItem } from './notification-item';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Lấy data từ hooks
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notifyList, isLoading } = useNotifications({ limit: 8 });
  
  // Mutations
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative rounded-xl p-2.5 transition-all duration-300 focus:outline-none",
          isOpen 
            ? "bg-indigo-50 text-indigo-600 shadow-inner" 
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        )}
        aria-label="Thông báo"
        type="button"
      >
        <Bell className={cn("h-6 w-6 transition-transform group-hover:scale-110", isOpen && "scale-110")} strokeWidth={2.2} />
        
        {/* Badge số lượng chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in duration-300">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-200/50 animate-in fade-in slide-in-from-top-2 duration-200 z-[100] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <h3 className="text-base font-extrabold text-slate-800">Thông báo</h3>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="h-4 w-4" />
              Đọc tất cả
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-3" />
                <p className="text-sm font-medium text-slate-400">Đang tải thông báo...</p>
              </div>
            ) : notifyList?.items && notifyList.items.length > 0 ? (
              notifyList.items.map((n: any) => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  onRead={(id) => markReadMutation.mutate(id)} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                <div className="rounded-full bg-slate-50 p-4 mb-4">
                  <Inbox className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-bold text-slate-600 mb-1">Hòm thư trống</h4>
                <p className="text-xs text-slate-400 leading-relaxed px-8">
                  Bạn không có thông báo nào vào lúc này.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-slate-100 bg-slate-50/30 px-5 py-3.5 text-center text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-indigo-600 group"
          >
            Xem tất cả thông báo
            <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
          </Link>
        </div>
      )}
    </div>
  );
};
