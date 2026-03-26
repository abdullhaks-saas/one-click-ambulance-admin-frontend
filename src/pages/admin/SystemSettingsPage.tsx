import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { adminSystemApi, type SystemSetting, type SystemHealth, type SystemSettingsGetPayload } from '@/services/api';
import { toast } from 'sonner';
import { Settings, Server, Database, CreditCard, ShieldAlert } from 'lucide-react';

const MAINTENANCE_SETTING_KEY = 'MAINTENANCE_MODE';

function settingsListFromPayload(payload: SystemSettingsGetPayload): SystemSetting[] {
  const rows = payload?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    key: r.key,
    value: r.value,
    description: '',
    updated_at: String(r.updated_at ?? ''),
  }));
}

/** Maps GET /admin/system-health payload to UI shape (backend uses ok/configured, not healthy). */
function mapHealthPayload(raw: unknown): SystemHealth | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    database: r.database === 'ok' ? 'healthy' : 'unhealthy',
    firebase: r.firebase === 'configured' ? 'healthy' : 'unhealthy',
    razorpay: r.razorpay === 'configured' ? 'healthy' : 'unhealthy',
    last_checked: typeof r.timestamp === 'string' ? r.timestamp : new Date().toISOString(),
  };
}

export function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [maintenanceDialog, setMaintenanceDialog] = useState<{ enable: boolean } | null>(null);
  const [maintenanceSubmitting, setMaintenanceSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.all([
        adminSystemApi.getSettings(),
        adminSystemApi.getHealth()
      ]);
      setSettings(settingsListFromPayload(settingsRes.data));
      setHealth(mapHealthPayload(healthRes.data));
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSaveSetting(key: string, value: string) {
    setSaving(key);
    try {
      await adminSystemApi.updateSetting(key, value);
      toast.success('Setting updated successfully');
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to update setting');
    } finally {
      setSaving(null);
    }
  }

  async function handleMaintenanceToggle(enabled: boolean) {
    try {
      await adminSystemApi.toggleMaintenance(enabled);
      toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
      fetchData(); // Refresh settings to reflect change
    } catch (err: any) {
      toast.error(err?.apiMessage || 'Failed to toggle maintenance mode');
    }
  }

  async function confirmMaintenanceChange() {
    if (!maintenanceDialog) return;
    const { enable } = maintenanceDialog;
    setMaintenanceSubmitting(true);
    try {
      await handleMaintenanceToggle(enable);
    } finally {
      setMaintenanceSubmitting(false);
      setMaintenanceDialog(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const maintenanceSetting = settings.find((s) => s.key === MAINTENANCE_SETTING_KEY);
  const isMaintenance = maintenanceSetting?.value === 'true' || maintenanceSetting?.value === true;

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6" />
          System Settings
        </h1>
        <Button
          variant={isMaintenance ? 'destructive' : 'outline'}
          onClick={() => setMaintenanceDialog({ enable: !isMaintenance })}
          className="gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          {isMaintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
        </Button>
      </div>

      <Dialog
        open={maintenanceDialog !== null}
        onOpenChange={(open) => {
          if (!open && !maintenanceSubmitting) setMaintenanceDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {maintenanceDialog?.enable ? 'Enable maintenance mode?' : 'Disable maintenance mode?'}
            </DialogTitle>
            <DialogDescription>
              {maintenanceDialog?.enable
                ? 'Users may be unable to use the app until maintenance mode is turned off. Only proceed if you intend to block normal traffic.'
                : 'The platform will become available to users again as usual.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={maintenanceSubmitting}
              onClick={() => setMaintenanceDialog(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={maintenanceDialog?.enable ? 'destructive' : 'default'}
              disabled={maintenanceSubmitting}
              onClick={() => void confirmMaintenanceChange()}
            >
              {maintenanceSubmitting
                ? 'Working…'
                : maintenanceDialog?.enable
                  ? 'Enable maintenance'
                  : 'Disable maintenance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthCard title="Database" status={health.database} icon={<Database className="w-5 h-5" />} />
          <HealthCard title="Firebase" status={health.firebase} icon={<Server className="w-5 h-5" />} />
          <HealthCard title="Payment Gateway" status={health.razorpay} icon={<CreditCard className="w-5 h-5" />} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
          <CardDescription>Manage platform-wide settings and variables.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.filter((s) => s.key !== MAINTENANCE_SETTING_KEY).map((setting) => (
            <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg dark:border-slate-800">
              <div className="flex-1">
                <Label className="text-base font-semibold">{setting.key.replace(/_/g, ' ').toUpperCase()}</Label>
                <p className="text-sm text-slate-500">{setting.description}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input 
                  defaultValue={setting.value} 
                  className="w-full sm:w-48"
                  id={`input-${setting.key}`}
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById(`input-${setting.key}`) as HTMLInputElement;
                    if (input) handleSaveSetting(setting.key, input.value);
                  }}
                  disabled={saving === setting.key}
                >
                  {saving === setting.key ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function HealthCard({ title, status, icon }: { title: string, status: string, icon: React.ReactNode }) {
  const isHealthy = status === 'healthy';
  return (
    <Card className={isHealthy ? 'border-green-200 dark:border-green-900/30' : 'border-red-200 dark:border-red-900/30'}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full ${isHealthy ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-bold capitalize">{status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
