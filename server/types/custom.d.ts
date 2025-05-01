import { User } from "@shared/schema";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends User {}
  }
  
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        storeName?: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}