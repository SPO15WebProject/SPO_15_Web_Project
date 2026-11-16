import { expect, test, vi } from 'vitest'
import { CreateGroup } from '../controllers/groupController.js'
import { insertGroup } from '../models/groupModel.js'

// Mockataan ryhmän tallennus jotta se ei mene tietokantaan

vi.mock('../models/groupModel.js', () => ({
    insertGroup: vi.fn()
}))

test('käyttää kirjautuneen käyttäjän ID:tä ryhmän perustajana', async () => {
    const req = {
        // Middleware asettaa tunnisteen kirjautumisevästeestä.
        user: { userid: 7 },
        body: {
            groupName: 'Test group',
            groupDescription: 'Test description',
            inviteOnly: true,
            creatorId: 99
        }
    }

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    }

    insertGroup.mockResolvedValueOnce({ groupid: 10 })

    await CreateGroup(req, res)

    expect(insertGroup).toHaveBeenCalledWith(
        'Test group',
        'Test description',
        true,
        7
    )
    expect(res.status).toHaveBeenCalledWith(201)
})