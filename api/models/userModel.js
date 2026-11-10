import { pool } from "./db.js";

export const findAllUsers = async () => {
    const result = await pool.query(
        'SELECT userId, nickname, email FROM Users'
    );
    return result.rows;
};

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM Users WHERE email = $1',
        [email]
    );
    return result.rows[0] ?? null;
};

export const insertUser = async (nickname, email, passwordHash) => {
    const result = await pool.query(
        `INSERT INTO Users (nickname, email, passwordhash)
         VALUES ($1, $2, $3)
         RETURNING userId, nickname, email`,
        [nickname, email, passwordHash]
    );
    return result.rows[0];
};