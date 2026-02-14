import TelegramBot from 'node-telegram-bot-api';
import { log } from '@botman/logger';

export class TelegramNotifier {
  private bot: TelegramBot | null = null;
  private chatId: string;
  private enabled: boolean = false;

  constructor() {
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    this.chatId = process.env['TELEGRAM_CHAT_ID'] || '';

    // Check bot token
    if (!botToken) {
      log.error('❌ TELEGRAM_BOT_TOKEN is not set');
      log.info('💡 Get your bot token from @BotFather on Telegram');
      this.enabled = false;
      return;
    }

    // Check chat ID
    if (!this.chatId) {
      log.error('❌ TELEGRAM_CHAT_ID is not set');
      log.info('💡 Get your chat ID from @userinfobot on Telegram');
      this.enabled = false;
      return;
    }

    // Initialize bot
    try {
      this.bot = new TelegramBot(botToken, { polling: false });
      this.enabled = true;
      log.info('📱 Telegram notifier initialized');
      log.info(`✅ Bot token: ${botToken.substring(0, 10)}...`);
      log.info(`✅ Chat ID: ${this.chatId}`);
    } catch (error) {
      log.error('❌ Failed to initialize Telegram bot', error);
      this.enabled = false;
    }
  }

  /**
   * Send a message to Telegram
   */
  async sendMessage(message: string): Promise<boolean> {
    if (!this.enabled || !this.bot) {
      log.debug('Telegram disabled, skipping notification');
      return false;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      log.info('✅ Telegram message sent successfully');
      return true;
    } catch (error) {
      log.error('❌ Failed to send Telegram message', error);
      return false;
    }
  }

  /**
   * Send a startup notification
   */
  async sendStartupNotification(): Promise<void> {
    const message = `🎂 <b>Samantha Birthday Assistant</b>

✅ Service started successfully
🚀 Ready to track birthdays

I'll notify you about upcoming birthdays every day! 🎉`;

    await this.sendMessage(message);
  }

  /**
   * Send a birthday notification
   */
  async sendBirthdayNotification(
    name: string,
    nickname: string | undefined,
    daysUntil: number,
    relationship: string | undefined,
    interests: string | undefined,
    monthDay: string
  ): Promise<void> {
    let message = '';

    if (daysUntil === 0) {
      message = `🎂 <b>BIRTHDAY TODAY!</b> 🎂\n\n`;
      message += `It's <b>${name}</b>`;
      if (nickname) {
        message += ` (${nickname})`;
      }
      message += `'s birthday TODAY!\n\n`;
    } else if (daysUntil === 1) {
      message = `🎂 <b>Birthday Tomorrow!</b>\n\n`;
      message += `<b>${name}</b>`;
      if (nickname) {
        message += ` (${nickname})`;
      }
      message += `'s birthday is TOMORROW (${monthDay})!\n\n`;
    } else if (daysUntil <= 7) {
      message = `🎂 <b>Birthday Coming Up!</b>\n\n`;
      message += `<b>${name}</b>`;
      if (nickname) {
        message += ` (${nickname})`;
      }
      message += `'s birthday is on ${monthDay} - in ${daysUntil} days\n\n`;
    } else {
      message = `🎂 <b>Birthday Reminder!</b>\n\n`;
      message += `<b>${name}</b>`;
      if (nickname) {
        message += ` (${nickname})`;
      }
      message += `'s birthday is coming up on ${monthDay} (in ${daysUntil} days)\n\n`;
    }

    if (relationship) {
      message += `👤 <b>Relationship:</b> ${relationship}\n`;
    }

    if (interests) {
      message += `🎨 <b>Interests:</b> ${interests}\n`;
    }

    if (daysUntil === 0) {
      message += `\n🎊 Reach out and make their day special! 🎉`;
    } else if (daysUntil <= 7) {
      message += `\n⏰ Plenty of time to plan something special! 🎉`;
    } else {
      message += `\n💝 Don't forget to wish them a happy birthday! 🎉`;
    }

    await this.sendMessage(message);
  }

  /**
   * Check if Telegram is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
