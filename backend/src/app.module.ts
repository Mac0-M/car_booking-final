import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { Vehicle } from './vehicles/vehicles.entity';
import { Booking } from './booking/booking.entity';
import { VehiclesModule } from './vehicles/vehicles.module';
import { BookingModule } from './booking/booking.module';
import { ResponseInterceptor } from './common/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database/car_booking.sqlite',
      entities: [User, Vehicle, Booking],
      synchronize: true, // Auto sync schema
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    BookingModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
