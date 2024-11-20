import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'UUID of the doctor associated with the appointment',
    example: 'a2f5b44e-cc6d-4a78-b55e-d9320c3a3785',
  })
  @IsNotEmpty()
  @IsUUID()
  doctor_id: string;

  @ApiProperty({
    description: 'UUID of the patient associated with the appointment',
    example: 'b7a1c1c4-3fc7-4e47-a618-1bc0dc865e57',
  })
  @IsNotEmpty()
  @IsUUID()
  patient_id: string;

  @ApiProperty({
    description: 'UUID of the availability being scheduled for the appointment',
    example: 'c0d8f4d3-9b14-4c9e-99f7-2d4238179a99',
  })
  @IsNotEmpty()
  @IsUUID()
  availability_id: string;

  @ApiProperty({
    description: 'Reason for the consultation',
    example: 'Annual physical examination',
  })
  @IsNotEmpty()
  @IsString()
  reason_consultation: string;
}
