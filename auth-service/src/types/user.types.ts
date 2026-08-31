export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' 
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}