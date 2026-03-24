import { axiosInstance } from './axiosInstance';

export interface PricingRule {
  id: string;
  ambulance_type_id: string;
  ambulance_type_name: string;
  base_fare: number;
  per_km_price: number;
  emergency_charge: number;
  night_charge: number;
  minimum_fare: number;
  created_at: string;
  updated_at: string;
}

export interface UpdatePricingDto {
  ambulance_type_id: string;
  base_fare?: number;
  per_km_price?: number;
  emergency_charge?: number;
  night_charge?: number;
  minimum_fare?: number;
}

export const adminPricingApi = {
  list: () => axiosInstance.get<PricingRule[]>('/admin/pricing'),

  getById: (ambulance_type_id: string) =>
    axiosInstance.get<PricingRule>(`/admin/pricing/${ambulance_type_id}`),

  update: (dto: UpdatePricingDto) =>
    axiosInstance.post<PricingRule>('/admin/pricing/update', dto),
};
