import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AppointmentDetail } from 'src/appointment_details/entities/appointment_detail.entity';

import { AvailabilityDoctor } from 'src/availability_doctor/entities/availability_doctor.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { AppointmentStatus } from 'src/common/constants/appoinment-status.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role } from 'src/common/constants/roles.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentDetail)
    private readonly appointmentDetailRepository: Repository<AppointmentDetail>,
    @InjectRepository(AvailabilityDoctor)
    private readonly availabilityDoctorRepository: Repository<AvailabilityDoctor>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { doctor_id, patient_id, availability_id, reason_consultation } =
      createAppointmentDto;

    // Check if the doctor is available for the requested date and time
    const availability = await this.availabilityDoctorRepository.findOne({
      where: {
        id: availability_id,
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

    // create the appointment date, based on the availability date
    const { year, month, day, schedule } = availability;

    // (JavaScript months start from 0)
    const appointment_date = new Date(year, month - 1, day, schedule, 0, 0);

    // Verify that the patient exists
    const patient = await this.patientRepository.findOne({
      where: { id: patient_id },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Verify that the doctor exists
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctor_id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not exists');
    }

    // create a new appointment
    const appointment = this.appointmentRepository.create({
      doctor,
      patient,
      appointment_date,
      status: AppointmentStatus.SCHEDULED,
    });

    //register on DB The new appointment
    await this.appointmentRepository.save(appointment);

    // crate appoinment details
    const appointmentDetail = this.appointmentDetailRepository.create({
      appointment,
      reason_consultation,
    });

    //register on DB The new appointment details for the new appoinment
    await this.appointmentDetailRepository.save(appointmentDetail);

    //  Update the doctor's availability for that date and ti
    availability.is_availability = false;
    await this.availabilityDoctorRepository.save(availability);

    return appointment;
  }

  // Get all patient-appointments by your ID associated
  async findAllPatientAppointments(id_patient: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { patient_id: id_patient },
      relations: ['doctor', 'patient'], // We match doctors and patients
    });

    if (appointments.length === 0) {
      throw new NotFoundException('No appointments found for this patient');
    }

    return appointments;
  }

  // Get all doctor-appointments by your ID associated
  async findAllDoctorAppointments(id_doctor: string): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { doctor_id: id_doctor },
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
    id_patient: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, patient_id: id_patient },
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
    id_doctor: string,
  ): Promise<Appointment> {
    // Buscamos la cita específica del doctor
    const appointment = await this.appointmentRepository.findOne({
      where: { id, doctor_id: id_doctor },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`No appointment found for this patient`);
    }

    return appointment;
  }

  async rescheduleAppointment(
    id: string,
    id_patient: string,
    availability_id: string,
  ): Promise<Appointment> {
    // looking for a appointment to reschedule
    const appointment = await this.appointmentRepository.findOne({
      where: { id, patient_id: id_patient },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`No appointment found for this patient`);
    }

    // Looking for a new availability
    const { doctor_id } = appointment;

    const availability = await this.availabilityDoctorRepository.findOne({
      where: {
        id: availability_id,
        is_availability: true,
        doctor_id,
      },
      relations: ['doctor'],
    });

    if (!availability) {
      throw new ConflictException(
        'The doctor is not available at the new selected time or is already scheduled',
      );
    }

    // Release the previous availability
    const previousAvailability =
      await this.availabilityDoctorRepository.findOne({
        where: {
          doctor_id: appointment.doctor.id,
          year: appointment.appointment_date.getFullYear(),
          month: appointment.appointment_date.getMonth() + 1,
          day: appointment.appointment_date.getDate(),
          schedule: appointment.appointment_date.getHours(),
        },
      });

    if (previousAvailability) {
      previousAvailability.is_availability = true;
      await this.availabilityDoctorRepository.save(previousAvailability);
    }

    /// create the new appointment date, based on the availability date
    const { year, month, day, schedule } = availability;
    const newAppointmentDate = new Date(year, month - 1, day, schedule, 0, 0);

    // update the appointment date
    appointment.appointment_date = newAppointmentDate;
    await this.appointmentRepository.save(appointment);

    // update disponibility
    availability.is_availability = false;
    await this.availabilityDoctorRepository.save(availability);

    return;
  }

  async cancelAppointment(id: string, id_patient: string, update_by: Role) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, patient_id: id_patient },
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
    appointment.update_by = update_by;
    await this.appointmentRepository.save(appointment);

    // If the cancelled appointment date is later than the current one, release availability again
    const appointmentDate = appointment.appointment_date;
    if (appointmentDate > currentDate) {
      const availability = await this.availabilityDoctorRepository.findOne({
        where: {
          doctor_id: appointment.doctor.id,
          year: appointmentDate.getFullYear(),
          month: appointmentDate.getMonth() + 1,
          day: appointmentDate.getDate(),
          schedule: appointmentDate.getHours(),
        },
      });

      if (availability) {
        availability.is_availability = true;
        await this.availabilityDoctorRepository.save(availability);
      }

      return {
        message: 'Appointment canceled successfully',
        appointment: appointment,
      };
    }
  }
}
