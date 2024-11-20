import { forwardRef, Module } from '@nestjs/common';
import { AppointmentDetailsService } from './appointment_details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentDetail } from './entities/appointment_detail.entity';
import { AppointmentsModule } from 'src/appointments/appointments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentDetail]),
    forwardRef(() => AppointmentsModule),
  ],
  providers: [AppointmentDetailsService],
  exports: [AppointmentDetailsService],
})
export class AppointmentDetailsModule {}
