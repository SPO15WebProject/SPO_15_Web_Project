import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  searchMoviesByGenre,
  getGenres
} from '../controllers/searchController.js'

// Korvataan oikeat TMDB-kutsut mock-funktioilla.
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

const mockGet = vi.fn()

// Luodaan Expressin response-objektia jäljittelevä mock.
const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  }

  res.status.mockReturnValue(res)

  return res
}

beforeEach(() => {
  vi.resetAllMocks()

  axios.create.mockReturnValue({
    get: mockGet
  })
})

describe('searchMoviesByGenre', () => {

  // Testataan onnistunut genrehaku.
  it('palauttaa valitun genren elokuvat', async () => {
    const movies = [
      { id: 1, title: 'Testielokuva', genre_ids: [28] }
    ]

    mockGet.mockResolvedValue({
      data: {
        results: movies,
        page: 1,
        total_pages: 5
      }
    })

    const req = {
      query: { genre: '28' }
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(mockGet).toHaveBeenCalledWith('/discover/movie', {
      params: {
        with_genres: 28,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page: 1
      }
    })

    expect(res.json).toHaveBeenCalledWith({
      results: movies,
      page: 1,
      total_pages: 5
    })
  })

  // Testataan genrehaun sivutus.
  it('hakee pyydetyn tulossivun', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [],
        page: 2,
        total_pages: 5
      }
    })

    const req = {
      query: { genre: '28', page: '2' }
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(mockGet).toHaveBeenCalledWith('/discover/movie', {
      params: {
        with_genres: 28,
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page: 2
      }
    })

    expect(res.json).toHaveBeenCalledWith({
      results: [],
      page: 2,
      total_pages: 5
    })
  })

  // Testataan virheellinen genretunniste.
  it('palauttaa virheen virheellisestä genretunnisteesta', async () => {
    const req = {
      query: { genre: 'abc' }
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(res.status).toHaveBeenCalledWith(400)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Virheellinen genre'
    })

    expect(mockGet).not.toHaveBeenCalled()
  })

  // Testataan puuttuva genretunniste.
  it('palauttaa virheen, jos genre puuttuu', async () => {
    const req = {
      query: {}
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(res.status).toHaveBeenCalledWith(400)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Virheellinen genre'
    })

    expect(mockGet).not.toHaveBeenCalled()
  })

  // Testataan virheellinen sivunumero.
  it('palauttaa virheen virheellisestä sivunumerosta', async () => {
    const req = {
      query: { genre: '28', page: '501' }
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(res.status).toHaveBeenCalledWith(400)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Virheellinen sivunumero'
    })

    expect(mockGet).not.toHaveBeenCalled()
  })

  // Testataan haku, joka ei palauta elokuvia.
  it('palauttaa tyhjän tuloslistan', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [],
        page: 1,
        total_pages: 0
      }
    })

    const req = {
      query: { genre: '28' }
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(res.json).toHaveBeenCalledWith({
      results: [],
      page: 1,
      total_pages: 0
    })
  })

  // Testataan TMDB:n virhetilanne.
  it('palauttaa virheen, jos TMDB-haku epäonnistuu', async () => {
    mockGet.mockRejectedValue({
      response: { status: 503 }
    })

    const req = {
      query: { genre: '28' }
    }

    const res = createResponse()

    await searchMoviesByGenre(req, res)

    expect(res.status).toHaveBeenCalledWith(503)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Genren elokuvien hakeminen epäonnistui'
    })
  })
})

describe('getGenres', () => {

  // Testataan genrelistan onnistunut hakeminen.
  it('palauttaa genrelistan', async () => {
    const genres = [
      { id: 28, name: 'Toiminta' },
      { id: 35, name: 'Komedia' }
    ]

    mockGet.mockResolvedValue({
      data: { genres }
    })

    const req = {}
    const res = createResponse()

    await getGenres(req, res)

    expect(mockGet).toHaveBeenCalledWith('/genre/movie/list', {
      params: {
        language: 'fi'
      }
    })

    expect(res.json).toHaveBeenCalledWith(genres)
  })

  // Testataan genrelistan hakemisen virhetilanne.
  it('palauttaa virheen, jos genrelistan hakeminen epäonnistuu', async () => {
    mockGet.mockRejectedValue({
      response: { status: 503 }
    })

    const req = {}
    const res = createResponse()

    await getGenres(req, res)

    expect(res.status).toHaveBeenCalledWith(503)

    expect(res.json).toHaveBeenCalledWith({
      message: 'Genrejen hakeminen epäonnistui'
    })
  })
})