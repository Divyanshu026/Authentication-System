import db from "../config/db.js";
import { User } from "../types/user.types.js";

export const createUser = async(email:string, password_hash:string): Promise<User | undefined> => {
    const result = await db.query<User>(
        `INSERT INTO users (email,password_hash)
         VALUES ($1,$2)
         RETURNING *`,
         [email.toLowerCase(),password_hash]
    );
    return result.rows[0];
}

export const findUserByEmail = async(email:string): Promise<User> => {
    const result = await db.query<User>(
        `SELECT * FROM users WHERE email = $1`,
        [email.toLowerCase()]
    )
    return result.rows[0]!;
}

export const findUserById = async(id:string):Promise<User | null> => {
    const result = await db.query<User>(
        `SELECT * FROM users WHERE id = $1`,
        [id]
    )
    return result.rows[0] || null;
}

// update password
export const updatePassword = async(Id:string,newpassword_hash:string) : Promise<void> => {
     await db.query<User>(`
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      `,[newpassword_hash,Id])

}



export const verifyUserEmail = async (userId: string): Promise<void> => {
  await db.query(
    `UPDATE users SET is_verified = true,
    updated_at = NOW() WHERE id = $1`,
    [userId]
  );
};