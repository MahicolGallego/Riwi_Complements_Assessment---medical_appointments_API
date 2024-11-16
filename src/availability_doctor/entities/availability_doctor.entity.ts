import { Doctor } from 'src/doctors/entities/doctor.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('availability_doctors')
export class AvailabilityDoctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({})
  doctor_id: string;

  @Column({ nullable: false })
  year: number;

  @Column({ nullable: false })
  month: number;

  @Column({ nullable: false })
  day: number;

  @Column({ nullable: false })
  schedule: number;

  @Column({ type: 'boolean' })
  is_availability: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.id, { nullable: false })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
