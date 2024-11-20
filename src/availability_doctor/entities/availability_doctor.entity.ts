import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Unique ID for the availability',
    example: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the associated doctor', example: 'uuid' })
  @Column({})
  doctor_id: string;

  @ApiProperty({ description: 'Year of availability', example: 2024 })
  @Column({ nullable: false })
  year: number;

  @ApiProperty({ description: 'Month of availability', example: 11 })
  @Column({ nullable: false })
  month: number;

  @ApiProperty({ description: 'Day of availability', example: 20 })
  @Column({ nullable: false })
  day: number;

  @ApiProperty({
    description: 'Time slot available (24-hour format)',
    example: 10,
  })
  @Column({ nullable: false })
  schedule: number;

  @ApiProperty({
    description: 'Whether the doctor is available at the specified time',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  is_availability: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.id, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
