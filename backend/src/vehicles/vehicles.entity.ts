import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  vehicle_id: number;

  @Column()
  vehicle_name: string;

  @Column()
  type: string; // 'Sedan' | 'Pickup' | 'Van' | 'SUV' | 'Other'

  @Column()
  capacity: number;

  @Column()
  re_fuel: string;

  @Column({ default: 0 })
  total_mile: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  last_maintenance: string;

  @Column({ default: 'available' })
  status: string; // 'available' | 'unavailable'

  @Column({ nullable: true })
  vehicle_img: string;

  @Column({ default: 0 })
  total_bookby: number;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  last_update: string;
}
