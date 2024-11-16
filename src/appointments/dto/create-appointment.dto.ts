import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsUUID()
  doctor_id: string;

  @IsNotEmpty()
  @IsUUID()
  patient_id: string;

  @IsNotEmpty()
  @IsUUID()
  availability_id: string;

  @IsNotEmpty()
  @IsString()
  reason_consultation: string;
}
