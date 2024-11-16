import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { hashPassword } from 'src/common/helpers/hash-password.helper';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/common/exception-filters/error-manager.filter';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly patientsRepository: Repository<Doctor>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async registerDoctor(createDoctorDto: CreateDoctorDto): Promise<object> {
    try {
      const newUser = this.patientsRepository.create(createDoctorDto);
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
