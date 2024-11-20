import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDoctorDto {
  @ApiProperty({
    description: 'Year of the availasbility',
    example: 2024,
  })
  @IsNotEmpty()
  @IsInt()
  year: number;

  @ApiProperty({
    description: 'Month of the availability (1-12)',
    example: 11,
  })
  @IsNotEmpty()
  @IsInt()
  month: number;

  @ApiProperty({
    description: 'Day of the availability (1-31)',
    example: 20,
  })
  @IsNotEmpty()
  @IsInt()
  day: number;

  @ApiProperty({
    description: 'Schedule identifier for the availability',
    example: 10,
  })
  @IsNotEmpty()
  @IsInt()
  schedule: number;

  @ApiProperty({
    description: 'UUID of the doctor',
    example: 'a2f5b44e-cc6d-4a78-b55e-d9320c3a3785',
  })
  @IsNotEmpty()
  @IsUUID()
  doctor_id: string;
}
