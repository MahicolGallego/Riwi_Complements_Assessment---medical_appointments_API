import { Module } from '@nestjs/common';
import { AppointmentDetailsService } from './appointment_details.service';
import { AppointmentDetailsController } from './appointment_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentDetail } from './entities/appointment_detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentDetail])],
  controllers: [AppointmentDetailsController],
  providers: [AppointmentDetailsService, TypeOrmModule],
  exports: [AppointmentDetailsService, TypeOrmModule],
})
export class AppointmentDetailsModule {}
