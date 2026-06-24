import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'กรุณาระบุรถที่ต้องการจอง' })
  @IsNumber({}, { message: 'ID รถต้องเป็นตัวเลข' })
  @Min(1)
  @Type(() => Number)
  vehicle_id: number;

  @IsOptional()
  @IsNumber({}, { message: 'ID ผู้โดยสารต้องเป็นตัวเลข' })
  @Min(1)
  @Type(() => Number)
  passenger?: number;

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
  passenger?: number;

  @IsOptional()
  @IsString()
  depart_start?: string;

  @IsOptional()
  @IsString()
  depart_end?: string;
}
