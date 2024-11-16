import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityDoctorService } from './availability_doctor.service';

describe('AvailabilityDoctorService', () => {
  let service: AvailabilityDoctorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailabilityDoctorService],
    }).compile();

    service = module.get<AvailabilityDoctorService>(AvailabilityDoctorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
