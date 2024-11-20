import { forwardRef, Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor]), forwardRef(() => AuthModule)],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
