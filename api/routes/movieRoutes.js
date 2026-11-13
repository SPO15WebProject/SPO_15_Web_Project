import { Router } from 'express'

import {
  getMovie,
  getMovieLogo,
  getPopularMovies,
  getTrendingMovies
} from '../controllers/movieController.js'

import {
  searchMovies,
  searchMoviesByActor,
  searchMoviesByGenre,
  getGenres
} from '../controllers/searchController.js'

const router = Router()

// Suosituimmat elokuvat
router.get('/popular', getPopularMovies)

// Trendaavat elokuvat
router.get('/trending', getTrendingMovies)

// Elokuvan hakeminen nimellä
router.get('/search', searchMovies)

// UUSI: Elokuvien hakeminen näyttelijän nimellä
router.get('/search/actor', searchMoviesByActor)

// Elokuvien hakeminen genren perusteella
router.get('/search/genre', searchMoviesByGenre)

// Haetaan elokuvien genrelista
router.get('/genres', getGenres)

// Yksittäisen elokuvan tiedot
router.get('/:id', getMovie)

// Yksittäisen elokuvan logo
router.get('/:id/logo', getMovieLogo)

export default router