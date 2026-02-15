import TelegramBot from 'node-telegram-bot-api';
import { log } from '@botman/logger';

export class TelegramNotifier {
  private bot: TelegramBot | null = null;
  private chatId: string;
  private enabled = false;

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

    // Initialize bot with polling enabled to receive messages
    try {
      this.bot = new TelegramBot(botToken, { polling: true });
      this.enabled = true;
      log.info('📱 Telegram bot initialized with message listening enabled');
      log.info(`✅ Bot token: ${botToken.substring(0, 10)}...`);
      log.info(`✅ Chat ID: ${this.chatId}`);

      // Set up message listener
      this.setupMessageListener();
    } catch (error) {
      log.error('❌ Failed to initialize Telegram bot', error);
      this.enabled = false;
    }
  }

  /**
   * Set up listener for incoming Telegram messages
   */
  private setupMessageListener(): void {
    if (!this.bot) return;

    // Listen for any text messages
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const username = msg.from?.username || msg.from?.first_name || 'Unknown';
      const firstName = msg.from?.first_name || 'there';
      const text = msg.text || '';

      // Log the incoming message
      log.info('📩 Incoming Telegram message:', {
        chatId,
        userId,
        username,
        text,
        timestamp: new Date(msg.date * 1000).toISOString()
      });

      // Handle "Hello Sam" greeting
      if (text.toLowerCase().includes('hello sam')) {
        const greeting = this.getTimeBasedGreeting(firstName);
        await this.bot?.sendMessage(chatId, greeting);
        log.info(`📤 Sent greeting: ${greeting}`);
      }
    });

    // Listen for polling errors
    this.bot.on('polling_error', (error) => {
      log.error('❌ Telegram polling error:', error);
    });

    log.info('👂 Telegram message listener active');
  }

  /**
   * Get time-based greeting based on current hour in Edmonton/Mountain time
   */
  private getTimeBasedGreeting(name: string): string {
    // Get current time in America/Edmonton timezone
    const edmontonTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/Edmonton',
      hour: 'numeric',
      hour12: false
    });
    const hour = parseInt(edmontonTime);

    if (hour >= 5 && hour < 12) {
      return `Good morning ${name}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon ${name}`;
    } else {
      return `Good evening ${name}`;
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
  async sendStartupNotification(upcomingBirthdays?: Array<{
    name: string;
    nickname?: string;
    date: string;
    daysUntil: number;
  }>, birthdayCount?: number): Promise<void> {
    let message = `🎂 <b>Samantha Birthday Assistant</b>

✅ Service started successfully
🚀 Ready to track birthdays`;

    if (birthdayCount !== undefined && birthdayCount > 0) {
      message += `\n👥 Tracking ${birthdayCount} ${birthdayCount === 1 ? 'person' : 'people'}`;
    }

    message += `\n\nI'll notify you about upcoming birthdays every day! 🎉`;

    // Add upcoming birthdays if provided (max 5)
    if (upcomingBirthdays && upcomingBirthdays.length > 0) {
      message += `\n\n📅 <b>Upcoming Birthdays:</b>\n`;

      const birthdaysToShow = upcomingBirthdays.slice(0, 5);
      for (const birthday of birthdaysToShow) {
        const name = birthday.nickname
          ? `${birthday.name} (${birthday.nickname})`
          : birthday.name;

        if (birthday.daysUntil === 0) {
          message += `\n🎉 <b>${name}</b> - TODAY! ${birthday.date}`;
        } else if (birthday.daysUntil === 1) {
          message += `\n⭐ <b>${name}</b> - Tomorrow ${birthday.date}`;
        } else {
          message += `\n• ${name} - ${birthday.date} (in ${birthday.daysUntil} days)`;
        }
      }

      if (upcomingBirthdays.length > 5) {
        message += `\n\n...and ${upcomingBirthdays.length - 5} more`;
      }
    }

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
