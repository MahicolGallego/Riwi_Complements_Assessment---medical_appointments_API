import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { validatePassword } from 'src/common/helpers/validate-password.dto';
import { IPayloadToken } from 'src/common/interfaces/payload-token.interface';
import { DoctorsService } from 'src/doctors/doctors.service';
import { CreateDoctorDto } from 'src/doctors/dto/create-doctor.dto';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { CreatePatientDto } from 'src/patients/dto/create-patient.dto';
import { Patient } from 'src/patients/entities/patient.entity';
import { PatientsService } from 'src/patients/patients.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => PatientsService))
    private readonly patiensService: PatientsService,
    @Inject(forwardRef(() => DoctorsService))
    private readonly doctorsService: DoctorsService,
    private readonly jwtService: JwtService,
  ) {}

  async registerPatientUser(createPatientDto: CreatePatientDto) {
    return await this.patiensService.registerPatient(createPatientDto);
  }

  async registerDoctorUser(createDoctorDto: CreateDoctorDto) {
    return await this.doctorsService.registerDoctor(createDoctorDto);
  }

  async validateUser(userCredentials: { email: string; password: string }) {
    let foundUser = await this.patiensService.findByEmail(
      userCredentials.email,
    );

    if (!foundUser) {
      foundUser = await this.doctorsService.findByEmail(userCredentials.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    //validate password

    await validatePassword(foundUser.password, userCredentials.password);

    return foundUser;
  }

  generateJwtToken(user: Patient | Doctor) {
    const payload: IPayloadToken = {
      sub: user.id,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
