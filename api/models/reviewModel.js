import { pool } from "./db.js";

export const insertReview = async (userId, movieId, stars, text) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'INSERT INTO Movies (movieId) VALUES ($1) ON CONFLICT DO NOTHING',
            [movieId]
        );
        const result = await client.query(
            `INSERT INTO Reviews (userId, movieId, stars, text)
             VALUES ($1, $2, $3, $4)
             RETURNING id, userId, movieId, stars, text, createdAt`,
            [userId, movieId, stars, text ?? null]
        );
        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const reviewSelect = `
    SELECT r.id, r.userId, u.nickname, r.movieId, r.stars, r.text, r.createdAt
    FROM Reviews r
    LEFT JOIN Users u ON u.userId = r.userId
`;

export const findAllReviews = async () => {
    const result = await pool.query(`${reviewSelect} ORDER BY r.createdAt DESC`);
    return result.rows;
};

export const findReviewById = async (id) => {
    const result = await pool.query(`${reviewSelect} WHERE r.id = $1`, [id]);
    return result.rows[0] ?? null;
};

export const findReviewsByMovie = async (movieId) => {
    const result = await pool.query(
        `${reviewSelect} WHERE r.movieId = $1 ORDER BY r.createdAt DESC`,
        [movieId]
    );
    return result.rows;
};

export const findReviewsByUser = async (userId) => {
    const result = await pool.query(
        `${reviewSelect} WHERE r.userId = $1 ORDER BY r.createdAt DESC`,
        [userId]
    );
    return result.rows;
};

export const getMovieRatingSummary = async (movieId) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS reviewCount,
                ROUND(AVG(stars)::numeric, 2)::float AS averageStars
         FROM Reviews WHERE movieId = $1`,
        [movieId]
    );
    return result.rows[0];
};

export const updateReviewById = async (id, stars, text) => {
    const result = await pool.query(
        `UPDATE Reviews
         SET stars = COALESCE($1, stars),
             text  = COALESCE($2, text)
         WHERE id = $3
         RETURNING id, userId, movieId, stars, text, createdAt`,
        [stars ?? null, text ?? null, id]
    );
    return result.rows[0] ?? null;
};

export const deleteReviewById = async (id) => {
    const result = await pool.query(
        'DELETE FROM Reviews WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows[0] ?? null;
};