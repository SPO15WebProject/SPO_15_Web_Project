import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import express from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import dbRoutes from '../routes/dbRoutes.js'
import { pool } from '../models/db.js'

// mockataan tietokantayhteys, jotta testi ei käytä tietokantaa
vi.mock('../models/db.js', () => ({
    pool: {
        query: vi.fn(),
        connect: vi.fn()
    }
}))

// käytetään oikeita reittejä ja samaa evästeiden käsittelyä kuin sovelluksessa
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/db', dbRoutes)

// testeissä käytetään omaa avainta tokenien varmistamiseen
const testJwtSecret = 'group-auth-test-secret'

beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('JWT_SECRET', testJwtSecret)
})

afterEach(() => {
    // palautetaan muuttujan alkuperäinen arvo
    vi.unstubAllEnvs()
})

// sama kirjautumisvaatimus tarkistetaan kaikilta kolmelta routelta
test.each([
    ['post', '/api/db/AddGroupMember'],
    ['delete', '/api/db/RemoveGroupMember'],
    ['delete', '/api/db/DeleteGroup/5']
])('estää kirjautumattoman pyynnön: %s %s', async (method, path) => {
    const res = await request(app)[method](path).send({
        groupId: 5,
        userId: 7,
        requesterId: 99
    })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
        error: 'Kirjautuminen vaaditaan.'
    })

    // pyyntö pysäytetään ennen tietokantatoimintoja
    expect(pool.query).not.toHaveBeenCalled()
    expect(pool.connect).not.toHaveBeenCalled()
})

test.each([
    ['virheellisen', 'invalid-token'],
    ['vanhentuneen', jwt.sign(
        { userid: 7 },
        testJwtSecret,
        { expiresIn: -1 }
    )]
])('estää %s tokenin käytön', async (description, token) => {
    const res = await request(app)
        .post('/api/db/AddGroupMember')
        .set('Cookie', `token=${token}`)
        .send({ groupId: 5 })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
        error: 'Virheellinen token'
    })
    expect(pool.query).not.toHaveBeenCalled()
    expect(pool.connect).not.toHaveBeenCalled()
})

test('sallii voimassa olevan tokenin ja käyttää sen käyttäjätunnistetta', async () => {
    const token = jwt.sign(
        { userid: 7 },
        testJwtSecret,
        { expiresIn: '5m' }
    )

    const savedMember = {
        groupid: 5,
        userid: 7,
        isadmin: false
    }

    // ensimmäinen kysely hakee ryhmän, toinen tallentaa jäsenyyden
    pool.query
        .mockResolvedValueOnce({
            rows: [{ groupid: 5, inviteonly: false }]
        })
        .mockResolvedValueOnce({
            rows: [savedMember]
        })

    const res = await request(app)
        .post('/api/db/AddGroupMember')
        .set('Cookie', `token=${token}`)
        .send({ groupId: 5, userId: 99 })

    expect(res.status).toBe(201)
    expect(res.body).toEqual(savedMember)

    // tallennukseen menee tokenin käyttäjä (id)7 tavallisena jäsenenä
    expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        [5, 7, false]
    )
})