import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityDoctorService } from './availability_doctor.service';
import { CreateAvailabilityDoctorDto } from './dto/create-availability_doctor.dto';
import { UpdateAvailabilityDoctorDto } from './dto/update-availability_doctor.dto';
import { Rbac } from 'src/common/decorators/rbac.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('availability-doctor')
export class AvailabilityDoctorController {
  constructor(
    private readonly availabilityDoctorService: AvailabilityDoctorService,
  ) {}

  @Rbac(['doctor'])
  @Post()
  create(@Body() createAvailabilityDoctorDto: CreateAvailabilityDoctorDto) {
    return this.availabilityDoctorService.create(createAvailabilityDoctorDto);
  }
}
