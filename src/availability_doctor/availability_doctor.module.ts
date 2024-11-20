import { Module } from '@nestjs/common';
import { AvailabilityDoctorService } from './availability_doctor.service';
import { AvailabilityDoctorController } from './availability_doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityDoctor } from './entities/availability_doctor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvailabilityDoctor]),
    ScheduleModule.forRoot(),
    AuthModule,
    DoctorsModule,
  ],
  controllers: [AvailabilityDoctorController],
  providers: [AvailabilityDoctorService],
  exports: [AvailabilityDoctorService],
})
export class AvailabilityDoctorModule {}
