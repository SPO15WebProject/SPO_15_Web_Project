import { Router } from 'express'
import { getMovie, getMovieLogo, getPopularMovies, getTrendingMovies, searchMovies } from '../controllers/movieController.js'

const router = Router()

router.get('/popular', getPopularMovies)
router.get('/trending', getTrendingMovies)
router.get('/search', searchMovies)
router.get('/:id', getMovie)
router.get('/:id/logo', getMovieLogo)

export default router

