import { forwardRef, Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PatientsModule } from 'src/patients/patients.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { AvailabilityDoctorModule } from 'src/availability_doctor/availability_doctor.module';
import { AppointmentDetailsModule } from 'src/appointment_details/appointment_details.module';
import { AppointmentService } from './appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AvailabilityDoctorModule,
    forwardRef(() => AppointmentDetailsModule),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentsModule {}
