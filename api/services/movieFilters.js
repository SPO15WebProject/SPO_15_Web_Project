/* Muodostetaan TMDB:n suodatusparametrit. */
export const getMovieFilters = (query) => {

  const filters = {}

  // Lukee käyttäjän valitsemat suodattimet.
  const { year, rating, sortBy } = query

  // Tarkistaa julkaisuvuoden..
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

  // Palautettaa suodatusparametrit.
  return filters
}