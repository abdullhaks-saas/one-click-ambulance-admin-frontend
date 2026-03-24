import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import type { PricingRule } from '@/services/api';
import { Pencil, Ambulance } from 'lucide-react';

interface PricingField {
  label: string;
  value: number;
  highlight?: boolean;
}

interface PricingCardProps {
  rule: PricingRule;
  onEdit: (rule: PricingRule) => void;
}

function formatFare(value: number) {
  return `₹${Number(value).toFixed(2)}`;
}

export function PricingCard({ rule, onEdit }: PricingCardProps) {
  const fields: PricingField[] = [
    { label: 'Base Fare', value: rule.base_fare, highlight: true },
    { label: 'Per KM', value: rule.per_km_price },
    { label: 'Emergency Charge', value: rule.emergency_charge },
    { label: 'Night Charge', value: rule.night_charge },
    { label: 'Minimum Fare', value: rule.minimum_fare },
  ];

  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Red accent strip */}
      <div className="absolute left-0 top-0 h-full w-1 bg-red-600 rounded-l-xl" />

      <CardContent className="pt-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <Ambulance className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                {rule.ambulance_type_name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {rule.id ? rule.id.slice(0, 8) + '…' : 'No rule set'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(rule)}
            title="Edit pricing"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Pricing grid */}
        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{f.label}</span>
              <span className={`text-sm font-semibold tabular-nums ${f.highlight ? 'text-slate-900 dark:text-slate-50 text-base' : 'text-slate-700 dark:text-slate-300'}`}>
                {formatFare(f.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Edit CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 gap-1.5 text-slate-600 dark:text-slate-300"
          onClick={() => onEdit(rule)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Pricing
        </Button>
      </CardContent>
    </Card>
  );
}
