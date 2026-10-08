import { Controller, Get } from '@nestjs/common';
import { MarketDataService } from './market-data.service';

@Controller('market-data')
export class MarketDataController {
  constructor(private marketDataService: MarketDataService) {}

  @Get('tickers')
  async getTickers() {
    const tickers = await this.marketDataService.getLatestMarketData();
    return { tickers };
  }
}
