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
  Query,
  Req,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import { Rbac } from 'src/common/decorators/rbac.decorator';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  IFilterOptionsForDoctors,
  IFilterOptionsForPatients,
} from 'src/common/interfaces/availabilities-filter-options';
import { VerifyValidDateDataFormatPipe } from 'src/common/pipes/verify-valid-date-data-format.pipe';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Request } from 'express';
import { IPayloadToken } from 'src/common/interfaces/payload-token.interface';
import { PermissionsGuard } from 'src/common/guards/permissions/permissions.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Specialty } from 'src/common/constants/speciality.enum';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentService) {}

  @Rbac(['patient'])
  @Post()
  @ApiOperation({
    summary: 'Create a new appointment',
    description: 'Creates a new appointment for a patient with the given data.',
  })
  @ApiBody({
    type: CreateAppointmentDto,
    description: 'Data required to create a new appointment',
  })
  @ApiCreatedResponse({
    description: 'Appointment successfully created.',
    type: Appointment,
    example: {
      id: 'abc123',
      appointment_date: '2024-11-20T10:00:00.000Z',
      status: 'scheduled',
      patient_id: 'patient123',
      doctor_id: 'doctor123',
      update_by: null,
      doctor: {
        id: 'doctor123',
        name: 'Dr. John Doe',
        email: 'johndoe@example.com',
        specialty: 'Cardiology',
        role: 'doctor',
      },
      patient: {
        id: 'patient123',
        name: 'Jane Smith',
        email: 'janesmith@example.com',
        role: 'patient',
      },
      appointment_details: {
        id: 'detail123',
        reason_consultation: 'Regular check-up',
        notes: 'No additional notes',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data. Validation failed.',
    schema: {
      example: {
        statusCode: 400,
        message: ['name should not be empty', 'email must be an email'],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with patient permissions.',
  })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return await this.appointmentsService.create(createAppointmentDto);
  }

  // Endpoint to get appoinments based on the id_doctor
  @Rbac(['doctor'])
  @Get('doctor')
  @ApiOperation({
    summary: 'Get appointments for a specific doctor',
    description:
      'Retrieves appointments for a doctor, optionally filtered by date or status.',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year for available schedules (optional)',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Month for available schedules (optional)',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: Number,
    description: 'Day for available schedules (optional)',
  })
  @ApiOkResponse({
    description: 'List of appointments for the doctor.',
    type: [Appointment],
    schema: {
      example: [
        {
          id: 'abc123',
          appointment_date: '2024-11-20T10:00:00.000Z',
          status: 'scheduled',
          patient_id: 'patient123',
          doctor_id: 'doctor123',
          update_by: null,
          doctor: {
            id: 'doctor123',
            name: 'Dr. John Doe',
            email: 'johndoe@example.com',
            specialty: 'cardiology',
            role: 'doctor',
          },
          patient: {
            id: 'patient123',
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            role: 'patient',
          },
          appointment_details: {
            id: 'detail123',
            reason_consultation: 'Regular check-up',
            notes: 'No additional notes',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No appointments found for this doctor.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with doctor permissions.',
  })
  async findAllDoctorAppointments(
    @Query(VerifyValidDateDataFormatPipe)
    filterOptions: IFilterOptionsForDoctors,
    @Req() req: Request,
  ): Promise<Appointment[]> {
    const doctor = req.user as IPayloadToken;
    return await this.appointmentsService.findAllDoctorAppointments(
      doctor.sub,
      filterOptions,
    );
  }

  // Endpoint to get appoinments based on the id_doctor
  @Rbac(['patient'])
  @Get('patient')
  @ApiOperation({
    summary: 'Get appointments for a specific patient',
    description:
      'Retrieves appointments for a patient, optionally filtered by date or status.',
  })
  @ApiQuery({
    name: 'speciality',
    required: false,
    enum: Specialty,
    description: 'Specialty of the doctor (optional)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year for available schedules (optional)',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Month for available schedules (optional)',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    type: Number,
    description: 'Day for available schedules (optional)',
  })
  @ApiOkResponse({
    description: 'List of appointments for the patient.',
    type: [Appointment],
    schema: {
      example: [
        {
          id: 'abc123',
          appointment_date: '2024-11-20T10:00:00.000Z',
          status: 'scheduled',
          patient_id: 'patient123',
          doctor_id: 'doctor123',
          update_by: null,
          doctor: {
            id: 'doctor123',
            name: 'Dr. John Doe',
            email: 'johndoe@example.com',
            specialty: 'cardiology',
            role: 'doctor',
          },
          patient: {
            id: 'patient123',
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            role: 'patient',
          },
          appointment_details: {
            id: 'detail123',
            reason_consultation: 'Regular check-up',
            notes: 'No additional notes',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No appointments found for this patient.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with patient permissions.',
  })
  async findAllPatientAppointments(
    @Query(VerifyValidDateDataFormatPipe)
    filterOptions: IFilterOptionsForPatients,
    @Req() req: Request,
  ): Promise<Appointment[]> {
    const patient = req.user as IPayloadToken;
    return await this.appointmentsService.findAllPatientAppointments(
      patient.sub,
      filterOptions,
    );
  }

  @Rbac(['doctor'])
  @Get(':id/doctor')
  @ApiOperation({
    summary: 'Get a especific appointment for a doctor',
    description: 'Retrieve a specific appointment for a doctor.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the appointment to search',
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: 'A specific appointment retrieved successfully.',
    type: Appointment,
    schema: {
      example: {
        id: 'abc123',
        appointment_date: '2024-11-20T10:00:00.000Z',
        status: 'scheduled',
        patient_id: 'patient123',
        doctor_id: 'doctor123',
        update_by: null,
        doctor: {
          id: 'doctor123',
          name: 'Dr. John Doe',
          email: 'johndoe@example.com',
          specialty: 'cardiology',
          role: 'doctor',
        },
        patient: {
          id: 'patient123',
          name: 'Jane Smith',
          email: 'janesmith@example.com',
          role: 'patient',
        },
        appointment_details: {
          id: 'detail123',
          reason_consultation: 'Regular check-up',
          notes: 'No additional notes',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with doctor permissions.',
  })
  async findOneDoctorAppointment(@Req() req: Request): Promise<Appointment> {
    const doctor = req.user as IPayloadToken;
    return await this.appointmentsService.findOneDoctorAppointment(
      doctor.sub,
      doctor.sub,
    );
  }

  @Rbac(['patient'])
  @Get(':id/patient')
  @ApiOperation({
    summary: 'Get a specific appointment for a patient',
    description: 'Retrieve a specific appointment for a patient.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the appointment to search',
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: 'A specific appointment retrieved successfully.',
    type: Appointment,
    schema: {
      example: {
        id: 'abc123',
        appointment_date: '2024-11-20T10:00:00.000Z',
        status: 'scheduled',
        patient_id: 'patient123',
        doctor_id: 'doctor123',
        update_by: null,
        doctor: {
          id: 'doctor123',
          name: 'Dr. John Doe',
          email: 'johndoe@example.com',
          specialty: 'cardiology',
          role: 'doctor',
        },
        patient: {
          id: 'patient123',
          name: 'Jane Smith',
          email: 'janesmith@example.com',
          role: 'patient',
        },
        appointment_details: {
          id: 'detail123',
          reason_consultation: 'Regular check-up',
          notes: 'No additional notes',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with patient permissions.',
  })
  async findOnePatientAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Appointment> {
    const patient = req.user as IPayloadToken;
    return await this.appointmentsService.findOnePatientAppointment(
      id,
      patient.sub,
    );
  }

  @Rbac(['patient'])
  @Patch(':id/reschedule/availability/:id_availability')
  @ApiOperation({
    summary: 'Reschedule an appointment for a patient',
    description:
      'Allows a patient to reschedule an appointment with a new availability.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the appointment to be rescheduled.',
  })
  @ApiParam({
    name: 'id_availability',
    type: String,
    description: 'ID of the new availability for rescheduling the appointment.',
  })
  @ApiOkResponse({
    description: 'Appointment successfully rescheduled.',
    type: Appointment,
    schema: {
      example: {
        id: 'abc123',
        appointment_date: '2024-11-20T10:00:00.000Z',
        status: 'scheduled',
        patient_id: 'patient123',
        doctor_id: 'doctor123',
        update_by: null,
        doctor: {
          id: 'doctor123',
          name: 'Dr. John Doe',
          email: 'johndoe@example.com',
          specialty: 'cardiology',
          role: 'doctor',
        },
        patient: {
          id: 'patient123',
          name: 'Jane Smith',
          email: 'janesmith@example.com',
          role: 'patient',
        },
        appointment_details: {
          id: 'detail123',
          reason_consultation: 'Regular check-up',
          notes: 'No additional notes',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Appointment or availability not found.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with patient permissions.',
  })
  async rescheduleAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('id_availability', ParseUUIDPipe) id_availability: string,
    @Req() req: Request,
  ): Promise<Appointment> {
    const patient = req.user as IPayloadToken;
    return await this.appointmentsService.rescheduleAppointment(
      id,
      patient.sub,
      id_availability,
    );
  }

  @Rbac(['doctor'])
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update the status of an appointment',
    description: 'Allows a doctor to update the status of an appointment.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the appointment to be updated.',
  })
  @ApiBody({
    type: UpdateAppointmentDto,
    description: 'Data required to update the appointment status.',
  })
  @ApiOkResponse({
    description: 'Appointment successfully updated.',
    schema: {
      example: {
        message: 'Appointment updated successfully.',
        appointment: {
          id: 'abc123',
          appointment_date: '2024-11-20T10:00:00.000Z',
          status: 'scheduled',
          patient_id: 'patient123',
          doctor_id: 'doctor123',
          update_by: null,
          doctor: {
            id: 'doctor123',
            name: 'Dr. John Doe',
            email: 'johndoe@example.com',
            specialty: 'cardiology',
            role: 'doctor',
          },
          patient: {
            id: 'patient123',
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            role: 'patient',
          },
          appointment_details: {
            id: 'detail123',
            reason_consultation: 'Regular check-up',
            notes: 'Additional notes',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with doctor permissions.',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: Request,
  ) {
    const doctor = req.user as IPayloadToken;
    return this.appointmentsService.updateAppointmentStatus(
      id,
      doctor.sub,
      updateAppointmentDto,
    );
  }

  @Rbac(['patient'])
  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel an appointment for a patient',
    description: 'Allows a patient to cancel an appointment.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the appointment to be canceled.',
  })
  @ApiOkResponse({
    description: 'Appointment successfully canceled.',
    schema: {
      example: {
        message: 'Appointment cancelled successfully',
        appointment: {
          id: 'abc123',
          appointment_date: '2024-11-20T10:00:00.000Z',
          status: 'cancelled',
          patient_id: 'patient123',
          doctor_id: 'doctor123',
          update_by: null,
          doctor: {
            id: 'doctor123',
            name: 'Dr. John Doe',
            email: 'johndoe@example.com',
            specialty: 'cardiology',
            role: 'doctor',
          },
          patient: {
            id: 'patient123',
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            role: 'patient',
          },
          appointment_details: {
            id: 'detail123',
            reason_consultation: 'Regular check-up',
            notes: 'No additional notes',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with patient permissions.',
  })
  async cancelAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const patient = req.user as IPayloadToken;
    return await this.appointmentsService.cancelAppointment(id, patient.sub);
  }
}
