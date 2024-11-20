import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly doctorsRepository: Repository<Doctor>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async registerDoctor(createDoctorDto: CreateDoctorDto): Promise<object> {
    try {
      const newUser = this.doctorsRepository.create(createDoctorDto);
      newUser.password = await hashPassword(
        newUser.password,
        this.configService,
      );

      const createdUser = await this.doctorsRepository.save(newUser);

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
    return await this.doctorsRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}
