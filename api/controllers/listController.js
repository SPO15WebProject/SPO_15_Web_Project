import {
    insertList,
    findAllLists,
    findListById,
    findListsByUser,
    findListsByGroup,
    updateListById,
    deleteListById,
    findListMovies,
    insertListEntry,
    deleteListEntry,
    findListGroups,
    insertGroupList,
    deleteGroupList
} from "../models/listModel.js";
import { findGroupById, findMember } from "../models/groupModel.js";

const toId = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// Tarkista omistaako käyttäjä listan
const getOwnedList = async (listId, userId, res) => {
    const list = await findListById(listId);
    if (!list) {
        res.status(404).json({ error: 'List not found' });
        return null;
    }
    if (String(list.userid) !== String(userId)) {
        res.status(403).json({ error: 'You can only modify your own lists' });
        return null;
    }
    return list;
};

// POST /CreateList (auth) body: { listName, listDescription? }
export const CreateList = async (req, res) => {
    const userId = req.user.userid;
    const { listName: rawName, listDescription: rawDescription } = req.body ?? {};

    const listName = typeof rawName === 'string' ? rawName.trim() : '';

    if (!listName || listName.length > 50) {
        return res.status(400).json({ error: 'Give the list a name (1-50 characters).' });
    }
    if (rawDescription != null && typeof rawDescription !== 'string') {
        return res.status(400).json({ error: 'Description must be text.' });
    }

    const listDescription = rawDescription?.trim() || null;

    try {
        const list = await insertList(userId, listName, listDescription);
        res.status(201).json(list);
    } catch (error) {
        // 23503 = viiteavainvirhe, käyttäjää ei löydy
        if (error.code === '23503') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error creating list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetAllLists
export const GetAllLists = async (req, res) => {
    try {
        const lists = await findAllLists();
        res.status(200).json(lists);
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetListById/:listId 
export const GetListById = async (req, res) => {
    const listId = toId(req.params.listId);
    if (!listId) {
        return res.status(400).json({ error: 'Invalid list id' });
    }

    try {
        const list = await findListById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        const [movies, groups] = await Promise.all([
            findListMovies(listId),
            findListGroups(listId)
        ]);
        res.status(200).json({ ...list, movies, groups });
    } catch (error) {
        console.error('Error fetching list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetListsByUser/:userId
export const GetListsByUser = async (req, res) => {
    const userId = toId(req.params.userId);
    if (!userId) {
        return res.status(400).json({ error: 'Invalid user id' });
    }

    try {
        const lists = await findListsByUser(userId);
        res.status(200).json(lists);
    } catch (error) {
        console.error('Error fetching user lists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetListsByGroup/:groupId
export const GetListsByGroup = async (req, res) => {
    const groupId = toId(req.params.groupId);
    if (!groupId) {
        return res.status(400).json({ error: 'Invalid group id' });
    }

    try {
        const lists = await findListsByGroup(groupId);
        res.status(200).json(lists);
    } catch (error) {
        console.error('Error fetching group lists:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /UpdateList/:listId (auth) body: { listName?, listDescription? }
export const UpdateList = async (req, res) => {
    const listId = toId(req.params.listId);
    const { listName: rawName, listDescription: rawDescription } = req.body ?? {};

    if (!listId) {
        return res.status(400).json({ error: 'Invalid list id' });
    }
    if (rawName === undefined && rawDescription === undefined) {
        return res.status(400).json({ error: 'Provide listName and/or listDescription to update' });
    }

    let listName = null;
    if (rawName !== undefined) {
        listName = typeof rawName === 'string' ? rawName.trim() : '';
        if (!listName || listName.length > 50) {
            return res.status(400).json({ error: 'List name must be 1-50 characters.' });
        }
    }

    let listDescription = null;
    if (rawDescription !== undefined) {
        if (typeof rawDescription !== 'string') {
            return res.status(400).json({ error: 'Description must be text.' });
        }
        listDescription = rawDescription.trim();
    }

    try {
        const list = await getOwnedList(listId, req.user.userid, res);
        if (!list) return;

        const updated = await updateListById(listId, listName, listDescription);
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /DeleteList/:listId (auth)
export const DeleteList = async (req, res) => {
    const listId = toId(req.params.listId);

    if (!listId) {
        return res.status(400).json({ error: 'Invalid list id' });
    }

    try {
        const list = await getOwnedList(listId, req.user.userid, res);
        if (!list) return;

        await deleteListById(listId);
        res.status(200).json({ success: true, message: 'List deleted' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /AddMovieToList (auth) body: { listId, movieId }
export const AddMovieToList = async (req, res) => {
    const listId = toId(req.body?.listId);
    const movieId = toId(req.body?.movieId);

    if (!listId || !movieId) {
        return res.status(400).json({ error: 'listId and movieId must be positive integers' });
    }

    try {
        const list = await getOwnedList(listId, req.user.userid, res);
        if (!list) return;

        const entry = await insertListEntry(listId, movieId);
        res.status(201).json(entry);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Movie is already in this list' });
        }
        console.error('Error adding movie to list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /RemoveMovieFromList/:listId/:movieId (auth)
export const RemoveMovieFromList = async (req, res) => {
    const listId = toId(req.params.listId);
    const movieId = toId(req.params.movieId);

    if (!listId || !movieId) {
        return res.status(400).json({ error: 'Invalid list or movie id' });
    }

    try {
        const list = await getOwnedList(listId, req.user.userid, res);
        if (!list) return;

        const removed = await deleteListEntry(listId, movieId);
        if (!removed) {
            return res.status(404).json({ error: 'Movie is not in this list' });
        }
        res.status(200).json({ success: true, message: 'Movie removed from list' });
    } catch (error) {
        console.error('Error removing movie from list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /AddListToGroup (auth) body: { listId, groupId }
export const AddListToGroup = async (req, res) => {
    const userId = req.user.userid;
    const listId = toId(req.body?.listId);
    const groupId = toId(req.body?.groupId);

    if (!listId || !groupId) {
        return res.status(400).json({ error: 'listId and groupId must be positive integers' });
    }

    try {
        const list = await getOwnedList(listId, userId, res);
        if (!list) return;

        const group = await findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const member = await findMember(groupId, userId);
        if (!member) {
            return res.status(403).json({ error: 'You must be a member of the group to share a list in it' });
        }

        const link = await insertGroupList(listId, groupId);
        res.status(201).json(link);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'List is already shared in this group' });
        }
        console.error('Error adding list to group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /RemoveListFromGroup/:listId/:groupId (auth)
export const RemoveListFromGroup = async (req, res) => {
    const userId = req.user.userid;
    const listId = toId(req.params.listId);
    const groupId = toId(req.params.groupId);

    if (!listId || !groupId) {
        return res.status(400).json({ error: 'Invalid list or group id' });
    }

    try {
        const list = await findListById(listId);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        const isOwner = String(list.userid) === String(userId);
        const member = await findMember(groupId, userId);
        const isGroupAdmin = member?.isadmin === true;

        if (!isOwner && !isGroupAdmin) {
            return res.status(403).json({ error: 'Only the list owner or a group admin can remove it from the group' });
        }

        const removed = await deleteGroupList(listId, groupId);
        if (!removed) {
            return res.status(404).json({ error: 'List is not shared in this group' });
        }
        res.status(200).json({ success: true, message: 'List removed from group' });
    } catch (error) {
        console.error('Error removing list from group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};