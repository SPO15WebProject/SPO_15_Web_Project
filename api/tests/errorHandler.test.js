import { describe, expect, test, vi } from 'vitest'
import errorHandler from '../middleware/errorHandler.js'

describe('error handler testit', () => {
    test('default to status 500 when no status is provided', () => {
        const error = new Error('something went wrong')

        const req = {}
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }
        const next = vi.fn()

        errorHandler(error, req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            error: {
                message: 'something went wrong',
                status: 500
            }
        })
    })
})