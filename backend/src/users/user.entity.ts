import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  user_name: string;

  @Column()
  password?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profile_img: string;

  @Column({ default: 0 })
  total_booked: number;

  @Column({ default: 'User' })
  role: string; // 'User' | 'Admin' | 'Super_Admin'

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  create_at: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  last_update: string;
}
