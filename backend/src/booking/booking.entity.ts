import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicles.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  book_id: number;

  @Column()
  booked_by: number;

  @Column({ nullable: true })
  passenger: number;

  @Column()
  vehicle_id: number;

  @Column()
  depart: string;

  @Column({ nullable: true })
  return: string;

  @Column({ nullable: true })
  destination: string;

  @Column({ nullable: true })
  use_for: string;

  @Column({ nullable: true })
  mile_distance: number;

  @Column({ default: 'booked' })
  status: string; // 'booked' | 'complete' | 'cancel'

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  create_at: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  last_update: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'booked_by' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'passenger' })
  passengerUser: User;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}
