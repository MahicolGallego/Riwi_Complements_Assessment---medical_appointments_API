import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAvailabilityDoctorDto } from './dto/create-availability_doctor.dto';
import { UpdateAvailabilityDoctorDto } from './dto/update-availability_doctor.dto';
import { AvailabilityDoctor } from './entities/availability_doctor.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AvailabilityDoctorService {
  constructor(
    @InjectRepository(AvailabilityDoctor)
    private readonly availabilityDoctorRepository: Repository<AvailabilityDoctor>,
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
  ) {}
  async create(
    createAvailabilityDoctorDto: CreateAvailabilityDoctorDto,
  ): Promise<AvailabilityDoctor> {
    const { doctor_id, year, month, day, schedule } =
      createAvailabilityDoctorDto;

    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctor_id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Duplicate validation
    const existingAvailability =
      await this.availabilityDoctorRepository.findOne({
        where: { doctor_id, year, month, day, schedule },
      });

    if (existingAvailability) {
      throw new ConflictException('This availability already exists');
    }

    const newAvalabilityDoctor = await this.availabilityDoctorRepository.create(
      { ...createAvailabilityDoctorDto, doctor: doctor },
    );

    return await this.availabilityDoctorRepository.save(newAvalabilityDoctor);
  }
}
