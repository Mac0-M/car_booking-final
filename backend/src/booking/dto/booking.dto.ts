import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'Vehicle ID is required.' })
  @IsNumber({}, { message: 'Vehicle ID must be a number.' })
  @Min(1)
  @Type(() => Number)
  vehicle_id: number;


  @IsOptional()
  @IsNumber({}, { message: 'Booker ID must be a number.' })
  @Min(1)
  @Type(() => Number)
  booked_by?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Passenger ID must be a number.' })
  @Min(1)
  @Type(() => Number)
  booked_for?: number;

  @IsNotEmpty({ message: 'Departure time is required.' })
  @IsString()
  depart: string;

  @IsNotEmpty({ message: 'Return time is required.' })
  @IsString()
  return: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  use_for?: string;
}

export class BookingFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vehicle_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  booked_by?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  booked_for?: number;


  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  user_id?: number;

  @IsOptional()
  @IsString()
  depart_start?: string;

  @IsOptional()
  @IsString()
  depart_end?: string;
}
