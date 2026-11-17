/* Muodostetaan TMDB:n suodatusparametrit. */
export const getMovieFilters = (query) => {

  const filters = {}

  // Lukee käyttäjän valitsemat suodattimet.
  const { year, rating, sortBy } = query

  // Tarkistaa julkaisuvuoden.
  if (year) {
    const releaseYear = Number(year)

    if (!Number.isInteger(releaseYear) || releaseYear < 1900) {
      throw new Error('Virheellinen julkaisuvuosi')
    }

    filters.primary_release_year = releaseYear
  }

  // Tarkistaa vähimmäisarvosanan.
  if (rating) {
    const minRating = Number(rating)

    if (!Number.isFinite(minRating) || minRating < 0 || minRating > 10) {
      throw new Error('Virheellinen arvosana')
    }

    filters['vote_average.gte'] = minRating
  }

  // Sallitut järjestystavat.
  const allowedSorts = [
    'popularity.desc',
    'vote_average.desc',
    'primary_release_date.desc',
    'primary_release_date.asc'
  ]

  // Tarkistaa valitun järjestystavan.
  if (sortBy) {
    if (!allowedSorts.includes(sortBy)) {
      throw new Error('Virheellinen järjestystapa')
    }

    filters.sort_by = sortBy
  }

  // Palautetaan suodatusparametrit.
  return filters
}


/* Suodatetaan nimihaun elokuvat arvosanan perusteella. */
export const filterMoviesByRating = (movies, filters) => {

  // Luetaan käyttäjän valitsema vähimmäisarvosana.
  const minRating = filters['vote_average.gte']

  // Jos arvosanaa ei ole valittu, palautetaan kaikki elokuvat.
  if (minRating === undefined) {
    return movies
  }

  // Palautetaan vain vähimmäisarvosanan täyttävät elokuvat.
  return movies.filter(
    movie => movie.vote_average >= minRating
  )
}


/* Järjestetään nimihaun elokuvat valitulla tavalla. */
export const sortMovies = (movies, filters) => {

  // Luetaan käyttäjän valitsema järjestystapa.
  const sortBy = filters.sort_by

  // Jos järjestystapaa ei ole valittu,
  // säilytetään TMDB:n alkuperäinen järjestys.
  if (!sortBy) {
    return movies
  }

  // Luodaan kopio elokuvista, jotta alkuperäinen lista ei muutu.
  return [...movies].sort((a, b) => {

    switch (sortBy) {

      // Suosituimmat elokuvat ensin.
      case 'popularity.desc':
        return (b.popularity || 0) - (a.popularity || 0)

      // Parhaat arvosanat ensin.
      case 'vote_average.desc':
        return (b.vote_average || 0) - (a.vote_average || 0)

      // Uusimmat elokuvat ensin.
      case 'primary_release_date.desc':
        return (b.release_date || '').localeCompare(
          a.release_date || ''
        )

      // Vanhimmat elokuvat ensin.
      case 'primary_release_date.asc':

        // Jos molemmilta puuttuu julkaisupäivä,
        // säilytetään niiden keskinäinen järjestys.
        if (!a.release_date && !b.release_date) return 0

        // Siirretään puuttuvat julkaisupäivät listan loppuun.
        if (!a.release_date) return 1
        if (!b.release_date) return -1

        return a.release_date.localeCompare(b.release_date)

      // Säilytetään alkuperäinen järjestys.
      default:
        return 0
    }
  })
}