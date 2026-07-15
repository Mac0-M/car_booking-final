import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicles.entity';
import { Booking } from '../booking/booking.entity';
import { CreateVehicleDto, UpdateVehicleDto, VehicleFilterDto, VehicleListFilterDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async findAll(filter: VehicleListFilterDto): Promise<Vehicle[]> {
    const query = this.vehicleRepo.createQueryBuilder('v');

    if (filter.type) {
      query.andWhere('v.type = :type', { type: filter.type });
    }
    if (filter.status) {
      query.andWhere('v.status = :status', { status: filter.status });
    }
    if (filter.capacity) {
      query.andWhere('v.capacity = :capacity', { capacity: filter.capacity });
    }
    if (filter.search) {
      query.andWhere('v.vehicle_name LIKE :search', { search: `%${filter.search}%` });
    }
    if (filter.re_fuel !== undefined) {
      query.andWhere('v.re_fuel = :reFuel', { reFuel: filter.re_fuel });
    }

    return query.getMany();
  }

  async findById(vehicle_id: number): Promise<Vehicle | null> {
    return this.vehicleRepo.findOne({ where: { vehicle_id } });
  }

  async findAvailable(dto: VehicleFilterDto): Promise<Vehicle[]> {
    const { depart, return: returnTime, excludeBookingId } = dto;

    const qb = this.vehicleRepo.createQueryBuilder('v');

    return qb
      .where('v.status = :status', { status: 'available' })
      .andWhere((sub) => {
        let subQueryBuilder = sub
          .subQuery()
          .select('b.vehicle_id')
          .from(Booking, 'b')
          .where('b.status = :activeStatus')
          .andWhere('b.depart < :returnTime AND b.return > :depart');

        if (excludeBookingId) {
          subQueryBuilder = subQueryBuilder.andWhere('b.book_id != :excludeBookingId');
        }

        return 'v.vehicle_id NOT IN ' + subQueryBuilder.getQuery();
      })
      .setParameter('activeStatus', 'booked')
      .setParameter('depart', depart)
      .setParameter('returnTime', returnTime)
      .setParameter('excludeBookingId', excludeBookingId)
      .getMany();
  }

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepo.create({
      ...dto,
      last_maintenance: dto.last_maintenance || new Date().toISOString().replace('T', ' ').substring(0, 19),
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    return this.vehicleRepo.save(vehicle);
  }

  async update(vehicle_id: number, dto: UpdateVehicleDto): Promise<Vehicle | null> {
    const vehicle = await this.findById(vehicle_id);
    if (!vehicle) {
      return null;
    }

    const updatedData = {
      ...dto,
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    await this.vehicleRepo.update(vehicle_id, updatedData);
    return this.findById(vehicle_id);
  }

  async delete(vehicle_id: number): Promise<boolean> {
    const result = await this.vehicleRepo.delete(vehicle_id);
    return result.affected !== undefined && result.affected > 0;
  }

  async updateStatus(vehicle_id: number, status: string): Promise<Vehicle | null> {
    const vehicle = await this.findById(vehicle_id);
    if (!vehicle) {
      return null;
    }

    await this.vehicleRepo.update(vehicle_id, {
      status,
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    return this.findById(vehicle_id);
  }

  async updateImage(vehicle_id: number, imageUrl: string): Promise<Vehicle | null> {
    const vehicle = await this.findById(vehicle_id);
    if (!vehicle) {
      return null;
    }

    await this.vehicleRepo.update(vehicle_id, {
      vehicle_img: imageUrl,
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    return this.findById(vehicle_id);
  }
}
