import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AppointmentStatus } from 'src/common/constants/appoinment-status.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role } from 'src/common/constants/roles.enum';
import {
  IFilterOptionsForDoctors,
  IFilterOptionsForPatients,
} from 'src/common/interfaces/availabilities-filter-options';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentDetailsService } from 'src/appointment_details/appointment_details.service';
import { AvailabilityDoctorService } from 'src/availability_doctor/availability_doctor.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { PatientsService } from 'src/patients/patients.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @Inject(forwardRef(() => AppointmentDetailsService))
    private readonly appointmentsDetailsService: AppointmentDetailsService,
    private readonly availabilitiesDoctorService: AvailabilityDoctorService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { doctor_id, patient_id, availability_id, reason_consultation } =
      createAppointmentDto;

    // Check if the doctor is available for the requested date and time
    const availability =
      await this.availabilitiesDoctorService.searchAvailabilityDoctorByAvailabilityId(
        availability_id,
        doctor_id,
      );

    // create the appointment date, based on the availability date
    const { year, month, day, schedule } = availability;

    // (JavaScript months start from 0)
    const appointment_date = new Date(year, month - 1, day, schedule, 0, 0);

    // Verify that the patient exists
    const patient = await this.patientsService.findById(patient_id);
    // Verify that the doctor exists
    const doctor = await this.doctorsService.findById(doctor_id);

    // create a new appointment
    const appointment = this.appointmentRepository.create({
      doctor,
      patient,
      appointment_date,
      status: AppointmentStatus.SCHEDULED,
    });

    //register on DB The new appointment
    const newAppointmentRegistered =
      await this.appointmentRepository.save(appointment);

    // create appoinment details
    await this.appointmentsDetailsService.create({
      appointment_id: newAppointmentRegistered.id,
      reason_consultation,
    });

    //  Update the doctor's availability for that date and ti
    availability.is_availability = false;
    await this.availabilitiesDoctorService.updateAvailability(availability);

    return appointment;
  }

  // Get all patient-appointments by your ID associated
  async findAllPatientAppointments(
    patient_id: string,
    filterOptions: IFilterOptionsForPatients,
  ): Promise<Appointment[]> {
    // create filter options
    const dateForFilter = this.createFilterOptionsOfDate(filterOptions);

    const whereConditions: any = { patient_id };

    if (dateForFilter) {
      whereConditions.appointment_date = dateForFilter; // Solo si `dateFilter` es un valor válido
    }

    if (filterOptions.speciality) {
      whereConditions.doctor = { speciality: filterOptions.speciality };
    }

    const appointments = await this.appointmentRepository.find({
      where: whereConditions,
      order: { appointment_date: 'ASC' }, // sort by appointment_date ascending
      relations: ['doctor', 'patient'], // We match doctors and patients
    });

    if (appointments.length === 0) {
      throw new NotFoundException('No appointments found for this patient');
    }

    return appointments;
  }

  // Get all doctor-appointments by your ID associated
  async findAllDoctorAppointments(
    doctor_id: string,
    filterOptions: IFilterOptionsForDoctors,
  ): Promise<Appointment[]> {
    // create filter options

    const dateForFilter = this.createFilterOptionsOfDate(filterOptions);

    const whereConditions: any = { doctor_id };

    if (dateForFilter) {
      whereConditions.appointment_date = dateForFilter; // Solo si `dateFilter` es un valor válido
    }

    const appointments = await this.appointmentRepository.find({
      where: whereConditions,
      order: { appointment_date: 'ASC' }, // sort by appointment_date ascending
      relations: ['doctor', 'patient'], // We match doctors and patients
    });

    if (appointments.length === 0) {
      throw new NotFoundException('No appointments found for this doctor');
    }

    return appointments;
  }

  // Get a patient-specific appointment by your ID
  async findOnePatientAppointment(
    id: string,
    patient_id: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, patient_id },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`No appointment found for this patient`);
    }

    return appointment;
  }

  // Get a doctor-specific appointment by your ID
  async findOneDoctorAppointment(
    id: string,
    doctor_id: string,
  ): Promise<Appointment> {
    // Buscamos la cita específica del doctor
    const appointment = await this.appointmentRepository.findOne({
      where: { id, doctor_id },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`No appointment found for this doctor`);
    }

    return appointment;
  }

  async rescheduleAppointment(
    id: string,
    patient_id: string,
    availability_id: string,
  ): Promise<Appointment> {
    // looking for a appointment to reschedule
    const appointment = await this.appointmentRepository.findOne({
      where: { id, patient_id },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`No appointment found for this patient`);
    }

    // chech if the appointment is not expired
    const currentDate = new Date();
    if (appointment.appointment_date < currentDate)
      throw new ConflictException(
        'You cannot re schedule a appointment that is already expired',
      );

    // Looking for a new availability
    const { doctor_id } = appointment;

    const availability =
      await this.availabilitiesDoctorService.searchAvailabilityDoctorByAvailabilityId(
        availability_id,
        doctor_id,
      );

    if (!availability) {
      throw new ConflictException(
        'The doctor is not available at the new selected time or is already scheduled',
      );
    }

    // Release the previous availability
    const previousAvailability =
      await this.availabilitiesDoctorService.searchAvailabilityDoctorTaken({
        doctor_id: appointment.doctor.id,
        year: appointment.appointment_date.getFullYear(),
        month: appointment.appointment_date.getMonth() + 1,
        day: appointment.appointment_date.getDate(),
        schedule: appointment.appointment_date.getHours(),
      });

    if (previousAvailability) {
      previousAvailability.is_availability = true;
      await this.availabilitiesDoctorService.updateAvailability(
        previousAvailability,
      );
    }

    /// create the new appointment date, based on the availability date
    const { year, month, day, schedule } = availability;
    const newAppointmentDate = new Date(year, month - 1, day, schedule, 0, 0);

    // update the appointment date
    appointment.appointment_date = newAppointmentDate;
    await this.appointmentRepository.save(appointment);

    // update the new availability taken by the appointment
    availability.is_availability = false;
    await this.availabilitiesDoctorService.updateAvailability(availability);

    return;
  }

  async cancelAppointment(id: string, patient_id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, patient_id },
      relations: ['doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found for this patient');
    }

    // Verify that the appointment is scheduled
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new ConflictException(
        'Only scheduled appointments can be canceled',
      );
    }

    // Validate that the appointment date is future
    const currentDate = new Date();
    if (appointment.appointment_date < currentDate) {
      throw new ConflictException(
        'Past or ongoing appointments cannot be canceled',
      );
    }

    // Change appointment status
    appointment.status = AppointmentStatus.CANCELED;
    appointment.update_by = Role.patient;
    await this.appointmentRepository.save(appointment);

    // If the cancelled appointment date is greater than the current one, release availability again
    const appointmentDate = appointment.appointment_date;
    if (appointmentDate > currentDate) {
      const availability =
        await this.availabilitiesDoctorService.searchAvailabilityDoctorTaken({
          doctor_id: appointment.doctor.id,
          year: appointmentDate.getFullYear(),
          month: appointmentDate.getMonth() + 1,
          day: appointmentDate.getDate(),
          schedule: appointmentDate.getHours(),
        });

      if (availability) {
        availability.is_availability = true;
        await this.availabilitiesDoctorService.updateAvailability(availability);
      }

      return {
        message: 'Appointment cancelled successfully',
        appointment: appointment,
      };
    }
  }

  async updateAppointmentStatus(
    id: string,
    doctor_id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<{ message: string; appointment: Appointment }> {
    const { status, notes } = updateAppointmentDto;

    if (status === 'scheduled') {
      throw new BadRequestException(
        'As a doctor you cannot schedule appointments directly',
      );
    }
    // looking for appointment
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['appointment_details'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // validate the doctor associated with the appointment
    if (appointment.doctor_id !== doctor_id) {
      throw new BadRequestException(
        'You are not authorized to update this appointment',
      );
    }

    // If the appointment will be cancelled and its date is greater than the current one, release availability againnt
    const currentDate = new Date();
    const appointmentDate = appointment.appointment_date;
    if (status === 'canceled' && appointmentDate > currentDate) {
      const availability =
        await this.availabilitiesDoctorService.searchAvailabilityDoctorTaken({
          doctor_id: appointment.doctor_id,
          year: appointmentDate.getFullYear(),
          month: appointmentDate.getMonth() + 1,
          day: appointmentDate.getDate(),
          schedule: appointmentDate.getHours(),
        });

      if (availability) {
        availability.is_availability = true;
        await this.availabilitiesDoctorService.updateAvailability(availability);
      }
    }

    // update appointment status
    appointment.status = status;
    appointment.update_by = Role.doctor;

    // update notes on the details of appointment
    appointment.appointment_details.notes = notes;
    await this.appointmentsDetailsService.update(appointment.id, {
      notes: appointment.appointment_details.notes,
      reason_consultation: appointment.appointment_details.reason_consultation,
    });

    // Save changes in the appointment
    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment updated successfully',
      appointment: appointment,
    };
  }

  createFilterOptionsOfDate(
    availabilitiesFilterOptions:
      | IFilterOptionsForPatients
      | IFilterOptionsForDoctors,
  ) {
    const currentDate = new Date();

    // create date object for filtering
    // if some date not provided, then it will be the current

    const { year, month, day } = availabilitiesFilterOptions;

    let DateForFilter: Date | undefined = undefined;

    if (year || month || day) {
      DateForFilter = new Date(
        year ? year : currentDate.getFullYear(),
        month ? month : currentDate.getMonth() - 1,
        day ? day : currentDate.getDate(),
      );
    }
    return DateForFilter;
  }

  findOne(id: string) {
    const appoinment = this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appoinment) throw new NotFoundException('No appointment found');

    return appoinment;
  }
}
