import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PricingCard } from './pricing/PricingCard';
import { PricingEditModal } from './pricing/PricingEditModal';
import { adminPricingApi, type PricingRule } from '@/services/api';
import { toast } from 'sonner';
import { IndianRupee, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PricingManagementPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  async function fetchPricing() {
    setLoading(true);
    try {
      const { data } = await adminPricingApi.list();
      setRules(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to load pricing rules';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPricing();
  }, []);

  function handleSaved(updated: PricingRule) {
    setRules((prev) =>
      prev.map((r) =>
        r.ambulance_type_id === updated.ambulance_type_id ? updated : r
      )
    );
    setEditingRule(null);
  }

  return (
    <div className="space-y-6 text-slate-950 dark:text-slate-50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-red-600" />
            pricing configuration
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure fare rules for each ambulance type
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPricing}
          disabled={loading}
          className="self-start sm:self-auto gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="h-7 w-7 text-zinc-400" />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-400">No ambulance types found</p>
          <p className="text-sm text-slate-400 mt-1">Create ambulance types first to configure pricing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <PricingCard
              key={rule.ambulance_type_id}
              rule={rule}
              onEdit={setEditingRule}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <PricingEditModal
        rule={editingRule}
        onClose={() => setEditingRule(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
