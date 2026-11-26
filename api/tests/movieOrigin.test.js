import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchMoviesByOrigin } from '../controllers/searchController.js'
import { getMovieFilters } from '../services/movieFilters.js'
import axios from 'axios'

// Korvataan oikeat TMDB-kutsut mock-funktioilla.
vi.mock('axios', () => ({
  default: {
    create: vi.fn()
  }
}))

const get = vi.fn()

// Tyhjennetään mock-funktiot ennen jokaista testiä.
beforeEach(() => {
  vi.resetAllMocks()

  axios.create.mockReturnValue({
    get
  })
})

describe('Maa- ja kielihaku', () => {

  // Testataan maan ja kielen käyttäminen samassa haussa.
  it('yhdistää maa- ja kielisuodattimet', async () => {

    get.mockResolvedValue({
      data: {
        results: [],
        page: 2,
        total_pages: 3
      }
    })

    const res = {
      json: vi.fn(),
      status: vi.fn()
    }

    res.status.mockReturnValue(res)

    await searchMoviesByOrigin({
      query: {
        country: 'FI',
        language: 'fi',
        page: '2'
      }
    }, res)

    expect(get).toHaveBeenCalledWith('/discover/movie', {
      params: {
        language: 'fi-FI',
        sort_by: 'popularity.desc',
        page: 2,
        with_origin_country: 'FI',
        with_original_language: 'fi'
      }
    })

    expect(res.json).toHaveBeenCalledWith({
      results: [],
      page: 2,
      total_pages: 3
    })
  })

  // Testataan virheellisten maa- ja kielikoodien käsittely.
  it('hylkää virheelliset koodit', () => {

    expect(() =>
      getMovieFilters({
        country: 'Finland'
      })
    ).toThrow()

    expect(() =>
      getMovieFilters({
        language: 'Finnish'
      })
    ).toThrow()
  })
})