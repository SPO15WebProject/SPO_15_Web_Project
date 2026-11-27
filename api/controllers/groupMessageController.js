import {
    insertMessage,
    findMessageById,
    findMessagesByGroup,
    deleteMessageById
} from "../models/groupMessageModel.js";
import { findGroupById, findMember } from "../models/groupModel.js";

const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// POST /CreateGroupMessage body: { groupId, content }
export const createGroupMessage = async (req, res) => {
    const userId = req.user.userid;
    const groupId = Number(req.body?.groupId);
    const rawContent = req.body?.content;

    if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: 'groupId must be a positive integer' });
    }

    const content = typeof rawContent === 'string' ? rawContent.trim() : '';

    if (!content || content.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters.`
        });
    }

    try {
        const group = await findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Vain ryhmän jäsenet voivat kirjoittaa viestejä
        const member = await findMember(groupId, userId);
        if (!member) {
            return res.status(403).json({ error: 'Only group members can post messages' });
        }

        const message = await insertMessage(groupId, userId, content);
        res.status(201).json(message);
    } catch (error) {
        // 23503 = viiteavainvirhe
        if (error.code === '23503') {
            return res.status(404).json({ error: 'Group or user not found' });
        }
        console.error('Error creating group message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /GetGroupMessages/:groupId?limit=50&before=<messageId>
export const getGroupMessages = async (req, res) => {
    const userId = req.user.userid;
    const groupId = Number(req.params.groupId);

    if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({ error: 'groupId must be a positive integer' });
    }

    let limit = req.query.limit === undefined ? DEFAULT_LIMIT : Number(req.query.limit);
    if (!Number.isInteger(limit) || limit <= 0) {
        return res.status(400).json({ error: 'limit must be a positive integer' });
    }
    limit = Math.min(limit, MAX_LIMIT);

    let before = null;
    if (req.query.before !== undefined) {
        before = Number(req.query.before);
        if (!Number.isInteger(before) || before <= 0) {
            return res.status(400).json({ error: 'before must be a positive integer' });
        }
    }

    try {
        const group = await findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Viestit näkyvät vain ryhmän jäsenille
        const member = await findMember(groupId, userId);
        if (!member) {
            return res.status(403).json({ error: 'Only group members can read messages' });
        }

        const messages = await findMessagesByGroup(groupId, limit, before);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /DeleteGroupMessage/:messageId
export const deleteGroupMessage = async (req, res) => {
    const requesterId = req.user.userid;
    const messageId = Number(req.params.messageId);

    if (!Number.isInteger(messageId) || messageId <= 0) {
        return res.status(400).json({ error: 'messageId must be a positive integer' });
    }

    try {
        const message = await findMessageById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Viestin voi poistaa sen kirjoittaja tai ryhmän admin
        const isAuthor = message.userid === requesterId;
        if (!isAuthor) {
            const requester = await findMember(message.groupid, requesterId);
            if (!requester?.isadmin) {
                return res.status(403).json({
                    error: 'Only the author or a group admin can delete this message'
                });
            }
        }

        await deleteMessageById(messageId);
        res.status(200).json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting group message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};