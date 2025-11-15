import { Injectable } from '@nestjs/common';
import { RedeemStrategy } from '../../events/enums/event.enums';
import { IRedeemStrategy } from './redeem-strategy.interface';
import { WristbandRedeemStrategy } from './wristband-redeem.strategy';
import { BibRedeemStrategy } from './bib-redeem.strategy';
import { NoneRedeemStrategy } from './none-redeem.strategy';

@Injectable()
export class RedeemStrategyFactory {
  constructor(
    private readonly wristbandStrategy: WristbandRedeemStrategy,
    private readonly bibStrategy: BibRedeemStrategy,
    private readonly noneStrategy: NoneRedeemStrategy,
  ) {}

  getStrategy(strategy: RedeemStrategy): IRedeemStrategy {
    switch (strategy) {
      case RedeemStrategy.WRISTBAND:
        return this.wristbandStrategy;
      case RedeemStrategy.BIB:
        return this.bibStrategy;
      case RedeemStrategy.NONE:
        return this.noneStrategy;
      default:
        return this.noneStrategy;
    }
  }
}
