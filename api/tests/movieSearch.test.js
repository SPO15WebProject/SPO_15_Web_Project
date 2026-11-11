import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Simuloidaan TMDB:n vastaukset ilman oikeaa API-yhteyttä.
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

import { searchMovies } from '../controllers/movieController.js'

describe('Elokuvien hakutoiminto', () => {
  let req
  let res
  let mockGet

  beforeEach(() => {
    vi.clearAllMocks()

    // Simuloidaan TMDB:n GET-pyyntö.
    mockGet = vi.fn()
    axios.create.mockReturnValue({ get: mockGet })

    // Simuloidaan Expressin vastaus.
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }

    req = {
      query: {}
    }
  })

  it('palauttaa elokuvia hakusanalla Titanic', async () => {
    req.query.query = 'Titanic'

    const movies = [
      { id: 597, title: 'Titanic' }
    ]

    mockGet.mockResolvedValue({
      data: {
        results: movies,
        page: 1,
        total_pages: 5
      }
    })

    await searchMovies(req, res)

    expect(mockGet).toHaveBeenCalledWith('/search/movie', {
      params: {
        query: 'Titanic',
        language: 'fi-FI',
        page: 1
      }
    })

    expect(res.json).toHaveBeenCalledWith({
      results: movies,
      page: 1,
      total_pages: 5
    })
  })

  it('palauttaa virheen, jos hakusana on tyhjä', async () => {
    req.query.query = '   '

    await searchMovies(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Hakusana puuttuu'
    })

    // Tyhjällä hakusanalla TMDB:tä ei kutsuta.
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('palauttaa tyhjän listan, jos elokuvia ei löydy', async () => {
    req.query.query = 'xyzabc123456789'

    mockGet.mockResolvedValue({
      data: {
        results: [],
        page: 1,
        total_pages: 0
      }
    })

    await searchMovies(req, res)

    expect(res.json).toHaveBeenCalledWith({
      results: [],
      page: 1,
      total_pages: 0
    })
  })

  it('palauttaa virheilmoituksen, jos TMDB-haku epäonnistuu', async () => {
    req.query.query = 'Titanic'

    mockGet.mockRejectedValue({
      response: { status: 503 }
    })

    await searchMovies(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  })
})