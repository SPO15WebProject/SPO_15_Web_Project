import { tmdb } from './tmdbConnection.js'
import {
  filterMoviesByRating,
  filterMoviesByGenres,
  sortMovies
} from './movieFilters.js'

// Nimihaun suodatuksen enimmäissivumäärä TMDB:ssä.
const MAX_SEARCH_PAGES = 10

// Frontendille palautettavien elokuvien määrä sivulla.
const PAGE_SIZE = 20

// Muodostetaan hakutulosten yhteinen vastausrakenne.
function formatResults(data) {
  return {
    results: data.results,
    page: data.page,
    total_pages: data.total_pages
  }
}

// Haetaan nimihakutulokset usealta sivulta.
async function fetchSearchPages(params) {
  const { data: firstPage } = await tmdb().get('/search/movie', {
    params: {
      ...params,
      page: 1
    }
  })

  // Rajoitetaan käsiteltävien sivujen määrää.
  const pagesToFetch = Math.min(
    firstPage.total_pages,
    MAX_SEARCH_PAGES
  )

  const movies = [...firstPage.results]

  // Haetaan loput käsiteltävät tulossivut.
  for (let page = 2; page <= pagesToFetch; page++) {
    const { data } = await tmdb().get('/search/movie', {
      params: {
        ...params,
        page
      }
    })

    movies.push(...data.results)
  }

  // Poistetaan mahdolliset samat elokuvat.
  const uniqueMovies = [
    ...new Map(
      movies.map(movie => [movie.id, movie])
    ).values()
  ]

  return {
    movies: uniqueMovies,
    truncated: firstPage.total_pages > MAX_SEARCH_PAGES
  }
}

// Suodatetaan elokuvat alkuperämaan perusteella.
async function filterMoviesByCountry(movies, country) {
  if (!country) return movies

  const matches = []

  // Haetaan tarkemmat tiedot viiden elokuvan erissä.
  for (let i = 0; i < movies.length; i += 5) {
    const batch = await Promise.all(
      movies.slice(i, i + 5).map(async movie => {
        const { data } = await tmdb().get(
          `/movie/${movie.id}`
        )

        // Palautetaan elokuva vain, jos alkuperämaa täsmää.
        return data.origin_country?.includes(country)
          ? movie
          : null
      })
    )

    matches.push(...batch.filter(Boolean))
  }

  return matches
}

// Jaetaan suodatetut hakutulokset sivuille.
function paginateMovies(movies, page, truncated) {
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  return {
    results: movies.slice(startIndex, endIndex),
    page,
    total_pages: Math.ceil(movies.length / PAGE_SIZE),
    total_results: movies.length,
    truncated
  }
}

// Haetaan elokuvia nimen perusteella.
export async function searchByName(query, page, filters) {
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

  // Ilman paikallista suodatusta haetaan suoraan pyydetty sivu.
  if (
    !hasRatingFilter &&
    !hasSorting &&
    !filters.with_origin_country &&
    !filters.with_original_language &&
    !filters.with_genres
  ) {
    const { data } = await tmdb().get('/search/movie', {
      params
    })

    return formatResults(data)
  }

  // Haetaan käsiteltävät nimihakutulokset.
  const { movies, truncated } = await fetchSearchPages(params)

  // Suodatetaan elokuvat alkuperäisen kielen perusteella.
  let matchingMovies = movies.filter(movie =>
    !filters.with_original_language ||
    movie.original_language === filters.with_original_language
  )

  // Suodatetaan elokuvat valittujen genrejen perusteella.
  matchingMovies = filterMoviesByGenres(
    matchingMovies,
    filters
  )

  // Suodatetaan tarvittaessa alkuperämaan perusteella.
  matchingMovies = await filterMoviesByCountry(
    matchingMovies,
    filters.with_origin_country
  )

  // Suodatetaan elokuvat arvosanan perusteella.
  const filteredMovies = filterMoviesByRating(
    matchingMovies,
    filters
  )

  // Järjestetään elokuvat valitulla tavalla.
  const sortedMovies = sortMovies(filteredMovies, filters)

  // Palautetaan pyydetty tulossivu.
  return paginateMovies(sortedMovies, page, truncated)
}

// Haetaan elokuvia TMDB:n discover-rajapinnasta.
async function discoverMovies(page, filters, searchParams = {}) {
  const { data } = await tmdb().get('/discover/movie', {
    params: {
      ...searchParams,
      language: 'fi-FI',
      sort_by: 'popularity.desc',
      page,
      ...filters
    }
  })

  return formatResults(data)
}

// Haetaan elokuvia näyttelijän nimen perusteella.
export async function searchByActor(query, page, filters) {
  const { data } = await tmdb().get('/search/person', {
    params: {
      query,
      language: 'fi-FI',
      page: 1
    }
  })

  // Etsitään hakutuloksista näyttelijä.
  const actor = data.results.find(
    person => person.known_for_department === 'Acting'
  )

  // Palautetaan tyhjä lista, jos näyttelijää ei löydy.
  if (!actor) {
    return {
      results: [],
      page: 1,
      total_pages: 0
    }
  }

  return discoverMovies(page, filters, {
    with_cast: actor.id
  })
}

// Haetaan elokuvia yhden tai useamman genren perusteella.
export async function searchByGenre(genres, page, filters) {

  // Yhdistetään alkuperäisen genrehaun genret
  // ja suodattimessa valitut genret.
  const combinedGenres = [
    ...new Set([
      ...String(genres).split(','),
      ...(filters.with_genres || '').split(',').filter(Boolean)
    ])
  ]

  // Säilytetään alkuperäiset genret ja lisätään uudet.
  return discoverMovies(page, {
    ...filters,
    with_genres: combinedGenres.length === 1
      ? Number(combinedGenres[0])
      : combinedGenres.join(',')
  })
}

// Haetaan elokuvia alkuperämaan tai kielen perusteella.
export async function searchByOrigin(page, filters) {
  return discoverMovies(page, filters)
}

// Haetaan elokuvien genrelista.
export async function fetchGenres() {
  const { data } = await tmdb().get('/genre/movie/list', {
    params: {
      language: 'fi'
    }
  })

  return data.genres
}

// Haetaan maiden valintalista.
export async function fetchCountries() {
  const { data } = await tmdb().get(
    '/configuration/countries'
  )

  return data
}

// Haetaan kielten valintalista.
export async function fetchLanguages() {
  const { data } = await tmdb().get(
    '/configuration/languages'
  )

  return data
}