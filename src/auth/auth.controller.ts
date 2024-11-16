import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
    summary: 'Register a new user',
    description:
      'Register a new user by providing the necessary information in the request body.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Ensure the input data is valid.',
  })
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    return await this.authService.registerPatientUser(createPatientDto);
  }

  @Post('register/doctors')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Register a new user by providing the necessary information in the request body.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Ensure the input data is valid.',
  })
  async createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return await this.authService.registerDoctorUser(createDoctorDto);
  }

  @UseGuards(AuthGuard('localStrategy'))
  @Post('login')
  @ApiOperation({
    summary: 'Login an existing user',
    description: 'Authenticate a user and return a JWT token.',
  })
  @ApiCreatedResponse({
    description: 'Successfully logged in and JWT token generated.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid credentials.',
  })
  login(@Req() req: Request) {
    const user = req.user as Patient | Doctor;
    const jwtAndUser = this.authService.generateJwtToken(user);
    return jwtAndUser;
  }
}
