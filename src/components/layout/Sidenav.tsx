import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ambulance,
  FileText,
  MapPin,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import logo from '@/assets/onclick-logo.png';

const navItems: { to: string; label: string; icon: React.ElementType; badge?: number }[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/drivers', label: 'Active Drivers', icon: FileText },
  { to: '/admin/ambulances', label: 'Ambulances', icon: Ambulance },
  { to: '/admin/coming-soon', label: 'Orders', icon: FileText },
  { to: '/admin/coming-soon', label: 'Map Overview', icon: MapPin },
  { to: '/admin/coming-soon', label: 'Messages', icon: MessageSquare, badge: 2 },
  { to: '/admin/coming-soon', label: 'Settings', icon: Settings },
];

interface SidenavProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidenav({
  mobileOpen,
  onCloseMobile,
}: SidenavProps) {
  const { admin } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [shrunk, setShrunk] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-white dark:bg-slate-900 shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
        'fixed inset-y-0 left-0 z-50 flex-shrink-0 transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0',
        shrunk ? 'w-[100px]' : 'w-[280px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'my-2 ml-2 rounded-[2rem] h-[calc(100vh-2rem)] border border-zinc-100 dark:border-slate-800 hidden lg:flex relative'
      )}
    >
      {/* Shrink Toggle Button */}
      <button 
        onClick={() => setShrunk(!shrunk)}
        className="absolute -right-4 top-16 h-8 w-8 rounded-full bg-white dark:bg-slate-800 border-2 border-zinc-100 dark:border-slate-700 shadow-xl flex items-center justify-center z-[60] hover:scale-110 active:scale-95 transition-all cursor-pointer group"
      >
        {shrunk ? (
          <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-red-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-red-600" />
        )}
      </button>

      <div className={cn("flex items-center gap-3 pt-8 pb-6 transition-all", shrunk ? "px-0 justify-center" : "px-8")}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/5 overflow-hidden ring-1 ring-zinc-100">
          <img src={logo} alt="OneClick Ambulance" className="h-full w-full object-contain p-1" />
        </div>
        {!shrunk && <span className="font-extrabold text-xl text-black tracking-tight dark:text-white truncate">OneClick</span>}
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onCloseMobile()}
              title={shrunk ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-2xl transition-all duration-200 relative group overflow-hidden',
                  shrunk ? 'mx-auto w-12 h-12 justify-center' : 'gap-4 px-4 py-3.5 mx-0',
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-black dark:hover:bg-slate-800 dark:hover:text-white'
                )
              }
            >
               {({ isActive }) => (
                 <>
                   <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-white" : "text-zinc-400 group-hover:text-black dark:group-hover:text-white")} strokeWidth={isActive ? 2.5 : 2} />
                   {!shrunk && <span className="flex-1 tracking-wide truncate">{item.label}</span>}
                   
                   {/* Optional notification badge on side nav */}
                   {item.badge && !shrunk && (
                     <div className={cn(
                       "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                       isActive ? "bg-white text-red-600" : "bg-[#e8f1ff] text-blue-600"
                     )}>
                       {item.badge}
                     </div>
                   )}

                   {/* Right active indicator pill */}
                   {isActive && !shrunk && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white absolute right-4"></div>
                   )}
                 </>
               )}
            </NavLink>
          );
        })}
      </nav>

      {/* Lower Profile & Toggle Section */}
      <div className={cn("pb-8 pt-4 transition-all", shrunk ? "px-0 flex flex-col items-center" : "px-6")}>
        {/* User Card */}
        <div className={cn("flex items-center mb-6", shrunk ? "justify-center" : "gap-3")}>
          <img 
            src={`https://ui-avatars.com/api/?name=${admin?.name || 'Admin'}&background=random`} 
            alt="User" 
            className="w-10 h-10 flex-shrink-0 rounded-full object-cover ring-2 ring-black dark:ring-white"
          />
          {!shrunk && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-black dark:text-white truncate">{admin?.name || 'Super Admin'}</p>
              <p className="text-xs text-zinc-500 font-medium truncate">{admin?.email || 'admin@oneclick.com'}</p>
            </div>
          )}
        </div>

        {/* Theme Toggle Pill */}
        <div className={cn("bg-zinc-100 dark:bg-black rounded-full flex items-center shadow-inner", shrunk ? "flex-col p-1.5 gap-2" : "p-1")}>
          <button 
            onClick={() => setTheme('light')}
            className={cn(
              "rounded-full transition-colors flex items-center justify-center",
              shrunk ? "w-8 h-8" : "flex-1 py-1.5 px-4 text-xs font-bold tracking-wide",
              theme === 'light' ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black dark:hover:text-white"
            )}
            title="Light Mode"
          >
            {shrunk ? <Sun className="h-4 w-4" /> : 'Light'}
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={cn(
              "rounded-full transition-colors flex items-center justify-center",
              shrunk ? "w-8 h-8" : "flex-1 py-1.5 px-4 text-xs font-bold tracking-wide",
              theme === 'dark' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-black dark:hover:text-white"
            )}
            title="Dark Mode"
          >
            {shrunk ? <Moon className="h-4 w-4" /> : 'Dark'}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidenav({ mobileOpen, onCloseMobile }: { mobileOpen: boolean, onCloseMobile: () => void }) {
  
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'flex flex-col bg-white shadow-2xl',
          'fixed inset-y-0 left-0 z-50 flex-shrink-0 transform transition-transform duration-300 ease-in-out',
          'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/5 overflow-hidden ring-1 ring-zinc-100">
              <img src={logo} alt="OneClick Ambulance" className="h-full w-full object-contain p-1" />
            </div>
            <span className="font-extrabold text-xl text-black tracking-tight dark:text-white">OneClick</span>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col gap-1 px-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all',
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                  )
                }
              >
                 {({ isActive }) => (
                   <>
                     <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
                     <span>{item.label}</span>
                   </>
                 )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
