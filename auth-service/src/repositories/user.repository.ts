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

export const findUserByEmail = async(email:string): Promise<User | null> => {
    const result = await db.query<User>(
        `SELECT * FROM users WHERE email = $1`,
        [email.toLowerCase()]
    )
    return result.rows[0] || null;
}

export const findUserById = async(id:string):Promise<User | null> => {
    const result = await db.query<User>(
        `SELECT * FROM Users WHERE id = $1`,
        [id]
    )
    return result.rows[0] || null;
}