import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Specialty } from 'src/common/constants/speciality.enum';
import { Role } from 'src/common/constants/roles.enum';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AvailabilityDoctor } from 'src/availability_doctor/entities/availability_doctor.entity';

@Entity('doctors')
export class Doctor {
  @ApiProperty({ description: 'Unique ID for the doctor', example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Full name of the doctor',
    example: 'Dr. John Doe',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Email address of the doctor',
    example: 'johndoe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Password for the doctor (excluded from serialization)',
    example: 'securepassword',
  })
  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'Specialty of the doctor', enum: Specialty })
  @Column({
    type: 'enum',
    enum: Specialty,
  })
  specialty: Specialty;

  @ApiProperty({ description: 'Role of the doctor in the system', enum: Role })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.doctor,
  })
  role: Role;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(
    () => AvailabilityDoctor,
    (availabilityDoctor) => availabilityDoctor.doctor,
  )
  availabilityDoctor: AvailabilityDoctor[];
}
