import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';
import { Birthday, CreateBirthdayInput, UpdateBirthdayInput } from '../types/birthday';
import { randomUUID } from 'crypto';

export class BirthdayStorage {
  private db: Database.Database;
  private dataPath: string;

  constructor(dataDir?: string) {
    const baseDir = dataDir || process.env.DATA_DIR || './data';
    this.dataPath = path.join(baseDir, 'birthdays.db');

    // Ensure directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    this.db = new Database(this.dataPath);
  }

  async initialize(): Promise<void> {
    // Create birthdays table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS birthdays (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nickname TEXT,
        date_of_birth TEXT NOT NULL,
        relationship TEXT,
        interests TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on email for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_birthdays_email ON birthdays(email)
    `);
  }

  async getAll(): Promise<Birthday[]> {
    const stmt = this.db.prepare('SELECT * FROM birthdays ORDER BY name');
    const rows = stmt.all() as Birthday[];
    return rows;
  }

  async getById(id: string): Promise<Birthday | undefined> {
    const stmt = this.db.prepare('SELECT * FROM birthdays WHERE id = ?');
    const row = stmt.get(id) as Birthday | undefined;
    return row;
  }

  async create(input: CreateBirthdayInput): Promise<Birthday> {
    const birthday: Birthday = {
      id: randomUUID(),
      ...input,
    };

    const stmt = this.db.prepare(`
      INSERT INTO birthdays (
        id, name, nickname, date_of_birth, relationship,
        interests, email, phone, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      birthday.id,
      birthday.name,
      birthday.nickname || null,
      birthday.date_of_birth,
      birthday.relationship || null,
      birthday.interests || null,
      birthday.email || null,
      birthday.phone || null,
      birthday.address || null
    );

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

    const stmt = this.db.prepare(`
      UPDATE birthdays
      SET name = ?, nickname = ?, date_of_birth = ?, relationship = ?,
          interests = ?, email = ?, phone = ?, address = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.nickname || null,
      updated.date_of_birth,
      updated.relationship || null,
      updated.interests || null,
      updated.email || null,
      updated.phone || null,
      updated.address || null,
      id
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM birthdays WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async findByEmail(email: string): Promise<Birthday | undefined> {
    const stmt = this.db.prepare('SELECT * FROM birthdays WHERE email = ?');
    const row = stmt.get(email) as Birthday | undefined;
    return row;
  }

  async getUpcomingBirthdays(days = 30): Promise<Birthday[]> {
    // Get all birthdays and filter in JavaScript for now
    // SQLite date handling for recurring birthdays is complex
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

  close(): void {
    this.db.close();
  }
}
