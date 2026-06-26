import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Vehicle } from '../vehicles/vehicles.entity';
import { User } from '../users/user.entity';
import { CreateBookingDto, BookingFilterDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async populatePassengerUsers(bookings: Booking[]): Promise<Booking[]> {
    const userIds = new Set<number>();
    bookings.forEach((b) => {
      if (b.passenger) {
        const ids = b.passenger
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
        ids.forEach((id) => userIds.add(id));
      }
    });

    if (userIds.size === 0) {
      bookings.forEach((b) => (b.passengerUsers = []));
      return bookings;
    }

    const users = await this.userRepo.createQueryBuilder('u')
      .where('u.user_id IN (:...ids)', { ids: Array.from(userIds) })
      .getMany();

    const userMap = new Map<number, User>();
    users.forEach((u) => {
      delete u.password;
      userMap.set(u.user_id, u);
    });

    bookings.forEach((b) => {
      if (b.passenger) {
        const ids = b.passenger
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
        b.passengerUsers = ids.map((id) => userMap.get(id)).filter((u): u is User => !!u);
      } else {
        b.passengerUsers = [];
      }
    });

    return bookings;
  }

  async findAll(filter: BookingFilterDto): Promise<Booking[]> {
    const query = this.bookingRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.bookedForUser', 'bf')
      .leftJoinAndSelect('b.vehicle', 'v');

    if (filter.status) {
      query.andWhere('b.status = :status', { status: filter.status });
    }
    if (filter.vehicle_id) {
      query.andWhere('b.vehicle_id = :vehicleId', { vehicleId: filter.vehicle_id });
    }
    if (filter.booked_by) {
      query.andWhere('b.booked_by = :bookedBy', { bookedBy: filter.booked_by });
    }
    if (filter.booked_for) {
      query.andWhere('b.booked_for = :bookedFor', { bookedFor: filter.booked_for });
    }
    if (filter.passenger) {
      query.andWhere(
        '(b.passenger = :passId OR b.passenger LIKE :passIdStart OR b.passenger LIKE :passIdMid OR b.passenger LIKE :passIdEnd)',
        {
          passId: filter.passenger,
          passIdStart: `${filter.passenger},%`,
          passIdMid: `%,${filter.passenger},%`,
          passIdEnd: `%,${filter.passenger}`,
        }
      );
    }
    if (filter.user_id) {
      query.andWhere(
        '(b.booked_by = :uid OR b.booked_for = :uid OR b.passenger = :uidStr OR b.passenger LIKE :uidStart OR b.passenger LIKE :uidMid OR b.passenger LIKE :uidEnd)',
        {
          uid: filter.user_id,
          uidStr: String(filter.user_id),
          uidStart: `${filter.user_id},%`,
          uidMid: `%,${filter.user_id},%`,
          uidEnd: `%,${filter.user_id}`,
        }
      );
    }
    if (filter.depart_start) {
      query.andWhere('b.depart >= :departStart', { departStart: filter.depart_start });
    }
    if (filter.depart_end) {
      query.andWhere('b.depart <= :departEnd', { departEnd: filter.depart_end });
    }

    const bookings = await query.getMany();
    bookings.forEach((b) => {
      if (b.user) delete b.user.password;
      if (b.bookedForUser) delete b.bookedForUser.password;
    });
    return this.populatePassengerUsers(bookings);
  }

  async findMyBookings(userId: number): Promise<Booking[]> {
    const bookings = await this.bookingRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.bookedForUser', 'bf')
      .leftJoinAndSelect('b.vehicle', 'v')
      .where(
        '(b.booked_by = :userId OR b.booked_for = :userId OR b.passenger = :userIdStr OR b.passenger LIKE :userIdStart OR b.passenger LIKE :userIdMid OR b.passenger LIKE :userIdEnd)',
        {
          userId,
          userIdStr: String(userId),
          userIdStart: `${userId},%`,
          userIdMid: `%,${userId},%`,
          userIdEnd: `%,${userId}`,
        }
      )
      .getMany();

    bookings.forEach((b) => {
      if (b.user) delete b.user.password;
      if (b.bookedForUser) delete b.bookedForUser.password;
    });
    return this.populatePassengerUsers(bookings);
  }

  async findById(book_id: number): Promise<Booking | null> {
    const booking = await this.bookingRepo.findOne({
      where: { book_id },
      relations: {
        user: true,
        bookedForUser: true,
        vehicle: true,
      },
    });
    if (booking) {
      if (booking.user) delete booking.user.password;
      if (booking.bookedForUser) delete booking.bookedForUser.password;
      const [populated] = await this.populatePassengerUsers([booking]);
      return populated;
    }
    return null;
  }

  async create(userId: number, dto: CreateBookingDto): Promise<Booking> {
    // 1. Check vehicle existence and status
    const vehicle = await this.vehicleRepo.findOne({ where: { vehicle_id: dto.vehicle_id } });
    if (!vehicle) {
      throw new NotFoundException('ไม่พบข้อมูลรถที่ต้องการจอง');
    }
    if (vehicle.status !== 'available') {
      throw new BadRequestException('รถคันนี้ไม่พร้อมใช้งาน');
    }

    // 2. Prevent Double Booking
    const overlapping = await this.bookingRepo.createQueryBuilder('b')
      .where('b.vehicle_id = :vehicleId', { vehicleId: dto.vehicle_id })
      .andWhere('b.status != :cancelStatus', { cancelStatus: 'cancel' })
      .andWhere('b.depart < :returnTime AND b.return > :depart', {
        depart: dto.depart,
        returnTime: dto.return,
      })
      .getOne();

    if (overlapping) {
      throw new BadRequestException('รถคันนี้ถูกจองในช่วงเวลาดังกล่าวแล้ว');
    }

    // 3. Create booking
    const booking = this.bookingRepo.create({
      ...dto,
      booked_by: dto.booked_by || userId,
      status: 'booked',
      create_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    const saved = await this.bookingRepo.save(booking);

    // 4. Increment total_booked on User and total_bookby on Vehicle
    const userToIncrement = dto.booked_by || userId;
    await this.userRepo.increment({ user_id: userToIncrement }, 'total_booked', 1);
    await this.vehicleRepo.increment({ vehicle_id: dto.vehicle_id }, 'total_bookby', 1);

    return (await this.findById(saved.book_id))!;
  }

  async cancel(book_id: number, currentUser: any): Promise<Booking> {
    const booking = await this.findById(book_id);
    if (!booking) {
      throw new NotFoundException('ไม่พบข้อมูลการจองนี้');
    }

    // Authorization: Owner or passenger
    const passengerIds = booking.passenger ? booking.passenger.split(',').map(id => parseInt(id.trim(), 10)) : [];
    if (
      currentUser.role !== 'Admin' &&
      currentUser.role !== 'Super_Admin' &&
      booking.booked_by !== currentUser.user_id &&
      booking.booked_for !== currentUser.user_id &&
      !passengerIds.includes(currentUser.user_id)
    ) {
      throw new ForbiddenException('ไม่มีสิทธิ์ยกเลิกการจองนี้');
    }

    if (booking.status === 'cancel') {
      return booking;
    }

    await this.bookingRepo.update(book_id, {
      status: 'cancel',
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    return (await this.findById(book_id))!;
  }

  async complete(book_id: number, mileDistance?: number): Promise<Booking> {
    const booking = await this.findById(book_id);
    if (!booking) {
      throw new NotFoundException('ไม่พบข้อมูลการจองนี้');
    }

    const updateData: any = {
      status: 'complete',
      last_update: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    if (mileDistance !== undefined && mileDistance !== null) {
      updateData.mile_distance = mileDistance;
      // Add mileage to vehicle
      await this.vehicleRepo.increment({ vehicle_id: booking.vehicle_id }, 'total_mile', mileDistance);
    }

    await this.bookingRepo.update(book_id, updateData);

    return (await this.findById(book_id))!;
  }
}
