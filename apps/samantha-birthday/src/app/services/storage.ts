import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Birthday, CreateBirthdayInput, UpdateBirthdayInput } from '../types/birthday';
import { randomUUID } from 'crypto';
import { log } from '@botman/logger';

export class BirthdayStorage {
  private client: MongoClient;
  private db!: Db;
  private collection!: Collection<Birthday>;
  private mongoUrl: string;
  private dbName: string;

  constructor() {
    this.mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    this.dbName = process.env.MONGO_DB_NAME || 'samantha';
    this.client = new MongoClient(this.mongoUrl);
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection<Birthday>('birthdays');

      // Create indexes
      await this.collection.createIndex({ email: 1 });
      await this.collection.createIndex({ name: 1 });

      log.info('💾 MongoDB connected successfully');
    } catch (error) {
      log.error('❌ Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async getAll(): Promise<Birthday[]> {
    const birthdays = await this.collection.find({}).sort({ name: 1 }).toArray();
    return birthdays;
  }

  async getById(id: string): Promise<Birthday | undefined> {
    const birthday = await this.collection.findOne({ id });
    return birthday || undefined;
  }

  async create(input: CreateBirthdayInput): Promise<Birthday> {
    const birthday: Birthday = {
      id: randomUUID(),
      ...input,
    };

    await this.collection.insertOne(birthday as any);
    return birthday;
  }

  async update(id: string, input: UpdateBirthdayInput): Promise<Birthday | undefined> {
    const existing = await this.getById(id);
    if (!existing) {
      return undefined;
    }

    const updated: Birthday = {
      ...existing,
      ...input,
    };

    await this.collection.updateOne(
      { id },
      { $set: updated }
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async findByEmail(email: string): Promise<Birthday | undefined> {
    const birthday = await this.collection.findOne({ email });
    return birthday || undefined;
  }

  async getUpcomingBirthdays(days = 30): Promise<Birthday[]> {
    // Get all birthdays and filter in JavaScript
    // MongoDB date handling for recurring birthdays is complex
    const allBirthdays = await this.getAll();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return allBirthdays.filter((birthday) => {
      const birthDate = new Date(birthday.date_of_birth);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
      );

      return thisYearBirthday >= today && thisYearBirthday <= futureDate;
    });
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
