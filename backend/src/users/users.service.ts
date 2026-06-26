import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    if (process.env.ENABLE_SUPER_ADMIN === "false") {
      console.log(`[Seed] Super Admin seeding is disabled via config.`);
      return;
    }
    const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@admin.com";
    const password = process.env.SUPER_ADMIN_PASSWORD || "superadmin";
    const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
    const phone = process.env.SUPER_ADMIN_PHONE || "0000000000";

    const existingAdmin = await this.userRepository.findOne({ where: { role: "Super_Admin" } });
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!existingAdmin) {
      const superAdmin = this.userRepository.create({
        user_name: name,
        email,
        password: hashedPassword,
        phone,
        role: "Super_Admin",
        total_booked: 0,
      });
      await this.userRepository.save(superAdmin);
      console.log(`[Seed] Super Admin user created with email: ${email}`);
    } else {
      console.log(`[Seed] Super Admin user already exists. Updating details to match .env configuration...`);
      existingAdmin.user_name = name;
      existingAdmin.email = email;
      existingAdmin.password = hashedPassword;
      existingAdmin.phone = phone;
      await this.userRepository.save(existingAdmin);
      console.log(`[Seed] Super Admin updated with email: ${email}`);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    // Exclude passwords from output
    users.forEach((u) => delete u.password);
    return users;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(user_id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (user) {
      delete user.password;
    }
    return user;
  }

  // Helper method to retrieve user with password for auth checking
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.userRepository.create(userData);
    const saved = await this.userRepository.save(user);
    delete saved.password;
    return saved;
  }

  async update(
    user_id: number,
    updateData: Partial<User>,
  ): Promise<User | null> {
    // Security check: do not allow password or role to be updated via standard update
    delete updateData.role;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.userRepository.update(user_id, updateData);
    return this.findById(user_id);
  }

  async updateRole(user_id: number, role: string): Promise<User | null> {
    await this.userRepository.update(user_id, { role });
    return this.findById(user_id);
  }

  async updateProfileImage(
    user_id: number,
    imageUrl: string,
  ): Promise<User | null> {
    await this.userRepository.update(user_id, { profile_img: imageUrl });
    return this.findById(user_id);
  }

  async delete(user_id: number): Promise<boolean> {
    const result = await this.userRepository.delete(user_id);
    return result.affected !== undefined && result.affected > 0;
  }
}
