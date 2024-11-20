import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';
import { ApiConflictResponse, ApiOperation } from '@nestjs/swagger';

import { CreateAvailabilityDoctorDto } from 'src/availability_doctor/dto/create-availability_doctor.dto';

@Injectable()
export class VerifyValidAvailabilitySchedulePipe implements PipeTransform {
  @ApiOperation({
    summary:
      'Validates if the schedule provided is within a valid range (0 to 23)',
    description:
      'This pipe checks if the provided schedule value is between 0 and 23 hours.',
  })
  @ApiConflictResponse({
    description: 'The provided schedule is outside the valid range (0-23).',
  })
  transform(value: CreateAvailabilityDoctorDto) {
    const { schedule } = value;

    if (schedule < 0 || schedule > 23) {
      throw new ConflictException('Invalid schedule provided');
    }

    return value;
  }
}
