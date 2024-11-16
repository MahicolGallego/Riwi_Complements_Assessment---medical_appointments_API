import { PartialType } from '@nestjs/swagger';
import { CreateAvailabilityDoctorDto } from './create-availability_doctor.dto';

export class UpdateAvailabilityDoctorDto extends PartialType(CreateAvailabilityDoctorDto) {}
