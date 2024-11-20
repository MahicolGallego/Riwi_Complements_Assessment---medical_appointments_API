import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDetailDto } from './dto/create-appointment_detail.dto';
import { UpdateAppointmentDetailDto } from './dto/update-appointment_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentDetail } from './entities/appointment_detail.entity';
import { Repository } from 'typeorm';
import { AppointmentService } from 'src/appointments/appointments.service';

@Injectable()
export class AppointmentDetailsService {
  constructor(
    @InjectRepository(AppointmentDetail)
    private readonly appointmentDetailRepository: Repository<AppointmentDetail>,
    @Inject(forwardRef(() => AppointmentService))
    private readonly appointmentsService: AppointmentService,
  ) {}

  async create(
    createAppointmentDetailDto: CreateAppointmentDetailDto,
  ): Promise<void> {
    const { appointment_id, reason_consultation } = createAppointmentDetailDto;

    const appointment = await this.appointmentsService.findOne(appointment_id);

    const appointmentDetail = this.appointmentDetailRepository.create({
      appointment,
      reason_consultation,
      notes: null,
    });

    await this.appointmentDetailRepository.save(appointmentDetail);

    return;
  }

  async update(
    id: string,
    updateAppointmentDetailDto: UpdateAppointmentDetailDto,
  ): Promise<void> {
    const appointmentDetail = await this.appointmentDetailRepository.findOne({
      where: { id },
    });

    if (!appointmentDetail) {
      throw new NotFoundException(`AppointmentDetail with ID ${id} not found`);
    }

    const updatedAppointmentDetail = Object.assign(
      appointmentDetail,
      updateAppointmentDetailDto,
    );

    await this.appointmentDetailRepository.save(updatedAppointmentDetail);

    return;
  }
}
