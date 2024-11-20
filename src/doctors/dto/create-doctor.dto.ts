import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Specialty } from 'src/common/constants/speciality.enum';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Name of the doctor',
    example: 'Dr. Alice Smith',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the doctor',
    example: 'dr.alice@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the doctor account (minimum 6 characters)',
    example: 'securepassword',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Specialty of the doctor',
    example: Specialty.CARDIOLOGY,
    enum: Specialty,
  })
  @IsNotEmpty()
  @IsEnum(Specialty)
  specialty: Specialty;
}
