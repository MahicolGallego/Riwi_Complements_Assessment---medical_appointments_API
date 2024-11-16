import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentDetailsController } from './appointment_details.controller';
import { AppointmentDetailsService } from './appointment_details.service';

describe('AppointmentDetailsController', () => {
  let controller: AppointmentDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentDetailsController],
      providers: [AppointmentDetailsService],
    }).compile();

    controller = module.get<AppointmentDetailsController>(AppointmentDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
