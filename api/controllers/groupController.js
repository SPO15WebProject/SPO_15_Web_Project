import {
    insertGroup,
    findGroupById,
    findMember,
    countAdmins,
    countMembers,
    insertMember,
    deleteMember,
    deleteGroupById,
    findAllGroups,
    findGroupMembers
} from "../models/groupModel.js";

// POST /CreateGroup — lomakkeelta saadaan nimi, kuvaus ja ryhmän tyyppi.
export const CreateGroup = async (req, res) => {
    const creatorId = req.user.userid;
    const {
        groupName: rawName,
        groupDescription: rawDescription,
        inviteOnly = false
    } = req.body ?? {};

    // Poistetaan ylimääräiset välilyönnit ja tarkistetaan että tiedot ovat oikein.
    const groupName = typeof rawName === 'string' ? rawName.trim() : '';

    if (!groupName || groupName.length > 255) {
        return res.status(400).json({ error: 'Give the group a name (1-255 characters).' });
    }

    if (rawDescription != null && typeof rawDescription !== 'string') {
        return res.status(400).json({ error: 'Description must be text.' });
    }

    if (typeof inviteOnly !== 'boolean') {
        return res.status(400).json({ error: 'Select an open or invite-only group.' });
    }

    const groupDescription = rawDescription?.trim() || null;

    try {
        const group = await insertGroup(groupName, groupDescription, inviteOnly, creatorId);
        res.status(201).json(group);
    } catch (error) {
        // 23503 = viiteavainvirhe, esim jos ryhmän perustajaa ei löydy
        if (error.code === '23503') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /AddGroupMember body: { groupId, userId }
export const AddGroupMember = async (req, res) => {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
        return res.status(400).json({ error: 'groupId and userId are required' });
    }

    try {
        const group = await findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const member = await insertMember(groupId, userId);
        res.status(201).json(member);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'User is already a member of this group' });
        }
        if (error.code === '23503') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error adding group member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /RemoveGroupMember body: { groupId, userId, requesterId }
export const RemoveGroupMember = async (req, res) => {
    const { groupId, userId, requesterId } = req.body;

    if (!groupId || !userId || !requesterId) {
        return res.status(400).json({ error: 'groupId, userId and requesterId are required' });
    }

    try {
        const requester = await findMember(groupId, requesterId);
        const requesterIsAdmin = requester?.isadmin === true;
        const isSelf = String(userId) === String(requesterId);

        if (!requesterIsAdmin && !isSelf) {
            return res.status(403).json({ error: 'Only group admins can remove other members' });
        }

        const target = await findMember(groupId, userId);
        if (!target) {
            return res.status(404).json({ error: 'User is not a member of this group' });
        }
        // ryhmässä pitää olla vähintään yksi admin, jos muita jäseniä on jäljellä
        if (target.isadmin) {
            const admins = await countAdmins(groupId);
            const members = await countMembers(groupId);
            if (admins === 1 && members > 1) {
                return res.status(409).json({
                    error: 'Cannot remove the last admin while other members remain'
                });
            }
            else if (admins === 1 && members === 1) {
                await deleteGroupById(groupId);
                return res.status(200).json({ success: true, message: 'Last admin removed, group deleted' });
            }
        }

        await deleteMember(groupId, userId);
        res.status(200).json({ success: true, message: 'Member removed' });
    } catch (error) {
        console.error('Error removing group member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /DeleteGroup/:groupId   body: { requesterId }
export const DeleteGroup = async (req, res) => {
    const { groupId } = req.params;
    const { requesterId } = req.body;

    if (!requesterId) {
        return res.status(400).json({ error: 'requesterId is required' });
    }

    try {
        const group = await findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const requester = await findMember(groupId, requesterId);
        if (!requester?.isadmin) {
            return res.status(403).json({ error: 'Only group admins can delete the group' });
        }

        await deleteGroupById(groupId);
        res.status(200).json({ success: true, message: 'Group deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// GET /GetAllGroups
export const GetAllGroups = async (req, res) => {
    try {
        const groups = await findAllGroups();
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
 
// GET /GetGroupById/:groupId
export const GetGroupById = async (req, res) => {
    const { groupId } = req.params;
 
    try {
        const group = await findGroupById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        const members = await findGroupMembers(groupId);
        res.status(200).json({ ...group, members });
    } catch (error) {
        console.error('Error fetching group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
