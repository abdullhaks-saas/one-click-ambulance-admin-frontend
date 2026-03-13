import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidenav, MobileSidenav } from './Sidenav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';

export function AdminLayout() {
  const [sidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setLogoutDialogOpen(false);
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans selection:bg-red-500/30">
      <Sidenav
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Mobile sidebar handles its own backdrop now */}
      <MobileSidenav 
        mobileOpen={mobileNavOpen} 
        onCloseMobile={() => setMobileNavOpen(false)} 
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setMobileNavOpen((p) => !p)}
          sidebarOpen={sidebarOpen}
          onLogoutClick={() => setLogoutDialogOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pt-4 pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Outlet />
        </main>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="rounded-2xl border-0 ring-1 ring-zinc-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Logout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500 font-medium">
            Are you sure you want to sign out? You will need to securely sign in again.
          </p>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" className="rounded-full font-bold px-6" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-full bg-red-600 font-bold px-6" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
