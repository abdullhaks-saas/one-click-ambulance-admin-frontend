import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminPricingApi, type PricingRule } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, IndianRupee } from 'lucide-react';

interface PricingField {
  key: keyof Pick<PricingRule, 'base_fare' | 'per_km_price' | 'emergency_charge' | 'night_charge' | 'minimum_fare'>;
  label: string;
  description: string;
}

const PRICING_FIELDS: PricingField[] = [
  { key: 'base_fare', label: 'Base Fare', description: 'Fixed charge at start of ride' },
  { key: 'per_km_price', label: 'Per KM Price', description: 'Charge per kilometre' },
  { key: 'emergency_charge', label: 'Emergency Charge', description: 'Extra for emergency bookings' },
  { key: 'night_charge', label: 'Night Charge', description: 'Extra charge for night hours' },
  { key: 'minimum_fare', label: 'Minimum Fare', description: 'Minimum bill amount' },
];

interface PricingEditModalProps {
  rule: PricingRule | null;
  onClose: () => void;
  onSaved: (updated: PricingRule) => void;
}

export function PricingEditModal({ rule, onClose, onSaved }: PricingEditModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rule) {
      setValues({
        base_fare: String(rule.base_fare),
        per_km_price: String(rule.per_km_price),
        emergency_charge: String(rule.emergency_charge),
        night_charge: String(rule.night_charge),
        minimum_fare: String(rule.minimum_fare),
      });
      setErrors({});
    }
  }, [rule]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    for (const field of PRICING_FIELDS) {
      const val = parseFloat(values[field.key] ?? '');
      if (isNaN(val)) {
        newErrors[field.key] = 'Must be a valid number';
      } else if (val < 0) {
        newErrors[field.key] = 'Cannot be negative';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!rule || !validate()) return;
    setSaving(true);
    try {
      const { data } = await adminPricingApi.update({
        ambulance_type_id: rule.ambulance_type_id,
        base_fare: parseFloat(values.base_fare),
        per_km_price: parseFloat(values.per_km_price),
        emergency_charge: parseFloat(values.emergency_charge),
        night_charge: parseFloat(values.night_charge),
        minimum_fare: parseFloat(values.minimum_fare),
      });
      toast.success(`Pricing updated for ${rule.ambulance_type_name}`);
      onSaved(data);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { apiMessage?: string })?.apiMessage ?? 'Failed to update pricing';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!rule} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-red-600" />
            Edit Pricing — {rule?.ambulance_type_name}
          </DialogTitle>
        </DialogHeader>

        {rule && (
          <div className="space-y-4">
            {PRICING_FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key} className="font-medium">
                  {field.label}
                </Label>
                <p className="text-xs text-slate-500">{field.description}</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
                  <Input
                    id={field.key}
                    type="number"
                    min="0"
                    step="0.01"
                    value={values[field.key] ?? ''}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [field.key]: e.target.value }));
                      if (errors[field.key]) setErrors((er) => ({ ...er, [field.key]: '' }));
                    }}
                    className={`pl-8 ${errors[field.key] ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors[field.key] && (
                  <p className="text-xs text-red-500">{errors[field.key]}</p>
                )}
              </div>
            ))}

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Pricing'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
