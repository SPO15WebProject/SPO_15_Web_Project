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
  getGenres,
  searchMoviesByOrigin,
  getCountries,
  getLanguages
} from '../controllers/searchController.js'

const router = Router()

// Suosituimmat elokuvat
router.get('/popular', getPopularMovies)

// Trendaavat elokuvat
router.get('/trending', getTrendingMovies)

// Elokuvan hakeminen nimellä
router.get('/search', searchMovies)

// Elokuvien hakeminen näyttelijän nimellä
router.get('/search/actor', searchMoviesByActor)

// Elokuvien hakeminen genren perusteella
router.get('/search/genre', searchMoviesByGenre)

// Haetaan elokuvien genrelista
router.get('/genres', getGenres)

// Elokuvien hakeminen alkuperämaan tai kielen perusteella
router.get('/search/origin', searchMoviesByOrigin)

// Haetaan maiden valintalista
router.get('/countries', getCountries)

// Haetaan kielten valintalista
router.get('/languages', getLanguages)

// Yksittäisen elokuvan tiedot
router.get('/:id', getMovie)

// Yksittäisen elokuvan logo
router.get('/:id/logo', getMovieLogo)

export default router