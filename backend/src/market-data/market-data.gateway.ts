import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MarketDataService } from './market-data.service';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MarketDataGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer() server: Server;
  private intervalId: NodeJS.Timeout;

  constructor(private marketDataService: MarketDataService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`WebSocket client connected: ${client.id}`);
    // Emit current prices immediately on connect
    this.marketDataService.getLatestMarketData().then(data => {
      client.emit('market-tick', data);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`WebSocket client disconnected: ${client.id}`);
  }

  onModuleInit() {
    // Start standard ticking broadcast interval (every 5 seconds)
    this.intervalId = setInterval(async () => {
      try {
        const tickedPrices = await this.marketDataService.tickMarketPrices();
        this.server.emit('market-tick', tickedPrices);
      } catch (e) {
        console.error('Error broadcasting market ticks:', e.message);
      }
    }, 5000);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
