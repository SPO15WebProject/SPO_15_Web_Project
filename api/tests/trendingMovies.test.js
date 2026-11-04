import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Simuloidaan TMDB:n vastaukset ilman oikeaa API-yhteyttä.
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

import { getTrendingMovies } from '../controllers/movieController.js'

describe('Trendaavien elokuvien hakeminen', () => {
  let req
  let res
  let mockGet

  beforeEach(() => {
    vi.clearAllMocks()

    mockGet = vi.fn()
    axios.create.mockReturnValue({ get: mockGet })

    req = {}

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
  })

  it('palauttaa viikon trendaavat elokuvat', async () => {
    const movies = [
      { id: 1, title: 'Elokuva 1' },
      { id: 2, title: 'Elokuva 2' }
    ]

    mockGet.mockResolvedValue({
      data: { results: movies }
    })

    await getTrendingMovies(req, res)

    expect(mockGet).toHaveBeenCalledWith('/trending/movie/week', {
      params: { language: 'fi-FI' }
    })

    expect(res.json).toHaveBeenCalledWith(movies)
  })

  it('palauttaa virheilmoituksen, jos TMDB-haku epäonnistuu', async () => {
    mockGet.mockRejectedValue({
      response: { status: 503 }
    })

    await getTrendingMovies(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Trendaavien elokuvien hakeminen epäonnistui'
    })
  })
})