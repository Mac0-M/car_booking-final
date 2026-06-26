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
