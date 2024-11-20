import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { IFilterOptionsForDoctors } from '../interfaces/availabilities-filter-options';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';

@Injectable()
export class VerifyAvailabilityFilterDateDataPipe implements PipeTransform {
  @ApiOperation({
    summary: 'Verifies that the date provided for availability is valid',
    description:
      'This pipe checks if the year, month, and day are valid and not in the past.',
  })
  @ApiBadRequestResponse({
    description: 'The selected year, month, or day is in the past.',
  })
  transform(value: IFilterOptionsForDoctors | IFilterOptionsForDoctors) {
    const { year, month, day } = value;

    const currentDate = new Date();

    if (year < currentDate.getFullYear()) {
      throw new BadRequestException(
        'The selected year is not current or in the future',
      );
    }

    if (
      year === currentDate.getFullYear() &&
      month < currentDate.getMonth() + 1
    ) {
      throw new BadRequestException(
        'The selected month is not current or in the future',
      );
    }

    if (
      year === currentDate.getFullYear() &&
      month === currentDate.getMonth() + 1 &&
      day < currentDate.getDate()
    ) {
      throw new BadRequestException(
        'The selected day is not current or in the future',
      );
    }
    return value;
  }
}
