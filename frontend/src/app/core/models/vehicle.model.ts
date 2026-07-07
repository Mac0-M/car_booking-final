/**
 * Vehicle Model: นิยามประเภทข้อมูลรถยนต์ (Vehicle)
 * - ตรงตาม Backend entity fields
 */
export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  vehicleTypeId: string;
  driverId: string;
  capacity: number;
  status: string;
  vehicleState?: 'available' | 'booked' | 'unavailable';
  reFuel?: boolean;
  totalMile?: number;
  lastMaintenance?: string;
  vehicleImg?: string | null;
  totalBookBy?: number;
  lastUpdate?: string;
}

export interface VehicleType {
  id: string;
  name: string;
  capacityMin: number;
  capacityMax: number;
  ratePerKm: number;
  basePrice: number;
}

export const VEHICLE_TYPES = [
  { value: 'Sedan', label: 'Sedan', dotColor: 'bg-blue-500', ringClass: 'ring-blue-500' },
  { value: 'Pickup', label: 'Pickup', dotColor: 'bg-red-500', ringClass: 'ring-red-500' },
  { value: 'Van', label: 'Van', dotColor: 'bg-orange-500', ringClass: 'ring-orange-500' },
  { value: 'SUV', label: 'SUV', dotColor: 'bg-emerald-500', ringClass: 'ring-emerald-500' },
  { value: 'Other', label: 'Other', dotColor: 'bg-violet-500', ringClass: 'ring-violet-500' }
];

export function getVehicleTypeColor(vehicleTypeId: string): { dotColor: string; ringClass: string } {
  const type = vehicleTypeId || 'Sedan';
  const found = VEHICLE_TYPES.find(t => t.value === type);
  if (found) {
    return { dotColor: found.dotColor, ringClass: found.ringClass };
  }
  // Fallback for custom or undefined types to Sedan (or Other)
  return { dotColor: 'bg-gray-400', ringClass: 'ring-gray-400' };
}
