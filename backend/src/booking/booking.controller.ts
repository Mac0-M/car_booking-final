import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateBookingDto, BookingFilterDto, UpdateBookingDto } from './dto/booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('my')
  async findMy(@CurrentUser() currentUser: any) {
    return this.bookingService.findMyBookings(currentUser.user_id);
  }

  @Get()
  async findAll(@Query() query: BookingFilterDto) {
    return this.bookingService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const bookId = parseInt(id, 10);
    const booking = await this.bookingService.findById(bookId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Post()
  async create(@CurrentUser() currentUser: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(currentUser.user_id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Body() dto: UpdateBookingDto,
  ) {
    const bookId = parseInt(id, 10);
    return this.bookingService.update(bookId, currentUser, dto);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const bookId = parseInt(id, 10);
    return this.bookingService.cancel(bookId, currentUser);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @Body('mile_distance') mileDistance?: number,
  ) {
    const bookId = parseInt(id, 10);
    return this.bookingService.complete(bookId, currentUser, mileDistance);
  }
}
