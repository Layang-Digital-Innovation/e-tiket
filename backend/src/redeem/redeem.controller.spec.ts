import { Test, TestingModule } from '@nestjs/testing';
import { RedeemController } from './redeem.controller';
import { RedeemService } from './redeem.service';

describe('RedeemController', () => {
  let controller: RedeemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedeemController],
      providers: [RedeemService],
    }).compile();

    controller = module.get<RedeemController>(RedeemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
