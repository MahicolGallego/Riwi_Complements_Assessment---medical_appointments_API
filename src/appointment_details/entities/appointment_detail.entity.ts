import { Appointment } from 'src/appointments/entities/appointment.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('appointment_details')
export class AppointmentDetail {
  @ApiProperty({
    description: 'Unique ID for the appointment detail',
    example: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Reason for the consultation',
    example: 'Headache',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  reason_consultation: string;

  @ApiProperty({
    description: 'Additional notes about the consultation',
    example: 'The patient is feeling better',
  })
  @Column({ type: 'varchar', nullable: true, default: null })
  notes: string;

  @OneToOne(
    () => Appointment,
    (appointment) => appointment.appointment_details,
    { nullable: false },
  )
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
