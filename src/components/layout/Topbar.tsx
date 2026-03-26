import { useState, useEffect, useCallback } from 'react';
import { Menu, LogOut, Settings, Bell, Search, MessageSquare, AlertTriangle, Info, ShieldAlert, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { adminAlertsApi, type AdminAlertItem } from '@/services/api';

interface TopbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  onLogoutClick: () => void;
}

function AlertSeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case 'critical':
      return <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    default:
      return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
  }
}

export function Topbar({ onMenuClick, onLogoutClick }: TopbarProps) {
  const { admin } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await adminAlertsApi.unreadCount();
      setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await adminAlertsApi.list({ limit: 8, unread_only: true });
      setAlerts(data.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (alertsOpen) fetchAlerts();
  }, [alertsOpen, fetchAlerts]);

  async function handleMarkAllRead() {
    try {
      await adminAlertsApi.markAllAsRead();
      setUnreadCount(0);
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    } catch {
      // silently fail
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between gap-2 px-4 md:px-8',
        'bg-slate-50 dark:bg-slate-950',
        'transition-all duration-200 ease-in-out'
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden rounded-full bg-white shadow-sm ring-1 ring-zinc-100"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">
            Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}!
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            {unreadCount > 0
              ? <>You have <span className="text-black dark:text-white">{unreadCount}</span> unread alert{unreadCount !== 1 ? 's' : ''}.</>
              : 'All systems operational.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden sm:flex items-center gap-3">
          {/* Admin Alerts Bell — functional */}
          <DropdownMenu open={alertsOpen} onOpenChange={setAlertsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-full shadow shadow-gray-700 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 ring-2 ring-black dark:ring-white flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-xl ring-1 ring-zinc-100 dark:ring-slate-800 border-0 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-slate-800">
                <p className="text-sm font-bold text-black dark:text-white">Alerts</p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No unread alerts
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <DropdownMenuItem key={alert.id} className="px-4 py-3 cursor-default focus:bg-zinc-50 dark:focus:bg-slate-800 rounded-none">
                      <div className="flex gap-3 w-full">
                        <AlertSeverityIcon severity={alert.severity} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-black dark:text-white truncate">{alert.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              <div className="border-t border-zinc-100 dark:border-slate-800 p-2">
                <Link
                  to="/admin/notifications"
                  className="block text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5"
                  onClick={() => setAlertsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button className="h-10 w-10 rounded-full shadow shadow-gray-700 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center">
            <Search className="h-4 w-4" />
          </button>
          
          <button className="h-10 w-10 rounded-full shadow shadow-gray-700 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center relative">
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full h-10 w-10 ml-2 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-black dark:ring-white p-0 overflow-hidden outline-none">
               <img src={`https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=0D0D12&color=fff`} className="h-full w-full object-cover" alt="Profile" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl ring-1 ring-zinc-100 dark:ring-slate-800 border-0 bg-white dark:bg-slate-900">
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-black dark:text-white">{admin?.name ?? 'Super Admin'}</p>
              <p className="text-xs text-zinc-500">{admin?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-slate-800" />
            <DropdownMenuItem asChild className="rounded-xl focus:bg-zinc-50 dark:focus:bg-slate-800 cursor-pointer">
              <Link to="/admin/settings" className="flex items-center gap-2 py-2">
                <Settings className="h-4 w-4 text-zinc-500" />
                <span className="font-medium text-black dark:text-white">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-slate-800" />
            <DropdownMenuItem
              className="rounded-xl focus:bg-red-50 cursor-pointer py-2 text-red-600 focus:text-red-700 font-medium"
              onClick={onLogoutClick}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
