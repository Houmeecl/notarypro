// server/types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  platform?: string;
  createdAt: Date;
  updatedAt?: Date;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      fullName: string;
      role: string;
      platform?: string;
      createdAt: Date;
      updatedAt?: Date;
    }
  }
}