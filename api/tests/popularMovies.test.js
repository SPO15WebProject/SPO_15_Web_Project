
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Simuloidaan TMDB:n vastaukset ilman oikeaa API-yhteyttä.
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

import { getPopularMovies } from '../controllers/movieController.js'

describe('Suosittujen elokuvien hakeminen', () => {
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

  it('palauttaa suositut elokuvat', async () => {
    const movies = [
      { id: 1, title: 'Elokuva 1' },
      { id: 2, title: 'Elokuva 2' }
    ]

    mockGet.mockResolvedValue({
      data: { results: movies }
    })

    await getPopularMovies(req, res)

    expect(mockGet).toHaveBeenCalledWith('/movie/popular', {
      params: {
        language: 'fi-FI',
        page: 1
      }
    })

    expect(res.json).toHaveBeenCalledWith(movies)
  })

  it('palauttaa virheilmoituksen, jos TMDB-haku epäonnistuu', async () => {
    mockGet.mockRejectedValue({
      response: { status: 503 }
    })

    await getPopularMovies(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Elokuvien hakeminen epäonnistui'
    })
  })
})
