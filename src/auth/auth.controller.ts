import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreatePatientDto } from 'src/patients/dto/create-patient.dto';
import { Patient } from 'src/patients/entities/patient.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { CreateDoctorDto } from 'src/doctors/dto/create-doctor.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/patients')
  @ApiOperation({
    summary: 'Register a new patient',
    description:
      'Registers a new patient with name, email, and password. Returns the authentication token and user data.',
  })
  @ApiBody({
    type: CreatePatientDto,
    description: 'Data required to register a patient',
  })
  @ApiCreatedResponse({
    description: 'Patient successfully registered.',
    type: Patient,
    schema: {
      example: {
        accessToken: 'JWT_TOKEN',
        user: {
          id: 'patient123',
          name: 'Jane Smith',
          email: 'janesmith@example.com',
          role: 'patient',
        },
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
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    return await this.authService.registerPatientUser(createPatientDto);
  }

  @Post('register/doctors')
  @ApiOperation({
    summary: 'Register a new doctor',
    description:
      'Registers a new doctor with name, email, password, and specialty. Returns the authentication token and user data.',
  })
  @ApiBody({
    type: CreateDoctorDto,
    description: 'Data required to register a doctor',
  })
  @ApiCreatedResponse({
    description: 'Doctor successfully registered.',
    type: Doctor,
    schema: {
      example: {
        accessToken: 'JWT_TOKEN',
        user: {
          id: 'doctor123',
          name: 'Dr. John Doe',
          email: 'johndoe@example.com',
          specialty: 'Cardiology',
          role: 'doctor',
        },
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
  async createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return await this.authService.registerDoctorUser(createDoctorDto);
  }

  @UseGuards(AuthGuard('localStrategy'))
  @Post('login')
  @ApiOperation({
    summary: 'Login a user (patient or doctor)',
    description:
      'Authenticate a user using email and password. Returns a JWT token and user information.',
  })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'your_password',
      },
    },
    description: 'Credentials for login',
  })
  @ApiCreatedResponse({
    description: 'Login successful. JWT token returned.',
    schema: {
      example: {
        accessToken: 'JWT_TOKEN',
        user: {
          id: 'doctor123',
          name: 'Dr. John Doe',
          email: 'johndoe@example.com',
          specialty: 'cardiology',
          role: 'doctor',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials provided.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  login(@Req() req: Request) {
    const user = req.user as Patient | Doctor;
    const jwtAndUser = this.authService.generateJwtToken(user);
    return jwtAndUser;
  }
}
