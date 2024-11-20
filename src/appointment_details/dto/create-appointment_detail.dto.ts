import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDetailDto {
  @IsNotEmpty()
  @IsUUID()
  appointment_id: string;

  @IsOptional()
  @IsString()
  reason_consultation: string;
}
