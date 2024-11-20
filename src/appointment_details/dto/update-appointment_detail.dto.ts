import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDetailDto {
  @IsOptional()
  @IsString()
  reason_consultation: string;

  @IsNotEmpty()
  @IsString()
  notes: string;
}
