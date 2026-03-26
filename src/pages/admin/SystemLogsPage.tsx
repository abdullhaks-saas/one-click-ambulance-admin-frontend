import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminSystemApi, type LogEntry } from '@/services/api';
import { toast } from 'sonner';
import { AlertOctagon, Activity } from 'lucide-react';

export function SystemLogsPage() {
  const [activeTab, setActiveTab] = useState<'error' | 'audit'>('error');

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('error')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'error'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            Error Logs
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Audit Logs
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'error' ? 'Backend Error Logs' : 'Admin Action Audit Trail'}</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTable type={activeTab} />
        </CardContent>
      </Card>
    </div>
  );
}

function LogTable({ type }: { type: 'error' | 'audit' }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total: number; total_pages: number } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const apiCall = type === 'error' ? adminSystemApi.getErrorLogs : adminSystemApi.getAuditLogs;
      const { data } = await apiCall({ page, limit: 15 });
      setLogs(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      toast.error(err?.apiMessage || `Failed to load ${type} logs`);
    } finally {
      setLoading(false);
    }
  }, [type, page]);

  useEffect(() => {
    setPage(1);
  }, [type]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (logs.length === 0) {
    return <div className="py-8 text-center text-slate-500">No logs found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            {type === 'error' ? (
              <>
                <TableHead>Level</TableHead>
                <TableHead>Message</TableHead>
              </>
            ) : (
              <>
                <TableHead>Admin ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap font-mono text-xs">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              {type === 'error' ? (
                <>
                  <TableCell>
                    <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'}>
                      {log.level || 'error'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[400px] truncate" title={log.message}>
                    {log.message}
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-mono text-xs">{log.admin_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {meta && meta.total_pages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-slate-500">Page {page} of {meta.total_pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
