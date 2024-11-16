import { AppointmentDetail } from 'src/appointment_details/entities/appointment_detail.entity';
import { AppointmentStatus } from 'src/common/constants/appoinment-status.enum';
import { Role } from 'src/common/constants/roles.enum';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  appointment_date: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column()
  patient_id: string;

  @Column()
  doctor_id: string;

  @Column({
    type: 'enum',
    enum: Role,
    nullable: true,
    default: null,
  })
  update_by: Role | null;

  @ManyToOne(() => Doctor, (doctor) => doctor.id, { nullable: false })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.id, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToOne(
    () => AppointmentDetail,
    (appointment_details) => appointment_details.appointment,
    { eager: true },
  )
  appointment_details: AppointmentDetail;
}
