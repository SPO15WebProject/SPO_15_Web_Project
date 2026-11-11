import { pool } from "./db.js";

export const insertGroup = async (groupName, groupDescription, inviteOnly, creatorId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            `INSERT INTO Groups (groupName, groupDescription, inviteOnly)
             VALUES ($1, $2, $3)
             RETURNING groupId, groupName, groupDescription, inviteOnly`,
            [groupName, groupDescription ?? null, inviteOnly ?? false]
        );
        const group = groupResult.rows[0];
        await client.query(
            `INSERT INTO Group_members (groupId, userId, isAdmin)
             VALUES ($1, $2, TRUE)`,
            [group.groupid, creatorId]
        );
        await client.query('COMMIT');
        return group;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const findGroupById = async (groupId) => {
    const result = await pool.query(
        'SELECT * FROM Groups WHERE groupId = $1',
        [groupId]
    );
    return result.rows[0] ?? null;
};

export const findMember = async (groupId, userId) => {
    const result = await pool.query(
        'SELECT * FROM Group_members WHERE groupId = $1 AND userId = $2',
        [groupId, userId]
    );
    return result.rows[0] ?? null;
};

export const countAdmins = async (groupId) => {
    const result = await pool.query(
        'SELECT COUNT(*)::int AS count FROM Group_members WHERE groupId = $1 AND isAdmin = TRUE',
        [groupId]
    );
    return result.rows[0].count;
};

export const countMembers = async (groupId) => {
    const result = await pool.query(
        'SELECT COUNT(*)::int AS count FROM Group_members WHERE groupId = $1',
        [groupId]
    );
    return result.rows[0].count;
};

export const insertMember = async (groupId, userId, isAdmin = false) => {
    const result = await pool.query(
        `INSERT INTO Group_members (groupId, userId, isAdmin)
         VALUES ($1, $2, $3)
         RETURNING groupId, userId, isAdmin`,
        [groupId, userId, isAdmin]
    );
    return result.rows[0];
};

export const deleteMember = async (groupId, userId) => {
    const result = await pool.query(
        `DELETE FROM Group_members WHERE groupId = $1 AND userId = $2
         RETURNING groupId, userId`,
        [groupId, userId]
    );
    return result.rows[0] ?? null;
};

export const deleteGroupById = async (groupId) => {
    const result = await pool.query(
        'DELETE FROM Groups WHERE groupId = $1 RETURNING groupId',
        [groupId]
    );
    return result.rows[0] ?? null;
};

export const findAllGroups = async () => {
    const result = await pool.query(
        `SELECT g.groupId, g.groupName, g.groupDescription, g.inviteOnly,
                COUNT(gm.userId)::int AS memberCount
         FROM Groups g
         LEFT JOIN Group_members gm ON gm.groupId = g.groupId
         GROUP BY g.groupId
         ORDER BY g.groupId`
    );
    return result.rows;
};
 
export const findGroupMembers = async (groupId) => {
    const result = await pool.query(
        `SELECT u.userId, u.nickname, gm.isAdmin
         FROM Group_members gm
         JOIN Users u ON u.userId = gm.userId
         WHERE gm.groupId = $1
         ORDER BY gm.isAdmin DESC, u.nickname`,
        [groupId]
    );
    return result.rows;
};
 
