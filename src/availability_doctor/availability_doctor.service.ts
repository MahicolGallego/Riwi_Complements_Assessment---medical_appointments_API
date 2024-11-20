import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAvailabilityDoctorDto } from './dto/create-availability_doctor.dto';
import { AvailabilityDoctor } from './entities/availability_doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  IFilterOptionsForDoctors,
  IFilterOptionsForPatients,
} from 'src/common/interfaces/availabilities-filter-options';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DoctorsService } from 'src/doctors/doctors.service';

@Injectable()
export class AvailabilityDoctorService {
  constructor(
    @InjectRepository(AvailabilityDoctor)
    private readonly availabilityDoctorRepository: Repository<AvailabilityDoctor>,
    private readonly doctorsService: DoctorsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  handleBlockedExpiredAvailabilities() {
    const currentDate = new Date();

    this.blockExpiredAvailabilityNotTaken(currentDate);
  }

  async create(
    createAvailabilityDoctorDto: CreateAvailabilityDoctorDto,
  ): Promise<AvailabilityDoctor> {
    const { doctor_id, year, month, day, schedule } =
      createAvailabilityDoctorDto;

    const doctor = await this.doctorsService.findById(doctor_id);

    // Duplicate validation
    const existingAvailability =
      await this.availabilityDoctorRepository.findOne({
        where: { doctor_id, year, month, day, schedule },
      });

    if (existingAvailability) {
      throw new ConflictException('This availability already exists');
    }

    const newAvalabilityDoctor = this.availabilityDoctorRepository.create({
      ...createAvailabilityDoctorDto,
      doctor: doctor,
    });

    return await this.availabilityDoctorRepository.save(newAvalabilityDoctor);
  }

  async findAllForPatients(
    availabilitiesFilterOptions: IFilterOptionsForPatients,
  ): Promise<AvailabilityDoctor[]> {
    // get only availabilities that exceed the current date and time
    const currentDate = new Date();

    // create filter options
    const filterOptions = {
      ...this.createFilterOptionsOfDate(
        availabilitiesFilterOptions,
        currentDate,
      ),
      speciality: availabilitiesFilterOptions.speciality
        ? availabilitiesFilterOptions.speciality
        : undefined,
    };

    let availabilites = await this.availabilityDoctorRepository.find({
      where: {
        year: filterOptions.year,
        day: filterOptions.day,
        month: filterOptions.month,
        is_availability: true,
        doctor: {
          specialty: filterOptions.speciality,
        },
      },
    });

    if (!availabilites.length) {
      throw new NotFoundException(
        'Schedules of availability of doctors not found',
      );
    }

    // sort alphabetically by doctor
    availabilites.sort((availabilityA, availabilityB) =>
      availabilityA.doctor.name.localeCompare(availabilityB.doctor.name),
    );

    availabilites = this.sortAvailabititiesByDate(availabilites);

    return availabilites;
  }

  async findAllForDoctors(
    doctor_id: string,
    availabilitiesFilterOptions: IFilterOptionsForDoctors,
  ): Promise<AvailabilityDoctor[]> {
    const currentDate = new Date();
    // verify availability filter date data

    // create filter options
    const filterOptions = this.createFilterOptionsOfDate(
      availabilitiesFilterOptions,
      currentDate,
    );

    let availabilities = await this.availabilityDoctorRepository.find({
      where: {
        year: filterOptions.year,
        day: filterOptions.day,
        month: filterOptions.month,
        is_availability: true,
        doctor_id,
      },
    });

    if (!availabilities.length) {
      throw new NotFoundException(
        'Schedules of availability of doctors not found',
      );
    }

    availabilities = this.sortAvailabititiesByDate(availabilities);

    return availabilities;
  }

  async searchAvailabilityDoctorByAvailabilityId(
    id: string,
    doctor_id: string,
  ) {
    const availability = await this.availabilityDoctorRepository.findOne({
      where: {
        id,
        is_availability: true,
        doctor_id,
      },
      relations: ['doctor'],
    });

    if (!availability) {
      throw new ConflictException(
        'The doctor is not available at the selected time or is already scheduled',
      );
    }

    return availability;
  }

  async searchAvailabilityDoctorTaken(
    searchDateParams: CreateAvailabilityDoctorDto,
  ): Promise<AvailabilityDoctor> {
    const { doctor_id, year, month, day, schedule } = searchDateParams;
    const availability = await this.availabilityDoctorRepository.findOne({
      where: {
        doctor_id,
        year,
        month,
        day,
        schedule,
        is_availability: false,
      },
    });

    return availability;
  }

  async updateAvailability(updatedAvailability: AvailabilityDoctor) {
    const result = await this.availabilityDoctorRepository.update(
      { id: updatedAvailability.id },
      { ...updatedAvailability },
    );

    if (!result.affected)
      throw new InternalServerErrorException(
        'Failed to update availability. Availability not updated',
      );

    return;
  }

  async deleteAvailability(
    id: string,
    doctor_id: string,
  ): Promise<{ message: string }> {
    // Get availability by ID and doctor_id
    const availability = await this.availabilityDoctorRepository.findOne({
      where: { id, doctor_id },
    });

    // Check if availability exists
    if (!availability) {
      throw new NotFoundException('Availability not found for the doctor');
    }

    const currentDate = new Date();

    // Validate that the availability date is equal to or greater than the current one
    const availabilityDate = new Date(
      availability.year,
      availability.month - 1, // Base 0 for the month
      availability.day,
      availability.schedule,
      0,
      0,
    );

    if (availabilityDate < currentDate) {
      throw new BadRequestException('Cannot delete past availabilities');
    }

    // Verify that availability is free
    if (!availability.is_availability) {
      throw new ConflictException('Cannot delete a scheduled availability');
    }

    // delete the availability
    const results =
      await this.availabilityDoctorRepository.remove(availability);

    if (!results) {
      throw new InternalServerErrorException(
        'Failed to delete availability. Availability not removed',
      );
    }

    return {
      message: 'Availability deleted successfully',
    };
  }

  createFilterOptionsOfDate(
    availabilitiesFilterOptions:
      | IFilterOptionsForPatients
      | IFilterOptionsForDoctors,
    currentDate: Date,
  ) {
    const { year, month, day } = availabilitiesFilterOptions;

    const filterOptions = {
      year: year ? year : MoreThanOrEqual(currentDate.getFullYear()),
      month: month
        ? month
        : year === currentDate.getFullYear()
          ? MoreThanOrEqual(currentDate.getMonth() + 1)
          : undefined, // plus 1 since month starts on base 0
      day: day
        ? day
        : year === currentDate.getFullYear() &&
            month === currentDate.getMonth() + 1
          ? currentDate.getMonth() + 1
          : undefined,
    };

    return filterOptions;
  }
  sortAvailabititiesByDate(availabilities: AvailabilityDoctor[]) {
    // sort by availability date
    return availabilities.sort((availabilityA, availabilityB) => {
      // get availability date based on availability properties
      const availabilityDateA = new Date(
        availabilityA.year,
        availabilityA.month - 1,
        availabilityA.day,
        availabilityA.schedule,
      );
      const availabilityDateB = new Date(
        availabilityB.year,
        availabilityB.month - 1,
        availabilityB.day,
        availabilityB.schedule,
      );

      // compare availability dates and return values for sort method
      return availabilityDateA > availabilityDateB
        ? 1
        : availabilityDateA < availabilityDateB
          ? -1
          : 0;
    });
  }

  // block expired availability not taken
  async blockExpiredAvailabilityNotTaken(currentDate: Date) {
    const availabilityNotTaken = await this.availabilityDoctorRepository.find({
      where: {
        is_availability: true,
        year: LessThanOrEqual(currentDate.getFullYear()),
        month: LessThanOrEqual(currentDate.getMonth() + 1),
        day: LessThanOrEqual(currentDate.getDate()),
      },
    });

    if (!availabilityNotTaken.length) {
      return;
    }

    const expiredIds = availabilityNotTaken
      .filter(({ year, month, day, schedule }) => {
        const availabilityDate = new Date(year, month - 1, day, schedule, 0, 0);
        return availabilityDate < currentDate;
      })
      .map((expiredAvailability) => expiredAvailability.id);

    if (!expiredIds.length) {
      return;
    }

    await this.availabilityDoctorRepository.update(
      { id: In(expiredIds) },
      { is_availability: false },
    );

    console.log(`${expiredIds.length} availabilities marked as expired`);
  }
}
