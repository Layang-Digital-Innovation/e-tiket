import { Test, TestingModule } from '@nestjs/testing';
import { WristbandController } from './wristband.controller';
import { WristbandService } from './wristband.service';

describe('WristbandController', () => {
  let controller: WristbandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WristbandController],
      providers: [WristbandService],
    }).compile();

    controller = module.get<WristbandController>(WristbandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
