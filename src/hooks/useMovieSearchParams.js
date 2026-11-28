import { useLocation, useSearchParams } from 'react-router-dom'

// Luetaan ja tarkistetaan URL-osoitteen hakutiedot.
export default function useMovieSearchParams() {

  const [searchParams] = useSearchParams()
  const { key: historyKey } = useLocation()

  // Luetaan hakusana ja muut hakutiedot.
  const query = searchParams.get('query') || ''
  const genre = searchParams.get('genre') || ''
  const country = searchParams.get('country') || ''
  const language = searchParams.get('language') || ''

  const requestedType = searchParams.get('type')

  // Valitaan kelvollinen hakutapa.
  const type = ['genre', 'actor', 'country', 'language']
    .includes(requestedType)
    ? requestedType
    : 'movie'

  let validationError = null

  // Tarkistetaan maa- ja kielikoodit.
  if (
    (country && !/^[A-Z]{2}$/.test(country)) ||
    (language && !/^[a-z]{2}$/.test(language)) ||
    (type === 'country' && !country) ||
    (type === 'language' && !language)
  ) {
    validationError = 'Valitse kelvollinen maa tai kieli.'
  }

  // Genrehaussa tarvitaan genren tunniste.
  else if (type === 'genre' && !genre) {
    validationError = 'Valitse genre hakukentästä.'
  }

  // Nimi- ja näyttelijähaussa tarvitaan hakusana.
  else if (['movie', 'actor'].includes(type) && !query.trim()) {
    validationError = 'Kirjoita elokuvan tai näyttelijän nimi hakukenttään.'
  }

  // Erotetaan uusi haku aikaisemmasta selaushistorian hausta.
  const searchKey =
    `${historyKey}:${type}:${query}:${genre}:${country}:${language}`

  return {
    query,
    type,
    genre,
    country,
    language,
    searchKey,
    validationError
  }
}

// Muodostetaan hakutulosten otsikko hakutavan perusteella.
export function getSearchTitle({ query, type, genre, filters }) {

  if (type === 'country' || type === 'language') {

    const isCountry = type === 'country'

    const names = new Intl.DisplayNames(['fi'], {
      type: isCountry ? 'region' : 'language'
    })

    const code = isCountry
      ? filters.country
      : filters.language

    return `Hakutulokset: ${names.of(code)}`
  }

  if (type === 'genre') {
    return `Genre: ${query || genre}`
  }

  if (type === 'actor') {
    return `Näyttelijän ${query} elokuvat`
  }

  return `Hakutulokset: ${query}`
}