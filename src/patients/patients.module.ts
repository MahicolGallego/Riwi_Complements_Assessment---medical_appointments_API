import { forwardRef, Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthModule } from 'src/auth/auth.module';
import { Patient } from './entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), forwardRef(() => AuthModule)],
  providers: [PatientsService],
  exports: [PatientsService, TypeOrmModule],
})
export class PatientsModule {}
