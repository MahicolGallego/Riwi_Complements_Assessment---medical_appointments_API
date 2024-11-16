import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ErrorManager } from 'src/common/exception-filters/error-manager.filter';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { hashPassword } from 'src/common/helpers/hash-password.helper';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async registerPatient(createPatienteDto: CreatePatientDto): Promise<object> {
    try {
      const newUser = this.patientsRepository.create(createPatienteDto);
      newUser.password = await hashPassword(
        newUser.password,
        this.configService,
      );

      const createdUser = await this.patientsRepository.save(newUser);

      // Retornar credenciales de acceso despues de crear el usuario
      return this.authService.generateJwtToken(createdUser);
    } catch (error) {
      console.error('Error during user registration:', error);
      if (error instanceof Error) {
        throw ErrorManager.createSignatureError(error.message);
      } else {
        throw ErrorManager.createSignatureError('An unexpected error occurred');
      }
    }
  }

  async findByEmail(email: string) {
    return await this.patientsRepository.findOne({ where: { email } });
  }
}
