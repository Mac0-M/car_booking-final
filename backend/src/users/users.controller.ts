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
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser } from "../common/current-user.decorator";
import { User } from "./user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() currentUser: any) {
    const userId = parseInt(id, 10);
    // Admin or Self
    if (
      currentUser.role !== "Admin" &&
      currentUser.role !== "Super_Admin" &&
      currentUser.user_id !== userId
    ) {
      throw new ForbiddenException("Access denied.");
    }
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateData: Partial<User>,
    @CurrentUser() currentUser: any,
  ) {
    const userId = parseInt(id, 10);
    // Admin or Self
    if (
      currentUser.role !== "Admin" &&
      currentUser.role !== "Super_Admin" &&
      currentUser.user_id !== userId
    ) {
      throw new ForbiddenException("Access denied.");
    }
    const user = await this.usersService.update(userId, updateData);
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }

  @Post()
  async create(@Body() userData: any, @CurrentUser() currentUser: any) {
    // Role restrictions:
    // - Super Admin can only create Admin (role = 'Admin')
    // - Admin can only create regular User (role = 'User')
    if (currentUser.role === "Super_Admin") {
      userData.role = "Admin";
    } else if (currentUser.role === "Admin") {
      userData.role = "User";
    } else {
      throw new ForbiddenException("Only Admin or Super Admin can Add Users.");
    }

    if (
      !userData.user_name ||
      !userData.email ||
      !userData.password ||
      !userData.phone
    ) {
      throw new BadRequestException(
        "Required fields: user_name, email, password, phone.",
      );
    }

    const existing = await this.usersService.findByEmail(userData.email);
    if (existing) {
      throw new BadRequestException("Email address already registered.");
    }

    return this.usersService.create(userData);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() currentUser: any) {
    const userId = parseInt(id, 10);
    const targetUser = await this.usersService.findById(userId);
    if (!targetUser) {
      throw new NotFoundException("User not found.");
    }

    // Role restrictions:
    // - Super Admin can delete Admin and User
    // - Admin can delete User
    if (currentUser.role === "Super_Admin") {
      if (targetUser.role === "Super_Admin") {
        throw new ForbiddenException("Cannot delete a Super Admin.");
      }
    } else if (currentUser.role === "Admin") {
      if (targetUser.role !== "User") {
        throw new ForbiddenException("Admins can only delete regular users.");
      }
    } else {
      throw new ForbiddenException(
        "You do not have permission to delete users.",
      );
    }

    const deleted = await this.usersService.delete(userId);
    if (!deleted) {
      throw new NotFoundException("User not found.");
    }
    return { message: "User deleted successfully." };
  }

  @Patch(":id/role")
  @Roles("Super_Admin")
  async updateRole(@Param("id") id: string, @Body("role") role: string) {
    const userId = parseInt(id, 10);
    const targetUser = await this.usersService.findById(userId);
    if (!targetUser) {
      throw new NotFoundException("User not found.");
    }
    if (targetUser.role === "Super_Admin") {
      throw new ForbiddenException("Cannot modify the role of a Super Admin.");
    }

    if (!role || !["User", "Admin", "Super_Admin"].includes(role)) {
      throw new BadRequestException("Invalid role.");
    }
    const user = await this.usersService.updateRole(userId, role);
    return user;
  }

  @Post(":id/profile-image")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = "./uploads/profiles";
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            `profile-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException(
              "Only image files (jpg, jpeg, png) are allowed.",
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @Param("id") id: string,
    @UploadedFile() file: any,
    @CurrentUser() currentUser: any,
  ) {
    const userId = parseInt(id, 10);
    // Allow updating own profile image or Admin/Super_Admin
    if (
      currentUser.role !== "Admin" &&
      currentUser.role !== "Super_Admin" &&
      currentUser.user_id !== userId
    ) {
      throw new ForbiddenException("Access denied.");
    }
    if (!file) {
      throw new BadRequestException("No upload file found.");
    }
    const imageUrl = `/uploads/profiles/${file.filename}`;
    const user = await this.usersService.updateProfileImage(userId, imageUrl);
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return user;
  }
}
