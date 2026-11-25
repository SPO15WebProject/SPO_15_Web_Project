import { beforeEach, describe, expect, test, vi } from "vitest";
import { addGroupMember, removeGroupMember, deleteGroup } from "../controllers/groupController.js";
import { findGroupById, insertMember, findMember, deleteMember, deleteGroupById, countAdmins, countMembers } from "../models/groupModel.js";

// Tietokantatoiminnot mockattuna jotta testit eivät muuta tietokannan tietoja.
vi.mock('../models/groupModel.js', () => ({
    findGroupById: vi.fn(),
    insertMember: vi.fn(),
    findMember: vi.fn(),
    deleteMember: vi.fn(),
    deleteGroupById: vi.fn(),
    countAdmins: vi.fn(),
    countMembers: vi.fn()
}))

describe('Ryhmien käyttöoikeudet', () => {
    let res

    beforeEach(() => {
        vi.resetAllMocks()

        // mockReturnThis mahdollistaa res.status - .json -ketjun
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        }
    })

    test('liittää kirjautuneen käyttäjän avoimeen ryhmään', async () => {
        const req = {
            user: { userid: 7 },
            body: {
                groupId: 5,
                // Pyynnön lähettäjä yrittää antaa erin käyttäjän id:n
                userId: 99
            }
        }

        const savedMember = {
            groupid: 5,
            userid: 7,
            isadmin: false
        }

        findGroupById.mockResolvedValueOnce({
            groupid: 5,
            inviteonly: false
        })
        insertMember.mockResolvedValueOnce(savedMember)

        await addGroupMember(req, res)

        // Tallennuksessa käytetään kirjautumisen tunnistetta
        expect(insertMember).toHaveBeenCalledOnce()
        expect(insertMember).toHaveBeenCalledWith(5, 7)
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(savedMember)
    })

    test('estää suoran liittymisen suljettuun ryhmään', async () => {
        const req = {
            user: { userid: 7 },
            body: { groupId: 5 }
        }

        findGroupById.mockResolvedValueOnce({
            groupid: 5,
            inviteonly: true
        })

        await addGroupMember(req, res)

        expect(res.status).toHaveBeenCalledWith(403)

        // Estetty pyyntö ei saa lisätä jäsenyyttä
        expect(insertMember).not.toHaveBeenCalled()
    })

    test('estää toisen jäsenen poistamisen väärennetyllä admin tunnisteella', async () => {
        const req = {
            user: { userid: 7 },
            body: {
                groupId: 5,
                userId: 8,
                requesterId: 99
            }
        }

        // käyttäjä 99 on admin, kirjautunut käyttäjä 7 on tavallinen jäsen
        findMember.mockImplementation(async (groupId, userId) => ({
            groupid: groupId,
            userid: userId,
            isadmin: userId === 99
        }))

        await removeGroupMember(req, res)

        // oikeudet tarkistetaan kirjautuneelta käyttäjältä
        expect(findMember).toHaveBeenCalledWith(5, 7)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(deleteMember).not.toHaveBeenCalled()
        expect(deleteGroupById).not.toHaveBeenCalled()
    })

    test('estää ryhmän poistamisen väärennetyllä ylläpitäjän tunnisteella', async () => {
        const req = {
            user: { userid: 7 },
            params: { groupId: '5' },
            body: { requesterId: 99 }
        }

        findGroupById.mockResolvedValueOnce({ groupid: 5 })

        // vain pyynnön rungossa annettu käyttäjä 99 olisi admin
        findMember.mockImplementation(async (groupId, userId) => ({
            groupid: groupId,
            userid: userId,
            isadmin: userId === 99
        }))

        await deleteGroup(req, res)

        expect(findMember).toHaveBeenCalledWith('5', 7)
        expect(res.status).toHaveBeenCalledWith(403)
        expect(deleteGroupById).not.toHaveBeenCalled()
    })

    test('sallii adminin poistaa tavallisen jäsenen', async () => {
        const req = {
            user: { userid: 7 },
            body: { groupId: 5, userId: 8 }
        }

        // ensimmäinen haku koskee tekijää, toinen poistettavaa jäsentä
        findMember
            .mockResolvedValueOnce({ userid: 7, isadmin: true })
            .mockResolvedValueOnce({ userid: 8, isadmin: false })

        await removeGroupMember(req, res)

        expect(findMember).toHaveBeenCalledWith(5, 7)
        expect(findMember).toHaveBeenCalledWith(5, 8)
        expect(deleteMember).toHaveBeenCalledOnce()
        expect(deleteMember).toHaveBeenCalledWith(5, 8)
        expect(deleteGroupById).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('sallii tavallisen jäsenen poistua ryhmästä', async () => {
        const req = {
            user: { userid: 7 },
            body: { groupId: 5, userId: 7 }
        }

        // tekijä ja poistettava jäsen ovat sama tavallinen käyttäjä
        findMember.mockResolvedValue({
            groupid: 5,
            userid: 7,
            isadmin: false
        })

        await removeGroupMember(req, res)

        expect(deleteMember).toHaveBeenCalledOnce()
        expect(deleteMember).toHaveBeenCalledWith(5, 7)
        expect(deleteGroupById).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('sallii adminin poistaa oman ryhmän', async () => {
        const req = {
            user: { userid: 7 },
            params: { groupId: '5' }
        }

        findGroupById.mockResolvedValueOnce({ groupid: 5 })
        findMember.mockResolvedValueOnce({
            groupid: 5,
            userid: 7,
            isadmin: true
        })

        await deleteGroup(req, res)

        // admin-status tarkistetaan poistettavan ryhmän jäsenyydestä
        expect(findMember).toHaveBeenCalledWith('5', 7)
        expect(deleteGroupById).toHaveBeenCalledOnce()
        expect(deleteGroupById).toHaveBeenCalledWith('5')
        expect(res.status).toHaveBeenCalledWith(200)
    })

    test('estää viimeisen adminin poistumisen kun muita jäseniä jää ryhmään', async () => {
        const req = {
            user: { userid: 7 },
            body: { groupId: 5, userId: 7 }
        }

        findMember.mockResolvedValue({
            groupid: 5,
            userid: 7,
            isadmin: true
        })

        // ryhmässä on yksi admin ja yksi muu jäsen
        countAdmins.mockResolvedValueOnce(1)
        countMembers.mockResolvedValueOnce(2)

        await removeGroupMember(req, res)

        expect(res.status).toHaveBeenCalledWith(409)
        expect(deleteMember).not.toHaveBeenCalled()
        expect(deleteGroupById).not.toHaveBeenCalled()
    })

    test('poistaa ryhmän kun sen ainoa jäsen ja admin poistuu', async () => {
        const req = {
            user: { userid: 7 },
            body: { groupId: 5, userId: 7 }
        }

        findMember.mockResolvedValue({
            groupid: 5,
            userid: 7,
            isadmin: true
        })

        // ryhmästä poistuva käyttäjä on ainoa jäsen (admin)
        countAdmins.mockResolvedValueOnce(1)
        countMembers.mockResolvedValueOnce(1)

        await removeGroupMember(req, res)

        expect(deleteGroupById).toHaveBeenCalledOnce()
        expect(deleteGroupById).toHaveBeenCalledWith(5)
        expect(deleteMember).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
    })
})