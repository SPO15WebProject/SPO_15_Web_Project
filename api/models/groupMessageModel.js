import { pool } from "./db.js";

export const insertMessage = async (groupId, userId, content) => {
    const result = await pool.query(
        `INSERT INTO GroupMessages (groupId, userId, content)
         VALUES ($1, $2, $3)
         RETURNING messageId, groupId, userId, content, createdAt`,
        [groupId, userId, content]
    );
    return result.rows[0];
};

export const findMessageById = async (messageId) => {
    const result = await pool.query(
        'SELECT * FROM GroupMessages WHERE messageId = $1',
        [messageId]
    );
    return result.rows[0] ?? null;
};

export const findMessagesByGroup = async (groupId, limit = 50, before = null) => {
    const result = await pool.query(
        `SELECT m.messageId, m.groupId, m.userId, u.nickname, m.content, m.createdAt
         FROM GroupMessages m
         LEFT JOIN Users u ON u.userId = m.userId
         WHERE m.groupId = $1
           AND ($3::int IS NULL OR m.messageId < $3)
         ORDER BY m.messageId DESC
         LIMIT $2`,
        [groupId, limit, before]
    );
    return result.rows;
};

export const deleteMessageById = async (messageId) => {
    const result = await pool.query(
        'DELETE FROM GroupMessages WHERE messageId = $1 RETURNING messageId',
        [messageId]
    );
    return result.rows[0] ?? null;
};