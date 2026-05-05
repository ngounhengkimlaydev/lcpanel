import { Injectable } from '@nestjs/common';
import { writeFile, mkdir, readFile, appendFile } from 'fs/promises';
import { join } from 'path';
import { TelegramService } from '../../service/telegram.service';

@Injectable()
export class FileService {
    constructor(private readonly telegramService: TelegramService) {}
    async writeJson(folder: string, filename: string, data: any) {
        const dirPath = join(process.cwd(), folder);

        // create folder if not exists
        await mkdir(dirPath, { recursive: true });

        const filePath = join(dirPath, filename);

        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

        return {
            message: 'File saved',
            path: filePath,
        };
    }
    async logFile(data: any, prefixFileName?: string) {
        const logData = {
            time: new Date().toISOString(),
            message: data,
        };

        const isQuery = prefixFileName === 'query';
        const isError = prefixFileName === 'error';
        const logText = isQuery
            ? this.formatQueryLog(data)
            : isError
              ? this.formatErrorLog(data)
              : JSON.stringify({ time: new Date().toISOString(), message: data }, null, 2);

        if (process.env.LOG_TYPE === 'PRODUCTION') {
            try {
                let telegramText = '';

                if (isQuery) {
                    telegramText = `<b>🗄️ PRISMA QUERY</b>\n\n<pre>${logText}</pre>`;
                } else {
                    const rawMessage = logData?.message || '';

                    // 🔥 Extract useful parts
                    const lines = rawMessage.split('\n');

                    const location = lines.find((l: string) => l.includes('.ts:')) || 'N/A';
                    const errorLine = lines.find((l: string) => l.includes('Argument')) || '';
                    const mainError = lines[1]?.trim() || '';

                    // 🧼 Clean + shorten message
                    const cleaned = rawMessage
                        .replace(/`/g, '') // remove backticks
                        .replace(/\n{2,}/g, '\n') // remove extra spacing
                        .trim()
                        .slice(0, 1500); // prevent Telegram overflow

                    telegramText = `
<b>🚨 PRISMA ERROR</b>

<b>📍 Location:</b>
<pre>${location}</pre>

<b>❗ Message:</b>
<pre>${mainError}</pre>

<b>⚠️ Detail:</b>
<pre>${errorLine}</pre>

<b>📦 Full Log:</b>
<pre>${cleaned}</pre>
      `;
                }

                await this.telegramService.sendMessage(telegramText);
            } catch (err: any) {
                console.error('Telegram send failed:', err.message);
            }

            return { message: 'Log sent to Telegram' };
        }

        const dirPath = join(process.cwd(), 'logs');
        const filename = `${prefixFileName ?? 'log'}-${new Date().toISOString().split('T')[0]}.log`;

        await mkdir(dirPath, { recursive: true });

        const filePath = join(dirPath, filename);
        await appendFile(filePath, logText + '\n', 'utf8');

        return { message: 'Log saved', path: filePath };
    }
    async readJson(folder: string, filename: string) {
        const dirPath = join(process.cwd(), folder);
        const filePath = join(dirPath, filename);
        const file = await readFile(filePath, 'utf8');

        return JSON.parse(file);
    }
    private formatQueryLog(data: {
        model?: string;
        operation?: string;
        args?: any;
        query?: string;
        params?: any;
        duration?: string;
        timestamp: string;
    }): string {
        const separator = '─'.repeat(60);
        const args =
            data.args != null ? JSON.stringify(data.args, null, 2).replace(/\n/g, '\n   ') : 'N/A';
        const params =
            data.params != null
                ? JSON.stringify(data.params, null, 2).replace(/\n/g, '\n   ')
                : 'N/A';

        return [
            separator,
            `⏱  ${data.timestamp}  |  ${data.duration ?? 'N/A'}`,
            `🗂  Model    : ${data.model ?? 'N/A'}`,
            `⚙️  Operation : ${data.operation ?? 'N/A'}`,
            `📝 Query:`,
            `   ${data.query ?? 'N/A'}`,
            `📦 Params:`,
            `   ${params}`,
            `📥 Args:`,
            `   ${args}`,
            separator,
        ].join('\n');
    }

    private formatErrorLog(data: { message: string; target?: string; timestamp: string }): string {
        const separator = '─'.repeat(60);
        return [
            separator,
            `⏱  ${data.timestamp}`,
            `❌ Error:`,
            `   ${data.message ?? 'N/A'}`,
            `🎯 Target:`,
            `   ${data.target ?? 'N/A'}`,
            separator,
        ].join('\n');
    }
}
