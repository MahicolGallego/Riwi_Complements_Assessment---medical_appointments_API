import { IsBoolean, IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAvailabilityDoctorDto {
  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsInt()
  month: number;

  @IsNotEmpty()
  @IsInt()
  day: number;

  @IsNotEmpty()
  @IsInt()
  schedule: number;

  @IsNotEmpty()
  @IsBoolean()
  is_availability: boolean;

  @IsNotEmpty()
  @IsUUID()
  doctor_id: string;
}
