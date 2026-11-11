import { Router } from 'express'

import {
  getMovie,
  getMovieLogo,
  getPopularMovies,
  getTrendingMovies,
  searchMovies,
  searchMoviesByActor
} from '../controllers/movieController.js'

const router = Router()

// Suosituimmat elokuvat
router.get('/popular', getPopularMovies)

// Trendaavat elokuvat
router.get('/trending', getTrendingMovies)

// Elokuvan hakeminen nimellä
router.get('/search', searchMovies)

// UUSI: Elokuvien hakeminen näyttelijän nimellä
router.get('/search/actor', searchMoviesByActor)

// Yksittäisen elokuvan tiedot
router.get('/:id', getMovie)

// Yksittäisen elokuvan logo
router.get('/:id/logo', getMovieLogo)

export default router