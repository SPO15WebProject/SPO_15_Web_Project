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

export const findUserById = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM Users WHERE userId = $1',
        [userId]
    );
    return result.rows[0] ?? null;
};

export const deleteUserById = async (userId) => {
    const result = await pool.query(
        'DELETE FROM Users WHERE userId = $1 RETURNING userId',
        [userId]
    );
    return result.rows[0] ?? null;
};

export const updateUserEmail = async (userId, email) => {
    const result = await pool.query(
        `UPDATE Users SET email = $1 WHERE userId = $2
         RETURNING userId, nickname, email`,
        [email, userId]
    );
    return result.rows[0] ?? null;
};

export const updateUserNickname = async (userId, nickname) => {
    const result = await pool.query(
        `UPDATE Users SET nickname = $1 WHERE userId = $2
         RETURNING userId, nickname, email`,
        [nickname, userId]
    );
    return result.rows[0] ?? null;
};

export const updateUserPassword = async (userId, passwordHash) => {
    const result = await pool.query(
        `UPDATE Users SET passwordhash = $1 WHERE userId = $2
         RETURNING userId`,
        [passwordHash, userId]
    );
    return result.rows[0] ?? null;
};