import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const userId = parseInt(id, 10);
    // Admin or Self
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Super_Admin' && currentUser.user_id !== userId) {
      throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
    }
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งานนี้');
    }
    return user;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @CurrentUser() currentUser: any,
  ) {
    const userId = parseInt(id, 10);
    // Admin or Self
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Super_Admin' && currentUser.user_id !== userId) {
      throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
    }
    const user = await this.usersService.update(userId, updateData);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งานนี้');
    }
    return user;
  }

  @Delete(':id')
  @Roles('Super_Admin')
  async remove(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    const deleted = await this.usersService.delete(userId);
    if (!deleted) {
      throw new NotFoundException('ไม่พบผู้ใช้งานนี้');
    }
    return { message: 'ลบผู้ใช้งานสำเร็จ' };
  }

  @Patch(':id/role')
  @Roles('Super_Admin')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    const userId = parseInt(id, 10);
    if (!role || !['User', 'Admin', 'Super_Admin'].includes(role)) {
      throw new BadRequestException('บทบาทไม่ถูกต้อง');
    }
    const user = await this.usersService.updateRole(userId, role);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งานนี้');
    }
    return user;
  }

  @Post(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/profiles';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `profile-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
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
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @CurrentUser() currentUser: any,
  ) {
    const userId = parseInt(id, 10);
    // Allow updating own profile image or Admin/Super_Admin
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Super_Admin' && currentUser.user_id !== userId) {
      throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
    }
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์อัปโหลด');
    }
    const imageUrl = `/uploads/profiles/${file.filename}`;
    const user = await this.usersService.updateProfileImage(userId, imageUrl);
    if (!user) {
      throw new NotFoundException('ไม่พบผู้ใช้งานนี้');
    }
    return user;
  }
}
