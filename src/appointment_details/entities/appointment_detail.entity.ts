import { Appointment } from 'src/appointments/entities/appointment.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('appointment_details')
export class AppointmentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  reason_consultation: string;

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
