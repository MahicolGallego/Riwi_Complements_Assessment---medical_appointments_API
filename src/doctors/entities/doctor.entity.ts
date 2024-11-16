import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Specialty } from 'src/common/constants/speciality.enum';
import { Role } from 'src/common/constants/roles.enum';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { AvailabilityDoctor } from 'src/availability_doctor/entities/availability_doctor.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Excluye el campo `password` al serializar la entidad
  password: string;

  @Column({
    type: 'enum',
    enum: Specialty,
  })
  specialty: Specialty;

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
