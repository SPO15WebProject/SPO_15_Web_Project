import { pool } from "./db.js";

const listSelect = `
    SELECT l.listId, l.userId, u.nickname, l.listName, l.listDescription
    FROM Lists l
    LEFT JOIN Users u ON u.userId = l.userId
`;

export const insertList = async (userId, listName, listDescription) => {
    const result = await pool.query(
        `INSERT INTO Lists (userId, listName, listDescription)
         VALUES ($1, $2, $3)
         RETURNING listId, userId, listName, listDescription`,
        [userId, listName, listDescription]
    );
    return result.rows[0];
};

export const findAllLists = async () => {
    const result = await pool.query(
        `SELECT l.listId, l.userId, u.nickname, l.listName, l.listDescription,
                COUNT(le.movieId)::int AS movieCount
         FROM Lists l
         LEFT JOIN Users u ON u.userId = l.userId
         LEFT JOIN ListEntries le ON le.listId = l.listId
         GROUP BY l.listId, u.nickname
         ORDER BY l.listId`
    );
    return result.rows;
};

export const findListById = async (listId) => {
    const result = await pool.query(`${listSelect} WHERE l.listId = $1`, [listId]);
    return result.rows[0] ?? null;
};

export const findListsByUser = async (userId) => {
    const result = await pool.query(
        `SELECT l.listId, l.userId, u.nickname, l.listName, l.listDescription,
                COUNT(le.movieId)::int AS movieCount
         FROM Lists l
         LEFT JOIN Users u ON u.userId = l.userId
         LEFT JOIN ListEntries le ON le.listId = l.listId
         WHERE l.userId = $1
         GROUP BY l.listId, u.nickname
         ORDER BY l.listId`,
        [userId]
    );
    return result.rows;
};

export const findListsByGroup = async (groupId) => {
    const result = await pool.query(
        `SELECT l.listId, l.userId, u.nickname, l.listName, l.listDescription,
                COUNT(le.movieId)::int AS movieCount
         FROM GroupList gl
         JOIN Lists l ON l.listId = gl.listId
         LEFT JOIN Users u ON u.userId = l.userId
         LEFT JOIN ListEntries le ON le.listId = l.listId
         WHERE gl.groupId = $1
         GROUP BY l.listId, u.nickname
         ORDER BY l.listId`,
        [groupId]
    );
    return result.rows;
};

export const updateListById = async (listId, listName, listDescription) => {
    const result = await pool.query(
        `UPDATE Lists
         SET listName        = COALESCE($1, listName),
             listDescription = COALESCE($2, listDescription)
         WHERE listId = $3
         RETURNING listId, userId, listName, listDescription`,
        [listName ?? null, listDescription ?? null, listId]
    );
    return result.rows[0] ?? null;
};

export const deleteListById = async (listId) => {
    const result = await pool.query(
        'DELETE FROM Lists WHERE listId = $1 RETURNING listId',
        [listId]
    );
    return result.rows[0] ?? null;
};

export const findListMovies = async (listId) => {
    const result = await pool.query(
        'SELECT movieId FROM ListEntries WHERE listId = $1 ORDER BY movieId',
        [listId]
    );
    return result.rows.map((row) => row.movieid);
};

export const insertListEntry = async (listId, movieId) => {
    const result = await pool.query(
        `INSERT INTO ListEntries (listId, movieId)
         VALUES ($1, $2)
         RETURNING listId, movieId`,
        [listId, movieId]
    );
    return result.rows[0];
};

export const deleteListEntry = async (listId, movieId) => {
    const result = await pool.query(
        `DELETE FROM ListEntries WHERE listId = $1 AND movieId = $2
         RETURNING listId, movieId`,
        [listId, movieId]
    );
    return result.rows[0] ?? null;
};


export const findListGroups = async (listId) => {
    const result = await pool.query(
        `SELECT g.groupId, g.groupName
         FROM GroupList gl
         JOIN Groups g ON g.groupId = gl.groupId
         WHERE gl.listId = $1
         ORDER BY g.groupName`,
        [listId]
    );
    return result.rows;
};

export const insertGroupList = async (listId, groupId) => {
    const result = await pool.query(
        `INSERT INTO GroupList (listId, groupId)
         VALUES ($1, $2)
         RETURNING listId, groupId`,
        [listId, groupId]
    );
    return result.rows[0];
};

export const deleteGroupList = async (listId, groupId) => {
    const result = await pool.query(
        `DELETE FROM GroupList WHERE listId = $1 AND groupId = $2
         RETURNING listId, groupId`,
        [listId, groupId]
    );
    return result.rows[0] ?? null;
};