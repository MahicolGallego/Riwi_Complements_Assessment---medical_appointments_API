import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from 'src/common/constants/roles.enum';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('patients')
export class Patient {
  @ApiProperty({ description: 'Unique ID for the patient', example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Full name of the patient', example: 'Jane Doe' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Email address of the patient',
    example: 'janedoe@example.com',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({
    description: 'Password for the patient (excluded from serialization)',
    example: 'securepassword',
  })
  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'Role of the patient in the system', enum: Role })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.patient,
  })
  role: Role;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];
}
