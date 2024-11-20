import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AppointmentDetailsModule } from './appointment_details/appointment_details.module';
import { AvailabilityDoctorModule } from './availability_doctor/availability_doctor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Automatically synchronize the database schema (development only)
        logging: false, // Enable logging of SQL queries (development only)
      }),
    }),
    AuthModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    AppointmentDetailsModule,
    AvailabilityDoctorModule,
  ],
})
export class AppModule {}
