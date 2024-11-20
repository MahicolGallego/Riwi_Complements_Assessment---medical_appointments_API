import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  UsePipes,
  Req,
} from '@nestjs/common';
import { AvailabilityDoctorService } from './availability_doctor.service';
import { CreateAvailabilityDoctorDto } from './dto/create-availability_doctor.dto';
import { Rbac } from 'src/common/decorators/rbac.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';
import {
  IFilterOptionsForDoctors,
  IFilterOptionsForPatients,
} from 'src/common/interfaces/availabilities-filter-options';
import { VerifyAvailabilityFilterDateDataPipe } from 'src/common/pipes/verify-availability-filter-date-data.pipe';
import { VerifyValidDateDataFormatPipe } from 'src/common/pipes/verify-valid-date-data-format.pipe';
import { VerifyValidAvailabilitySchedulePipe } from 'src/common/pipes/verify-valid-availability-schedule.pipe';
import { Request } from 'express';
import { IPayloadToken } from 'src/common/interfaces/payload-token.interface';
import { PermissionsGuard } from 'src/common/guards/permissions/permissions.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Specialty } from 'src/common/constants/speciality.enum';
import { AvailabilityDoctor } from './entities/availability_doctor.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('availabilities-doctor')
@ApiBearerAuth()
@Controller('availabilities-doctor')
export class AvailabilityDoctorController {
  constructor(
    private readonly availabilityDoctorService: AvailabilityDoctorService,
  ) {}

  @Rbac(['doctor'])
  @Post()
  @ApiOperation({
    summary: 'Create availability for a doctor',
    description: 'Creates a new availability slot for a doctor.',
  })
  @ApiBody({
    type: CreateAvailabilityDoctorDto,
    description: 'Availability data',
  })
  @ApiCreatedResponse({
    description: 'Availability successfully created.',
    type: AvailabilityDoctor,
    schema: {
      example: {
        id: 'availability124',
        doctor: {
          id: 'doctor457',
          name: 'Dr. John Brown',
          email: 'johnbrown@example.com',
          specialty: 'Orthopedics',
          role: 'doctor',
        },
        year: 2024,
        month: 11,
        day: 21,
        schedule: 14,
        is_availability: true,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data. Validation failed.',
    schema: {
      example: {
        statusCode: 400,
        message: ['schedule must be a valid time range'],
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Availability slot already exists for the selected time.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Conflict - Slot already taken',
        error: 'Conflict',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with doctor permissions.',
  })
  async create(
    @Body(VerifyValidDateDataFormatPipe, VerifyValidAvailabilitySchedulePipe)
    createAvailabilityDoctorDto: CreateAvailabilityDoctorDto,
  ) {
    return await this.availabilityDoctorService.create(
      createAvailabilityDoctorDto,
    );
  }

  @Rbac(['patient'])
  @UsePipes(VerifyValidDateDataFormatPipe, VerifyAvailabilityFilterDateDataPipe)
  @Get('patient')
  @ApiOperation({
    summary: 'Get all available schedules for patients',
    description:
      'Fetches available schedules for patients based on filter options.',
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
    description: 'Successfully retrieved doctor availability.',
    schema: {
      example: [
        {
          id: 'availability124',
          doctor: {
            id: 'doctor457',
            name: 'Dr. John Brown',
            email: 'johnbrown@example.com',
            specialty: 'Orthopedics',
            role: 'doctor',
          },
          year: 2024,
          month: 11,
          day: 21,
          schedule: 14,
          is_availability: false,
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No doctor availability found',
    schema: {
      example: {
        statusCode: 404,
        message: 'No availability found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with patient permissions.',
  })
  async findAllAvailabilityForPatient(
    @Query() filterOptions: IFilterOptionsForPatients,
  ) {
    return await this.availabilityDoctorService.findAllForPatients(
      filterOptions,
    );
  }

  @Rbac(['doctor'])
  @Get('doctor')
  @ApiOperation({
    summary: 'Get all availability for a specific doctor',
    description: 'Fetches available schedules for a specific doctor.',
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
    description: 'Successfully retrieved doctor availability.',
    schema: {
      example: [
        {
          id: 'availability124',
          doctor: {
            id: 'doctor457',
            name: 'Dr. John Brown',
            email: 'johnbrown@example.com',
            specialty: 'Orthopedics',
            role: 'doctor',
          },
          year: 2024,
          month: 11,
          day: 21,
          schedule: 14,
          is_availability: false,
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'No availability found for the specified doctor.',
    schema: {
      example: {
        statusCode: 404,
        message: 'No availability found for the doctor',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with doctor permissions.',
  })
  async findAllAvailabilityForDoctor(
    @Query(VerifyValidDateDataFormatPipe, VerifyAvailabilityFilterDateDataPipe)
    filterOptions: IFilterOptionsForDoctors,
    @Req() req: Request,
  ) {
    const doctor = req.user as IPayloadToken;
    return await this.availabilityDoctorService.findAllForDoctors(
      doctor.sub,
      filterOptions,
    );
  }

  @Rbac(['doctor'])
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete availability for a specific doctor',
    description: 'Deletes a specific availability slot for a doctor.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the availability to delete',
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: 'Successfully deleted the availability.',
    schema: {
      example: {
        message: 'Availability deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Availability or doctor not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Availability not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete past or already scheduled availability.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot delete past availability',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized access. User must be logged in with doctor permissions.',
  })
  async deleteAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const doctor = req.user as IPayloadToken;
    return await this.availabilityDoctorService.deleteAvailability(
      id,
      doctor.sub,
    );
  }
}
