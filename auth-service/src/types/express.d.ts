
import { User } from "./user.types.ts";

declare global {
  namespace Express {
    interface Request {
      // This allows us to safely attach the user object in our middleware
      user?: Omit<User, 'password_hash'>; 
    }
  }
}