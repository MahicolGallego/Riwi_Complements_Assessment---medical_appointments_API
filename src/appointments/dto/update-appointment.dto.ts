import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from 'src/common/constants/appoinment-status.enum';

export class UpdateAppointmentDto {
  @ApiProperty({
    description: 'New status for the appointment',
    example: AppointmentStatus.COMPLETED,
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Additional notes about the appointment status update',
    example: 'Patient completed the session successfully.',
  })
  @IsString()
  @IsNotEmpty()
  notes: string;
}
