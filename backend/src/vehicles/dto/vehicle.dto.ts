import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @IsNotEmpty({ message: 'กรุณาระบุชื่อรถ' })
  @IsString()
  vehicle_name: string;

  @IsNotEmpty({ message: 'กรุณาระบุประเภทรถ' })
  @IsString()
  @IsIn(['Sedan', 'Pickup', 'Van', 'SUV', 'Other'], { message: 'ประเภทรถไม่ถูกต้อง' })
  type: string;

  @IsNotEmpty({ message: 'กรุณาระบุความจุผู้โดยสาร' })
  @IsNumber({}, { message: 'ความจุผู้โดยสารต้องเป็นตัวเลข' })
  @Min(1, { message: 'ความจุผู้โดยสารต้องมากกว่า 0' })
  @Type(() => Number)
  capacity: number;

  @IsNotEmpty({ message: 'กรุณาระบุประเภทเชื้อเพลิง/การชาร์จ' })
  @IsString()
  re_fuel: string;

  @IsOptional()
  @IsNumber({}, { message: 'ระยะทางต้องเป็นตัวเลข' })
  @Min(0)
  @Type(() => Number)
  total_mile?: number;

  @IsOptional()
  @IsString()
  last_maintenance?: string;

  @IsOptional()
  @IsString()
  @IsIn(['available', 'unavailable'], { message: 'สถานะไม่ถูกต้อง' })
  status?: string;

  @IsOptional()
  @IsString()
  vehicle_img?: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  vehicle_name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Sedan', 'Pickup', 'Van', 'SUV', 'Other'], { message: 'ประเภทรถไม่ถูกต้อง' })
  type?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ความจุผู้โดยสารต้องเป็นตัวเลข' })
  @Min(1, { message: 'ความจุผู้โดยสารต้องมากกว่า 0' })
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsString()
  re_fuel?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ระยะทางต้องเป็นตัวเลข' })
  @Min(0)
  @Type(() => Number)
  total_mile?: number;

  @IsOptional()
  @IsString()
  last_maintenance?: string;

  @IsOptional()
  @IsString()
  @IsIn(['available', 'unavailable'], { message: 'สถานะไม่ถูกต้อง' })
  status?: string;

  @IsOptional()
  @IsString()
  vehicle_img?: string;
}

export class VehicleFilterDto {
  @IsNotEmpty({ message: 'กรุณาระบุเวลาออกเดินทาง' })
  @IsString()
  depart: string;

  @IsNotEmpty({ message: 'กรุณาระบุเวลากลับ' })
  @IsString()
  return: string;
}

export class VehicleListFilterDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
