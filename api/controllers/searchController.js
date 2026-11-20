import { tmdb } from '../services/tmdbConnection.js'
import {
  getMovieFilters,
  filterMoviesByRating,
  sortMovies
} from '../services/movieFilters.js'

// Nimihaun suodatuksen enimmäissivumäärä TMDB:ssä.
const MAX_SEARCH_PAGES = 10

// Frontendille palautettavien elokuvien määrä sivulla.
const PAGE_SIZE = 20

/* Haetaan elokuvia nimen perusteella, sivu kerrallaan. */
export const searchMovies = async (req, res) => {
  try {
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    if (!query) {
      return res.status(400).json({
        message: 'Hakusana puuttuu'
      })
    }

    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    const params = {
      query,
      language: 'fi-FI',
      page
    }

    if (filters.primary_release_year) {
      params.primary_release_year = filters.primary_release_year
    }

    const hasRatingFilter =
      filters['vote_average.gte'] !== undefined

    const hasSorting = Boolean(filters.sort_by)

    if (!hasRatingFilter && !hasSorting) {
      const { data } = await tmdb().get('/search/movie', {
        params
      })

      return res.json({
        results: data.results,
        page: data.page,
        total_pages: data.total_pages
      })
    }

    const { data: firstPage } = await tmdb().get('/search/movie', {
      params: {
        ...params,
        page: 1
      }
    })

    const pagesToFetch = Math.min(
      firstPage.total_pages,
      MAX_SEARCH_PAGES
    )

    const movies = [...firstPage.results]

    for (let currentPage = 2; currentPage <= pagesToFetch; currentPage++) {
      const { data } = await tmdb().get('/search/movie', {
        params: {
          ...params,
          page: currentPage
        }
      })

      movies.push(...data.results)
    }

    const uniqueMovies = [
      ...new Map(
        movies.map(movie => [movie.id, movie])
      ).values()
    ]

    const filteredMovies = filterMoviesByRating(
      uniqueMovies,
      filters
    )

    const sortedMovies = sortMovies(
      filteredMovies,
      filters
    )

    const totalPages = Math.ceil(
      sortedMovies.length / PAGE_SIZE
    )

    const startIndex = (page - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE

    res.json({
      results: sortedMovies.slice(startIndex, endIndex),
      page,
      total_pages: totalPages,
      total_results: sortedMovies.length,
      truncated: firstPage.total_pages > MAX_SEARCH_PAGES
    })

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia näyttelijän nimen perusteella, sivu kerrallaan. */
export const searchMoviesByActor = async (req, res) => {
  try {
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    if (!query) {
      return res.status(400).json({
        message: 'Näyttelijän nimi puuttuu'
      })
    }

    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    const { data: peopleData } = await tmdb().get('/search/person', {
      params: {
        query,
        language: 'fi-FI',
        page: 1
      }
    })

    const actor = peopleData.results.find(
      person => person.known_for_department === 'Acting'
    )

    if (!actor) {
      return res.json({
        results: [],
        page: 1,
        total_pages: 0
      })
    }

    const { data: movieData } = await tmdb().get('/discover/movie', {
      params: {
        with_cast: actor.id,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

    res.json({
      results: movieData.results,
      page: movieData.page,
      total_pages: movieData.total_pages
    })

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Näyttelijän elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia yhden tai useamman genren perusteella. */
export const searchMoviesByGenre = async (req, res) => {
  try {
    const genre = String(req.query.genre || '')
    const page = Number(req.query.page || 1)

    // Esimerkiksi 28,35 tarkoittaa toimintaa ja komediaa.
    const genreIds = genre.split(',')

    // Jokaisen genren pitää olla positiivinen kokonaisluku.
    if (
      !genre ||
      genreIds.some(id => !/^[1-9]\d*$/.test(id))
    ) {
      return res.status(400).json({
        message: 'Virheellinen genre'
      })
    }

    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Yksi genre lähetetään numerona vanhan toiminnan säilyttämiseksi.
    // Useat genret lähetetään pilkuilla erotettuna merkkijonona.
    const selectedGenres =
      genreIds.length === 1 ? Number(genreIds[0]) : genre

    const { data } = await tmdb().get('/discover/movie', {
      params: {
        with_genres: selectedGenres,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

    res.json({
      results: data.results,
      page: data.page,
      total_pages: data.total_pages
    })

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genren elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvien genret TMDB:stä. */
export const getGenres = async (req, res) => {
  try {
    const { data } = await tmdb().get('/genre/movie/list', {
      params: {
        language: 'fi'
      }
    })

    res.json(data.genres)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genrejen hakeminen epäonnistui'
    })
  }
}