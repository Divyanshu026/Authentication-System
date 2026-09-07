import pool from '../config/db.js';

export interface VerificationToken {
  id: string;
  user_id: string;
  token_hash: string;
  type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';
  expires_at: Date;
  created_at: Date;
}

export const createToken = async (
  userId: string, 
  tokenHash: string, 
  type: string, 
  expiresAt: Date
): Promise<VerificationToken> => {
  const result = await pool.query<VerificationToken>(
    `INSERT INTO verification_tokens (user_id, token_hash, type, expires_at) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userId, tokenHash, type, expiresAt]
  );
  return result.rows[0]!;
};

export const findTokenByHash = async (
  tokenHash: string, 
  type: string
): Promise<VerificationToken | null> => {
  const result = await pool.query<VerificationToken>(
    `SELECT * FROM verification_tokens 
     WHERE token_hash = $1 AND type = $2`,
    [tokenHash, type]
  );
  return result.rows[0] || null;
};

export const deleteTokensByUserId = async (
  userId: string, 
  type: string
): Promise<void> => {
  await pool.query(
    `DELETE FROM verification_tokens 
     WHERE user_id = $1 AND type = $2`,
    [userId, type]
  );
};