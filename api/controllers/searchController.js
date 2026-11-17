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

    // Tarkistetaan hakusana.
    if (!query) {
      return res.status(400).json({
        message: 'Hakusana puuttuu'
      })
    }

    // Tarkistetaan sivunumero.
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    // Tarkistetaan ja muodostetaan suodatusparametrit.
    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Muodostetaan nimihaun parametrit.
    const params = {
      query,
      language: 'fi-FI',
      page
    }

    // Lisätään julkaisuvuosi, jos käyttäjä on valinnut sen.
    if (filters.primary_release_year) {
      params.primary_release_year = filters.primary_release_year
    }

    // Tarkistetaan, onko arvosanan suodatus käytössä.
    const hasRatingFilter =
      filters['vote_average.gte'] !== undefined

    // Tarkistetaan, onko järjestystapa valittu.
    const hasSorting = Boolean(filters.sort_by)

    // Jos arvosanaa tai järjestystapaa ei ole valittu,
    // käytetään normaalia TMDB:n sivutusta.
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

    // Haetaan ensimmäinen sivu käsiteltävistä elokuvista.
    const { data: firstPage } = await tmdb().get('/search/movie', {
      params: {
        ...params,
        page: 1
      }
    })

    // Rajoitetaan TMDB:stä haettavien sivujen määrää.
    const pagesToFetch = Math.min(
      firstPage.total_pages,
      MAX_SEARCH_PAGES
    )

    // Kerätään ensimmäisen sivun elokuvat.
    const movies = [...firstPage.results]

    // Haetaan loput sivut sallittuun rajaan asti.
    for (let currentPage = 2; currentPage <= pagesToFetch; currentPage++) {

      const { data } = await tmdb().get('/search/movie', {
        params: {
          ...params,
          page: currentPage
        }
      })

      movies.push(...data.results)
    }

    // Poistetaan mahdolliset päällekkäiset elokuvat.
    const uniqueMovies = [
      ...new Map(
        movies.map(movie => [movie.id, movie])
      ).values()
    ]

    // Suodatetaan elokuvat arvosanan perusteella.
    const filteredMovies = filterMoviesByRating(
      uniqueMovies,
      filters
    )

    // Järjestetään suodatetut elokuvat ennen sivutusta.
    const sortedMovies = sortMovies(
      filteredMovies,
      filters
    )

    // Lasketaan tulosten sivumäärä.
    const totalPages = Math.ceil(
      sortedMovies.length / PAGE_SIZE
    )

    // Lasketaan pyydetyn sivun alku- ja loppukohta.
    const startIndex = (page - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE

    // Palautetaan vain pyydetyn sivun elokuvat.
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
    // Luetaan näyttelijän nimi ja haluttu sivunumero.
    const query = req.query.query?.trim()
    const page = Number(req.query.page || 1)

    // Tarkistetaan, että käyttäjä antoi nimen.
    if (!query) {
      return res.status(400).json({
        message: 'Näyttelijän nimi puuttuu'
      })
    }

    // Tarkistetaan, että sivunumero on kelvollinen.
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    // Tarkistetaan ja muodostetaan suodatusparametrit.
    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Etsitään näyttelijä TMDB:stä nimen perusteella.
    const { data: peopleData } = await tmdb().get('/search/person', {
      params: {
        query,
        language: 'fi-FI',
        page: 1
      }
    })

    // Valitaan ensimmäinen näyttelijäksi luokiteltu osuma.
    const actor = peopleData.results.find(
      person => person.known_for_department === 'Acting'
    )

    // Jos näyttelijää ei löydy, palautetaan tyhjät tulokset
    // samassa muodossa kuin onnistuneessa haussa.
    if (!actor) {
      return res.json({
        results: [],
        page: 1,
        total_pages: 0
      })
    }

    // Haetaan haluttu sivu näyttelijän elokuvista.
    const { data: movieData } = await tmdb().get('/discover/movie', {
      params: {
        with_cast: actor.id,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

    // Palautetaan elokuvat ja sivutustiedot frontendille.
    res.json({
      results: movieData.results,
      page: movieData.page,
      total_pages: movieData.total_pages
    })

  } catch (err) {
    // Ilmoitetaan virheestä, jos TMDB-haku epäonnistuu.
    res.status(err.response?.status || 500).json({
      message: 'Näyttelijän elokuvien hakeminen epäonnistui'
    })
  }
}


/* Haetaan elokuvia genren perusteella, sivu kerrallaan. */
export const searchMoviesByGenre = async (req, res) => {
  try {
    // Luetaan genren tunniste ja haluttu sivunumero.
    const genre = Number(req.query.genre)
    const page = Number(req.query.page || 1)

    // Tarkistetaan genren tunniste.
    if (!Number.isInteger(genre) || genre < 1) {
      return res.status(400).json({
        message: 'Virheellinen genre'
      })
    }

    // Tarkistetaan sivunumero.
    if (!Number.isInteger(page) || page < 1 || page > 500) {
      return res.status(400).json({
        message: 'Virheellinen sivunumero'
      })
    }

    // Tarkistetaan ja muodostetaan suodatusparametrit.
    let filters

    try {
      filters = getMovieFilters(req.query)
    } catch (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    // Haetaan valitun genren elokuvat TMDB:stä.
    const { data } = await tmdb().get('/discover/movie', {
      params: {
        with_genres: genre,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page,
        ...filters
      }
    })

    // Palautetaan elokuvat ja sivutustiedot frontendille.
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
    // Haetaan genrelista suomenkielisillä nimillä.
    const { data } = await tmdb().get('/genre/movie/list', {
      params: {
        language: 'fi'
      }
    })

    // Palautetaan genret frontendille.
    res.json(data.genres)

  } catch (err) {
    res.status(err.response?.status || 500).json({
      message: 'Genrejen hakeminen epäonnistui'
    })
  }
}