import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
        <Construction className="h-10 w-10 text-slate-500" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Coming Soon
      </h1>
      <p className="max-w-md text-center text-slate-600 dark:text-slate-400">
        This feature is currently under development. Please check back later.
      </p>
      <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
}
