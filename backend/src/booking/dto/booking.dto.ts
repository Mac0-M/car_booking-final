import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'กรุณาระบุรถที่ต้องการจอง' })
  @IsNumber({}, { message: 'ID รถต้องเป็นตัวเลข' })
  @Min(1)
  @Type(() => Number)
  vehicle_id: number;

  @IsOptional()
  @IsString()
  passenger?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID ผู้จองต้องเป็นตัวเลข' })
  @Min(1)
  @Type(() => Number)
  booked_by?: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID ผู้ฝากจองต้องเป็นตัวเลข' })
  @Min(1)
  @Type(() => Number)
  booked_for?: number;

  @IsNotEmpty({ message: 'กรุณาระบุเวลาเดินทางไป' })
  @IsString()
  depart: string;

  @IsNotEmpty({ message: 'กรุณาระบุเวลากลับ' })
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
  @IsString()
  passenger?: string;

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
