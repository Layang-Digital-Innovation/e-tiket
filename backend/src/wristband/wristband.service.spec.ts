import { Test, TestingModule } from '@nestjs/testing';
import { WristbandService } from './wristband.service';

describe('WristbandService', () => {
  let service: WristbandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WristbandService],
    }).compile();

    service = module.get<WristbandService>(WristbandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
