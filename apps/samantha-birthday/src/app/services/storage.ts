import * as fs from 'fs/promises';
import * as path from 'path';
import { Birthday, CreateBirthdayInput, UpdateBirthdayInput } from '../types/birthday';
import { randomUUID } from 'crypto';

export class BirthdayStorage {
  private dataPath: string;
  private birthdays: Map<string, Birthday>;

  constructor(dataDir?: string) {
    const baseDir = dataDir || process.env.DATA_DIR || './data';
    this.dataPath = path.join(baseDir, 'birthdays.json');
    this.birthdays = new Map();
  }

  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });

      // Try to load existing data
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(data) as Birthday[];

      // Load into Map
      parsed.forEach((birthday) => {
        this.birthdays.set(birthday.id, birthday);
      });
    } catch (error: any) {
      // If file doesn't exist, start with empty data
      if (error.code === 'ENOENT') {
        this.birthdays = new Map();
        await this.save();
      } else {
        throw error;
      }
    }
  }

  private async save(): Promise<void> {
    const data = Array.from(this.birthdays.values());
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAll(): Promise<Birthday[]> {
    return Array.from(this.birthdays.values());
  }

  async getById(id: string): Promise<Birthday | undefined> {
    return this.birthdays.get(id);
  }

  async create(input: CreateBirthdayInput): Promise<Birthday> {
    const birthday: Birthday = {
      id: randomUUID(),
      ...input,
    };

    this.birthdays.set(birthday.id, birthday);
    await this.save();

    return birthday;
  }

  async update(id: string, input: UpdateBirthdayInput): Promise<Birthday | undefined> {
    const existing = this.birthdays.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Birthday = {
      ...existing,
      ...input,
    };

    this.birthdays.set(id, updated);
    await this.save();

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.birthdays.delete(id);
    if (existed) {
      await this.save();
    }
    return existed;
  }

  async findByEmail(email: string): Promise<Birthday | undefined> {
    return Array.from(this.birthdays.values()).find(
      (birthday) => birthday.email === email
    );
  }

  async getUpcomingBirthdays(days = 30): Promise<Birthday[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return Array.from(this.birthdays.values()).filter((birthday) => {
      const birthDate = new Date(birthday.date_of_birth);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );

      return thisYearBirthday >= today && thisYearBirthday <= futureDate;
    });
  }
}
