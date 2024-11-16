import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityDoctorController } from './availability_doctor.controller';
import { AvailabilityDoctorService } from './availability_doctor.service';

describe('AvailabilityDoctorController', () => {
  let controller: AvailabilityDoctorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityDoctorController],
      providers: [AvailabilityDoctorService],
    }).compile();

    controller = module.get<AvailabilityDoctorController>(AvailabilityDoctorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
