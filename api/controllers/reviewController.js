import {
    insertReview,
    findAllReviews,
    findReviewById,
    findReviewsByMovie,
    findReviewsByUser,
    getMovieRatingSummary,
    updateReviewById,
    deleteReviewById
} from "../models/reviewModel.js";

const toId = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
};

const isValidStars = (stars) => Number.isInteger(stars) && stars >= 0 && stars <= 10;

// POST /CreateReview body: { movieId, stars, text }
export const createReview = async (req, res) => {
    const userId = req.user.userid;
    const { movieId, stars, text } = req.body ?? {};
 
    if (!movieId || stars === undefined) {
        return res.status(400).json({ error: 'movieId and stars are required' });
    }
    if (!toId(movieId)) {
        return res.status(400).json({ error: 'movieId must be a positive integer' });
    }
    if (!isValidStars(Number(stars))) {
        return res.status(400).json({ error: 'stars must be an integer between 0 and 10' });
    }
 
    try {
        const review = await insertReview(userId, toId(movieId), Number(stars), text);
        res.status(201).json(review);
    } catch (error) {
        // 23503 = foreign_key_violation (user does not exist)
        if (error.code === '23503') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetAllReviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await findAllReviews();
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetReviewById/:reviewId
export const getReviewById = async (req, res) => {
    const id = toId(req.params.reviewId);
    if (!id) {
        return res.status(400).json({ error: 'Invalid review id' });
    }

    try {
        const review = await findReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetReviewsByMovie/:movieId
export const getReviewsByMovie = async (req, res) => {
    const movieId = toId(req.params.movieId);
    if (!movieId) {
        return res.status(400).json({ error: 'Invalid movie id' });
    }

    try {
        const [reviews, summary] = await Promise.all([
            findReviewsByMovie(movieId),
            getMovieRatingSummary(movieId)
        ]);
        res.status(200).json({ movieId, ...summary, reviews });
    } catch (error) {
        console.error('Error fetching movie reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetReviewsByUser/:userId
export const getReviewsByUser = async (req, res) => {
    const userId = toId(req.params.userId);
    if (!userId) {
        return res.status(400).json({ error: 'Invalid user id' });
    }

    try {
        const reviews = await findReviewsByUser(userId);
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /UpdateReview/:reviewId body: { stars, text }
export const updateReview = async (req, res) => {
    const id = toId(req.params.reviewId);
    const requesterId = req.user.userid;
    const { stars, text } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Invalid review id' });
    }
    if (!requesterId) {
        return res.status(400).json({ error: 'requesterId is required' });
    }
    if (stars === undefined && text === undefined) {
        return res.status(400).json({ error: 'Provide stars and/or text to update' });
    }
    if (stars !== undefined && !isValidStars(Number(stars))) {
        return res.status(400).json({ error: 'stars must be an integer between 1 and 5' });
    }

    try {
        const review = await findReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (String(review.userid) !== String(requesterId)) {
            return res.status(403).json({ error: 'You can only edit your own reviews' });
        }

        const updated = await updateReviewById(
            id,
            stars !== undefined ? Number(stars) : null,
            text
        );
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /DeleteReview/:reviewId
export const deleteReview = async (req, res) => {
    const id = toId(req.params.reviewId);
    const requesterId = req.user.userid;

    if (!id) {
        return res.status(400).json({ error: 'Invalid review id' });
    }
    if (!requesterId) {
        return res.status(400).json({ error: 'requesterId is required' });
    }

    try {
        const review = await findReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (String(review.userid) !== String(requesterId)) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        await deleteReviewById(id);
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};