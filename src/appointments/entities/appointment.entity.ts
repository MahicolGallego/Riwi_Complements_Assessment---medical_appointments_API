import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Unique ID for the appointment',
    example: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Appointment date and time',
    example: '2024-11-20T10:00:00Z',
  })
  @Column({ type: 'timestamp' })
  appointment_date: Date;

  @ApiProperty({ description: 'Appointment status', enum: AppointmentStatus })
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @ApiProperty({ description: 'ID of the associated patient' })
  @Column()
  patient_id: string;

  @ApiProperty({ description: 'ID of the associated doctor' })
  @Column()
  doctor_id: string;

  @ApiProperty({
    description: 'Role of the user who updated the appointment (optional)',
    enum: Role,
    nullable: true,
  })
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

  @ApiProperty({
    description: 'Additional details of the appointment',
    type: () => AppointmentDetail,
  })
  @OneToOne(
    () => AppointmentDetail,
    (appointment_details) => appointment_details.appointment,
    { eager: true },
  )
  appointment_details: AppointmentDetail;
}
