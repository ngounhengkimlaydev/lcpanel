import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
    private botToken = process.env.TELEGRAM_BOT_TOKEN;
    private chatId = process.env.TELEGRAM_CHAT_ID;

    constructor(private readonly httpService: HttpService) {}

    async sendMessage(text: string) {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

        try {
            const response = await firstValueFrom(
                this.httpService.post(url, {
                    chat_id: this.chatId,
                    text,
                    parse_mode: 'HTML',
                }),
            );

            return response.data;
        } catch (error: any) {
            console.error('Telegram Error:', error.response?.data || error.message);
            throw error;
        }
    }
}
