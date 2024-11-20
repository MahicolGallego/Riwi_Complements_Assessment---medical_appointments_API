import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';
import {
  IFilterOptionsForDoctors,
  IFilterOptionsForPatients,
} from '../interfaces/availabilities-filter-options';
import {
  monthWithThirtyDays,
  monthWithThirtyOneDays,
} from '../constants/variables-for-validate-data-format';
import { CreateAvailabilityDoctorDto } from 'src/availability_doctor/dto/create-availability_doctor.dto';
import { ApiConflictResponse, ApiOperation } from '@nestjs/swagger';

@Injectable()
export class VerifyValidDateDataFormatPipe implements PipeTransform {
  @ApiOperation({
    summary: 'Verifies the correct format of the date data',
    description:
      'This pipe checks if the year, month, and day follow a valid format and are within logical date limits.',
  })
  @ApiConflictResponse({
    description: 'The provided date data is invalid.',
  })
  transform(
    value:
      | IFilterOptionsForDoctors
      | IFilterOptionsForPatients
      | CreateAvailabilityDoctorDto,
  ) {
    const { year, month, day } = value;

    if (year < 1850)
      throw new ConflictException('year must be greater than 1850');

    if (month < 1 || month > 12)
      throw new ConflictException(
        'month must be between 1(january) and 12(december)',
      );

    if (day < 1 || day > 31)
      throw new ConflictException('day must be between 1 and 31 max');

    if (monthWithThirtyDays.includes(month) && day > 31)
      throw new ConflictException(
        'The selected month has 30 days but the one provided is the 31st day',
      );

    // check the day if the month is february
    if (
      !monthWithThirtyDays.includes(month) &&
      !monthWithThirtyOneDays.includes(month)
    ) {
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

      if (isLeapYear && day > 29)
        throw new ConflictException(
          'The selected month has 29 days but the one provided is the 30th day or greater',
        );

      if (day > 28)
        throw new ConflictException(
          'The selected month has 28 days but the one provided is the 29th day or greater',
        );
    }

    return value;
  }
}
