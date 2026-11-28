import useMovieBrowse from './useMovieBrowse'

export default function useMovieFilters(country = '', language = '') {

  // Tallennetaan suodattimet selaustilaan.
  const [filters, setFilters] = useMovieBrowse('filters', {
    year: '',
    rating: '',
    sortBy: '',
    country,
    language,
    genres: []
  })

  // Tarkistetaan julkaisuvuoden kelvollisuus.
  const validYear =
    /^\d{4}$/.test(filters.year) &&
    Number(filters.year) >= 1900

  // Muodostetaan backendille lähetettävät suodattimet.
  const activeFilters = {
    ...filters,
    year: validYear ? filters.year : '',
    genres: [...(filters.genres || [])].sort().join(',')
  }

  return {
    filters,
    setFilters,
    activeFilters
  }
}