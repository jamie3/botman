export interface Birthday {
  id: string;
  name: string;
  nickname?: string;
  email?: string;
  date_of_birth: string; // ISO 8601 date format (YYYY-MM-DD)
  phone?: string;
  address?: string;
  relationship?: string;
  interests?: string;
  gender?: string;
}

export interface CreateBirthdayInput {
  name: string;
  nickname?: string;
  email?: string;
  date_of_birth: string;
  phone?: string;
  address?: string;
  relationship?: string;
  interests?: string;
  gender?: string;
}

export type UpdateBirthdayInput = Partial<CreateBirthdayInput>;
