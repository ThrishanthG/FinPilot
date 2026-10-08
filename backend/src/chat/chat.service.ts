import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class ChatService {
  private disclaimerText = "Disclaimer: This suggestion is for educational purposes only and is not a substitute for advice from a SEBI-registered Investment Adviser. Past performance does not guarantee future returns.";

  constructor(
    private redisService: RedisService,
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  /**
   * Main FinBot Generator method - Works like ChatGPT/Gemini (conversational, no web search)
   */
  async generateFinbotReply(userMessage: string, conversationHistory: any[] = []): Promise<string> {
    const grokKey = process.env.GROK_API_KEY || this.configService.get<string>('GROK_API_KEY');
    
    const systemInstruction = `You are FinBot, a concise AI Financial Trading Assistant for FinPilot.
Provide quick, direct answers about:
- Investment strategies and portfolio recommendations
- SIP (Systematic Investment Plan) calculations
- Risk profiling and financial planning
- Market insights and trading tips
- Mutual funds, stocks, ETFs, bonds, and cryptocurrency guidance

Key Rules:
1. Keep responses SHORT and CONCISE (max 2-3 paragraphs or 5-7 bullet points).
2. Be conversational, friendly, and professional.
3. Do NOT include disclaimers, notes, or legal text.
4. Do NOT perform web searches - provide guidance based on your knowledge.
5. Answer questions directly without unnecessary elaboration.
6. Use simple language and avoid long-winded explanations.`;

    console.log('[ChatService] Grok Key Check - Length:', grokKey?.length || 0, 'First 10:', grokKey?.substring(0, 10) || 'NONE');

    // Call Groq AI API
    if (grokKey && grokKey.length > 10) {
      try {
        console.log('[ChatService] Attempting Groq API call with key:', grokKey.substring(0, 10) + '...');
        const groq = new Groq({ apiKey: grokKey });

        // Format conversation history for Groq
        const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
        if (Array.isArray(conversationHistory)) {
          for (const item of conversationHistory) {
            if (!item) continue;
            const textContent = item.text || item.content || '';
            if (!textContent.trim()) continue;
            const role = (item.role === 'bot' || item.role === 'model' || item.role === 'assistant') ? 'assistant' : 'user';
            messages.push({
              role,
              content: textContent.trim(),
            });
          }
        }

        // Add current user message
        messages.push({
          role: 'user',
          content: userMessage,
        });

        // Try different models (in order of preference)
        // Note: mixtral-8x7b-32768 and llama-3.1-70b-versatile are decommissioned
        const modelNames = ['llama-3.1-8b-instant', 'llama2-70b-4096', 'gemma-7b-it'];
        for (const modelName of modelNames) {
          try {
            console.log(`[ChatService] Trying model: ${modelName}`);
            const completion = await groq.chat.completions.create({
              messages: [
                {
                  role: 'system',
                  content: systemInstruction,
                },
                ...messages,
              ],
              model: modelName,
              temperature: 0.7,
              max_tokens: 512,
            });

            const text = completion.choices[0]?.message?.content;
            if (text && text.trim()) {
              console.log(`[ChatService] Success with model ${modelName}`);
              return text.trim();
            }
          } catch (modelErr) {
            console.warn(`[ChatService] Model ${modelName} error:`, modelErr?.message || modelErr);
          }
        }
      } catch (err) {
        console.error('[ChatService] Groq API Error:', err?.message || err);
      }
    } else {
      console.warn('[ChatService] No Groq API key provided. Key length:', grokKey?.length || 0);
    }

    // Fallback response if Groq is not available
    return this.generateFallbackResponse(userMessage);
  }

  /**
   * Generate a fallback response when Groq API is not available

  /**
   * Generate a fallback response when API is unavailable
   */
  private generateFallbackResponse(msg: string): string {
    const lowercase = msg.toLowerCase();
    let response = '';

    if (lowercase.includes('buy') || lowercase.includes('invest in') || lowercase.includes('stock tip') || lowercase.includes('crypto')) {
      response = `**Portfolio Allocation Example:**\n`;
      response += `- Equities/Funds: 50-60%\n`;
      response += `- Debt/Bonds: 30-40%\n`;
      response += `- Gold/Commodities: 5-10%\n`;
      response += `- Crypto (Optional): 0-5%\n\nConsult an adviser for personalized recommendations.`;
    } else if (lowercase.includes('sip') || lowercase.includes('compounding') || lowercase.includes('mutual fund')) {
      response = `**SIP Benefits:**\n`;
      response += `- Rupee cost averaging smooths volatility\n`;
      response += `- Compound growth over time\n`;
      response += `- Removes emotion from investing\n\nExample: ₹10,000/month for 10 years at 12% return = ~₹23 lakh`;
    } else if (lowercase.includes('risk') || lowercase.includes('conservative') || lowercase.includes('aggressive') || lowercase.includes('moderate')) {
      response = `**Risk Profiles:**\n`;
      response += `- **Conservative**: Bonds, Debt, Gold (Low risk)\n`;
      response += `- **Moderate**: 50% Equities, 50% Debt (Medium risk)\n`;
      response += `- **Aggressive**: 80-100% Equities (High risk, 10+ years)`;
    } else {
      response = `Hi! I'm FinBot. I can help with:\n`;
      response += `• Investment strategies & portfolio planning\n`;
      response += `• SIP calculations & compounding\n`;
      response += `• Risk profiling & asset allocation\n`;
      response += `• Market insights & trading tips\n\nWhat would you like to know?`;
    }

    return response;
  }

  async getChatResponse(userId: string, userMessage: string): Promise<string> {
    const rateLimitKey = `chat_limit:user:${userId}`;
    const limit = 15;
    const windowSeconds = 60;
    const isLimited = await this.redisService.isRateLimited(rateLimitKey, limit, windowSeconds);
    if (isLimited) {
      throw new HttpException('Chat rate limit exceeded. Please wait a minute.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return this.generateFinbotReply(userMessage, []);
  }
}
