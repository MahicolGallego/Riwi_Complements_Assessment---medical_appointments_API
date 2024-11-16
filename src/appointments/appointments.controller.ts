import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { Rbac } from 'src/common/decorators/rbac.decorator';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role } from 'src/common/constants/roles.enum';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentService) {}

  @Rbac(['patient'])
  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return await this.appointmentsService.create(createAppointmentDto);
  }

  // Endpoint to get appoinments based on the id_doctor
  @Rbac(['doctor'])
  @Get('doctor/:id_doctor')
  async findAllDoctorAppointments(
    @Param('id_doctor', ParseUUIDPipe) id_doctor: string,
  ): Promise<Appointment[]> {
    return await this.appointmentsService.findAllDoctorAppointments(id_doctor);
  }

  // Endpoint to get appoinments based on the id_doctor
  @Rbac(['patient'])
  @Get('patient/:id_patient')
  async findAllPatientAppointments(
    @Param('id_patient', ParseUUIDPipe) id_patient: string,
  ): Promise<Appointment[]> {
    return await this.appointmentsService.findAllPatientAppointments(
      id_patient,
    );
  }

  @Rbac(['doctor'])
  @Get(':id/patient/:id_doctor')
  async findOneDoctorAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('id_doctor', ParseUUIDPipe) id_doctor: string,
  ): Promise<Appointment> {
    return await this.appointmentsService.findOneDoctorAppointment(
      id,
      id_doctor,
    );
  }

  @Rbac(['patient'])
  @Get(':id/patient/:id_patient')
  async findOnePatientAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('id_patient', ParseUUIDPipe) id_patient: string,
  ): Promise<Appointment> {
    return await this.appointmentsService.findOnePatientAppointment(
      id,
      id_patient,
    );
  }

  @Rbac(['patient'])
  @Patch(':id/patient/:id_patient/reschedule/:id_availability')
  async rescheduleAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('id_patient', ParseUUIDPipe) id_patient: string,
    @Param('id_availability', ParseUUIDPipe) id_availability: string,
  ): Promise<Appointment> {
    return await this.appointmentsService.rescheduleAppointment(
      id,
      id_patient,
      id_availability,
    );
  }

  @Rbac(['patient'])
  @Delete(':id/patient/:id_patient')
  async cancelAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('id_patient', ParseUUIDPipe) id_patient: string,
  ) {
    return await this.appointmentsService.cancelAppointment(
      id,
      id_patient,
      Role.patient,
    );
  }
}
