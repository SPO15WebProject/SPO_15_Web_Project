import { beforeEach, describe, expect, test, vi } from "vitest"
import bcrypt from 'bcryptjs'
import { CreateUser } from '../controllers/userController.js'
import { insertUser } from '../models/userModel.js'

// mockatattu tietokantaan tallentaminen
vi.mock('../models/userModel.js', () => ({
    insertUser: vi.fn()
}))

describe('Käyttäjän rekisteröinti', () => {
    let res

    beforeEach(() => {
        insertUser.mockReset()
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }
    })

    test('hyväksyy kahdeksan merkin salasanan ja tallentaa sen tiivisteenä', async () => {
        const body = {
            nickname: 'Testikäyttäjä',
            email: 'test@example.com',
            password: 'Testi123'
        }
        const savedUser = {
            userid: 7,
            nickname: body.nickname,
            email: body.email
        }

        insertUser.mockResolvedValueOnce(savedUser)

        await CreateUser({ body }, res)

        // luetaan tietokantafunktioon annetut argumentit
        expect(insertUser).toHaveBeenCalledOnce()
        const [nickname, email, passwordHash] = insertUser.mock.calls[0]

        expect(nickname).toBe(body.nickname)
        expect(email).toBe(body.email)
        expect(await bcrypt.compare(body.password, passwordHash)).toBe(true)

        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(savedUser)
    })

    test('hylkää virheellisen salasanan ennen tallennusta', async () => {
        const body = {
            nickname: 'Testikäyttäjä',
            email: 'test@example.com',
            password: 'Testi12'
        }

        await CreateUser({ body }, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            error: 'Salasanan tulee olla vähintään 8 merkkiä pitkä'
        })
        expect(insertUser).not.toHaveBeenCalled()
    })
})