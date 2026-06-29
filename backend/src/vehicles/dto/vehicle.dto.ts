import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @IsNotEmpty({ message: 'Vehicle name is required.' })
  @IsString()
  vehicle_name: string;

  @IsNotEmpty({ message: 'Vehicle type is required.' })
  @IsString()
  @IsIn(['Sedan', 'Pickup', 'Van', 'SUV', 'Other'], { message: 'Invalid vehicle type.' })
  type: string;

  @IsNotEmpty({ message: 'Capacity is required.' })
  @IsNumber({}, { message: 'Capacity must be a number.' })
  @Min(1, { message: 'Capacity must be greater than 0.' })
  @Type(() => Number)
  capacity: number;

  @IsNotEmpty({ message: 'Refuel status is required.' })
  @IsBoolean()
  @Type(() => Boolean)
  re_fuel: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Total mileage must be a number.' })
  @Min(0)
  @Type(() => Number)
  total_mile?: number;

  @IsOptional()
  @IsString()
  last_maintenance?: string;

  @IsOptional()
  @IsString()
  @IsIn(['available', 'unavailable'], { message: 'Invalid status.' })
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
  @IsIn(['Sedan', 'Pickup', 'Van', 'SUV', 'Other'], { message: 'Invalid vehicle type.' })
  type?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Capacity must be a number.' })
  @Min(1, { message: 'Capacity must be greater than 0.' })
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  re_fuel?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Total mileage must be a number.' })
  @Min(0)
  @Type(() => Number)
  total_mile?: number;

  @IsOptional()
  @IsString()
  last_maintenance?: string;

  @IsOptional()
  @IsString()
  @IsIn(['available', 'unavailable'], { message: 'Invalid status.' })
  status?: string;

  @IsOptional()
  @IsString()
  vehicle_img?: string;
}

export class VehicleFilterDto {
  @IsNotEmpty({ message: 'Departure time is required.' })
  @IsString()
  depart: string;

  @IsNotEmpty({ message: 'Return time is required.' })
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

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  re_fuel?: boolean;
}
