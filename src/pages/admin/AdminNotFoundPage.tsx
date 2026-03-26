import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function AdminNotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <SearchX className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Page Not Found
      </h1>
      <p className="max-w-md text-center text-slate-600 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved.
        Check the URL and try again.
      </p>
      <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
}
