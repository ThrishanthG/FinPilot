import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: number[]; // Last 7 data points
}

@Injectable()
export class MarketDataService {
  constructor(private redisService: RedisService) {}

  private getInitialTickers(): TickerData[] {
    return [
      { symbol: '^NSEI', name: 'NIFTY 50', price: 22450.80, change: 125.40, changePercent: 0.56, history: [22200, 22250, 22310, 22280, 22350, 22325, 22450.8] },
      { symbol: '^BSESN', name: 'SENSEX', price: 73910.50, change: 410.20, changePercent: 0.56, history: [73100, 73200, 73450, 73300, 73600, 73550, 73910.5] },
      { symbol: '^NSEBANK', name: 'Bank Nifty', price: 47920.15, change: -180.40, changePercent: -0.38, history: [48100, 48250, 48050, 47900, 48150, 48100, 47920.15] },
      { symbol: '^IXIC', name: 'NASDAQ', price: 16180.45, change: 185.30, changePercent: 1.16, history: [15800, 15900, 15950, 16010, 16080, 16000, 16180.45] },
      { symbol: '^GSPC', name: 'S&P 500', price: 5120.30, change: 45.10, changePercent: 0.89, history: [5010, 5030, 5060, 5050, 5090, 5075, 5120.30] },
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2920.40, change: 35.20, changePercent: 1.22, history: [2850, 2870, 2890, 2880, 2900, 2885, 2920.40] },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3880.15, change: -42.30, changePercent: -1.08, history: [3950, 3960, 3920, 3910, 3940, 3922, 3880.15] },
      { symbol: 'INFY', name: 'Infosys Ltd', price: 1540.60, change: 12.85, changePercent: 0.84, history: [1510, 1520, 1532, 1522, 1545, 1527, 1540.60] },
    ];
  }

  async getLatestMarketData(): Promise<TickerData[]> {
    const cacheKey = 'market_data:latest';
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // If cache missed, generate current base data, save to Redis with a 15-second TTL
    const rawData = this.getInitialTickers();
    await this.redisService.set(cacheKey, JSON.stringify(rawData), 15);
    return rawData;
  }

  // Simulates incremental ticks (fluctuations) for websocket streams
  async tickMarketPrices(): Promise<TickerData[]> {
    const cacheKey = 'market_data:latest';
    let data = await this.getLatestMarketData();

    // Fluctuated prices
    data = data.map(ticker => {
      const volatility = 0.002; // max 0.2% change per tick
      const pct = (Math.random() - 0.49) * volatility; // slight upward bias
      const oldPrice = ticker.price;
      const newPrice = Number((oldPrice * (1 + pct)).toFixed(2));
      const delta = Number((newPrice - oldPrice).toFixed(2));
      const newChange = Number((ticker.change + delta).toFixed(2));
      
      // Update history array by appending new price and shifting oldest
      const newHistory = [...ticker.history];
      newHistory[newHistory.length - 1] = newPrice;

      return {
        ...ticker,
        price: newPrice,
        change: newChange,
        changePercent: Number(((newChange / (newPrice - newChange)) * 100).toFixed(2)),
        history: newHistory
      };
    });

    // Write back to cache
    await this.redisService.set(cacheKey, JSON.stringify(data), 15);
    return data;
  }
}
