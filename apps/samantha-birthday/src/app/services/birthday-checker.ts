import { Birthday } from '../types/birthday';
import { log } from '@botman/logger';
import {
  startOfDay,
  differenceInDays,
  parseISO,
  format,
  setYear,
  isBefore,
  addYears,
} from 'date-fns';

export class BirthdayChecker {
  /**
   * Calculate days until a birthday
   */
  private getDaysUntilBirthday(dateOfBirth: string): number {
    const today = startOfDay(new Date());
    const birthDate = parseISO(dateOfBirth);

    // Get this year's birthday
    let thisYearBirthday = setYear(birthDate, today.getFullYear());

    // If birthday has already passed this year, get next year's birthday
    if (isBefore(thisYearBirthday, today)) {
      thisYearBirthday = addYears(thisYearBirthday, 1);
    }

    return differenceInDays(thisYearBirthday, today);
  }

  /**
   * Format a birthday notification message
   */
  private formatNotification(birthday: Birthday, daysUntil: number): string {
    const birthDate = parseISO(birthday.date_of_birth);
    const monthDay = format(birthDate, 'MMMM do');
    const dayOfWeek = format(
      setYear(birthDate, new Date().getFullYear()),
      'EEEE'
    );

    let message = '';

    if (daysUntil === 0) {
      // Same day birthday
      message = `🎂 BIRTHDAY TODAY! 🎂\n\n`;
      message += `It's ${birthday.name}`;
      if (birthday.nickname) {
        message += ` (${birthday.nickname})`;
      }
      message += `'s birthday TODAY!\n\n`;
    } else if (daysUntil === 1) {
      // Tomorrow's birthday
      message = `🎂 Birthday Tomorrow!\n\n`;
      message += `${birthday.name}`;
      if (birthday.nickname) {
        message += ` (${birthday.nickname})`;
      }
      message += `'s birthday is TOMORROW (${monthDay})!\n\n`;
    } else if (daysUntil <= 7) {
      // Within a week
      message = `🎂 Birthday Coming Up!\n\n`;
      message += `${birthday.name}`;
      if (birthday.nickname) {
        message += ` (${birthday.nickname})`;
      }
      message += `'s birthday is this ${dayOfWeek} (${monthDay}) - in ${daysUntil} days\n\n`;
    } else {
      // Standard reminder
      message = `🎂 Birthday Reminder!\n\n`;
      message += `${birthday.name}`;
      if (birthday.nickname) {
        message += ` (${birthday.nickname})`;
      }
      message += `'s birthday is coming up on ${monthDay} (in ${daysUntil} days)\n\n`;
    }

    // Add relationship if available
    if (birthday.relationship) {
      message += `Relationship: ${birthday.relationship}\n`;
    }

    // Add interests if available
    if (birthday.interests) {
      message += `Interests: ${birthday.interests}\n`;
    }

    // Add closing message
    if (daysUntil === 0) {
      message += `\nReach out and make their day special! 🎉🎊`;
    } else if (daysUntil <= 7) {
      message += `\nPlenty of time to plan something special! 🎉`;
    } else {
      message += `\nDon't forget to wish them a happy birthday! 🎉`;
    }

    return message;
  }

  /**
   * Check for upcoming birthdays and log notifications
   */
  async checkBirthdays(birthdays: Birthday[], notificationDays = 14): Promise<void> {
    const upcomingBirthdays: Array<{ birthday: Birthday; daysUntil: number }> = [];

    // Find all birthdays within the notification window
    for (const birthday of birthdays) {
      const daysUntil = this.getDaysUntilBirthday(birthday.date_of_birth);
      if (daysUntil >= 0 && daysUntil <= notificationDays) {
        upcomingBirthdays.push({ birthday, daysUntil });
      }
    }

    // Sort by days until birthday (closest first)
    upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcomingBirthdays.length === 0) {
      log.info('✨ No upcoming birthdays in the next 14 days');
      return;
    }

    log.info(`🎂 Found ${upcomingBirthdays.length} upcoming ${upcomingBirthdays.length === 1 ? 'birthday' : 'birthdays'}!`);

    // Log each birthday notification
    for (const { birthday, daysUntil } of upcomingBirthdays) {
      const notification = this.formatNotification(birthday, daysUntil);
      log.info('\n' + '='.repeat(60));
      log.info(notification);
      log.info('='.repeat(60));
    }
  }
}
