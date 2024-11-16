import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDetailDto } from './create-appointment_detail.dto';

export class UpdateAppointmentDetailDto extends PartialType(CreateAppointmentDetailDto) {}
