import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('finbot')
@UseGuards(JwtAuthGuard)
export class FinbotController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  async finbotChat(@Body() body: { message: string; conversationHistory?: any[] }) {
    const message = body?.message || '';
    const conversationHistory = body?.conversationHistory || [];
    const reply = await this.chatService.generateFinbotReply(message, conversationHistory);
    return { reply };
  }
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async askQuestion(@Body() body: { message: string; conversationHistory?: any[] }, @Req() req: any) {
    const message = body?.message || '';
    const conversationHistory = body?.conversationHistory || [];
    const reply = await this.chatService.generateFinbotReply(message, conversationHistory);
    return { reply, answer: reply };
  }

  @Post('chat')
  async finbotChatLegacy(@Body() body: { message: string; conversationHistory?: any[] }) {
    const message = body?.message || '';
    const conversationHistory = body?.conversationHistory || [];
    const reply = await this.chatService.generateFinbotReply(message, conversationHistory);
    return { reply, answer: reply };
  }
}
