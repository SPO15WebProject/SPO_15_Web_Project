import { afterEach, describe, expect, test, vi } from 'vitest'
import axios from 'axios'
import { getMovie } from '../controllers/movieController.js'

afterEach(() => {
    vi.restoreAllMocks()
})

describe('movieController testit', () => {
    test('palauttaa elokuvan tiedot ja julistepolun', async () => {
        const mockData = {
            id: 7,
            title: 'Testielokuva',
            poster_path: '/test-poster.jpg'
        }
        
        //mockattu GET-pyyntö palauttaa testitiedot
        const mockedGet = vi.fn().mockResolvedValueOnce({
            data: mockData
        })

        //korvataan axios jotta oikeaa TMDB-pyyntöä ei tehdä
        vi.spyOn(axios, 'create').mockReturnValue({
            get: mockedGet
        })

        const req = {
            params: { id: '7' }
        }

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }

        await getMovie(req, res)

        // tarkistetaan elokuva ja frontendille lähetettävä data
        expect(mockedGet).toHaveBeenCalledWith('/movie/7', {
            params: {
                language: 'fi-FI',
                append_to_response: 'credits'
            }
        })
        expect(res.json).toHaveBeenCalledWith(mockData)
    })

    test('palauttaa error 500 kun TMDB pyyntö epäonnistuu', async () => {
        const mockedGet = vi.fn().mockRejectedValueOnce(
            new Error('Network error')
        )

        vi.spyOn(axios, 'create').mockReturnValue({
            get: mockedGet
        })

        const req = {
            params: { id: '7' }
        }

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }

        await getMovie(req, res)

        // tarkistetaan tilakoodi ja palautettu virheviesti
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            message: 'Network error'
        })
    })
})