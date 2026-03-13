import { Menu, LogOut, Settings, Bell, Search, MessageSquare } from 'lucide-react';
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

interface TopbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  onLogoutClick: () => void;
}

export function Topbar({ onMenuClick, onLogoutClick }: TopbarProps) {
  const { admin } = useAuthStore();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between gap-2 px-4 md:px-8',
        'bg-slate-50 dark:bg-slate-950', // Matching the layout background instead of white
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

        {/* Desktop Greeting (replaces classic brand topbar logo) */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">
            Welcome back, {admin?.name?.split(' ')[0] || 'Admin'}!
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            You have <span className="text-black dark:text-white">3 new</span> ambulance requests.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Decorative Topbar Icons like reference: Search, Bell, Message */}
        <div className="hidden sm:flex items-center gap-3">
          <button className="h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black dark:ring-white"></span>
          </button>
          
          <button className="h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center">
            <Search className="h-4 w-4" />
          </button>
          
          <button className="h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center relative">
            <MessageSquare className="h-4 w-4" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black dark:ring-white"></span>
          </button>
        </div>

        {/* Desktop Action Button matching reference */}
        <Button className="hidden sm:flex rounded-full bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20 px-6 h-10 font-medium tracking-wide">
          Create new order
        </Button>

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
