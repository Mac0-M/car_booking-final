import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CreateVehicleDto, UpdateVehicleDto, VehicleFilterDto, VehicleListFilterDto } from './dto/vehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('available')
  async findAvailable(@Query() query: VehicleFilterDto) {
    return this.vehiclesService.findAvailable(query);
  }

  @Get()
  async findAll(@Query() query: VehicleListFilterDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vehicleId = parseInt(id, 10);
    const vehicle = await this.vehiclesService.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('ไม่พบข้อมูลรถคันนี้');
    }
    return vehicle;
  }

  @Post()
  @Roles('Admin', 'Super_Admin')
  async create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Patch(':id')
  @Roles('Admin', 'Super_Admin')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    const vehicleId = parseInt(id, 10);
    const vehicle = await this.vehiclesService.update(vehicleId, dto);
    if (!vehicle) {
      throw new NotFoundException('ไม่พบข้อมูลรถคันนี้');
    }
    return vehicle;
  }

  @Delete(':id')
  @Roles('Admin', 'Super_Admin')
  async remove(@Param('id') id: string) {
    const vehicleId = parseInt(id, 10);
    const deleted = await this.vehiclesService.delete(vehicleId);
    if (!deleted) {
      throw new NotFoundException('ไม่พบข้อมูลรถคันนี้');
    }
    return { message: 'ลบข้อมูลรถสำเร็จ' };
  }

  @Patch(':id/status')
  @Roles('Admin', 'Super_Admin')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const vehicleId = parseInt(id, 10);
    if (!status || !['available', 'unavailable'].includes(status)) {
      throw new BadRequestException('สถานะรถไม่ถูกต้อง');
    }
    const vehicle = await this.vehiclesService.updateStatus(vehicleId, status);
    if (!vehicle) {
      throw new NotFoundException('ไม่พบข้อมูลรถคันนี้');
    }
    return vehicle;
  }

  @Post(':id/image')
  @Roles('Admin', 'Super_Admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/vehicles';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `vehicle-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('อนุญาตเฉพาะไฟล์รูปภาพ (jpg, jpeg, png) เท่านั้น'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadVehicleImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    const vehicleId = parseInt(id, 10);
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์อัปโหลด');
    }
    const imageUrl = `/uploads/vehicles/${file.filename}`;
    const vehicle = await this.vehiclesService.updateImage(vehicleId, imageUrl);
    if (!vehicle) {
      throw new NotFoundException('ไม่พบข้อมูลรถคันนี้');
    }
    return vehicle;
  }
}
