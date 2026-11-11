import {
    findAllUsers,
    findUserByEmail,
    findUserById,
    insertUser,
    deleteUserById,
    updateUserEmail,
    updateUserNickname,
    updateUserPassword
} from "../models/userModel.js";
import bcrypt from "bcryptjs";

// GET /GetAllUsers 
export const GetAllUsers = async (req, res) => {
    try {
        const users = await findAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// POST /CreateUser body: { nickname, email, password }
export const CreateUser = async (req, res) => {
    const { nickname, email, password } = req.body;

    if (!nickname || !email || !password) {
        return res.status(400).json({ error: 'Nickname, email, and password are required' });
    }

    if (password.length <8) {
        return res.status(400).json({
            error: 'Salasanan tulee olla vähintään 8 merkkiä pitkä'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await insertUser(
            nickname,
            email,
            hashedPassword
        );
        res.status(201).json(user);
    } catch (error) {
        // 23505 = unique_violation (nickname tai email jo käytössä)
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Nickname or email already in use' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// GET /GetUserByEmail body: { email }
export const GetUserByEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { passwordhash, ...safeUser } = user;
        res.status(200).json(safeUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// POST /LoginUser body: { email, password }
export const LoginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Sähköposti ja salasana ovat pakollisia.'
        });
    }

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: 'Virheellinen sähköposti tai salasana.'
            });
        }

        const match = await bcrypt.compare(
            password,
            user.passwordhash
        );

        if (!match) {
            return res.status(401).json({
                error: 'Virheellinen sähköposti tai salasana.'
            });
        }

        res.status(200).json({
            success: true,
            userid: user.userid,
            nickname: user.nickname,
            email: user.email
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            error: 'Palvelinvirhe'
        });
    }
};

const authenticateUser = async (userId, password, res) => {
    if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return null;
    }
    const user = await findUserById(userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return null;
    }
    const match = await bcrypt.compare(password, user.passwordhash);
    if (!match) {
        res.status(401).json({ error: 'Incorrect password' });
        return null;
    }
    return user;
};

// DELETE /DeleteUser/:userId   body: { password }
export const DeleteUser = async (req, res) => {
    const { userId } = req.params;
    const { password } = req.body;

    try {
        const user = await authenticateUser(userId, password, res);
        if (!user) return;

        await deleteUserById(userId);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /UpdateEmail/:userId   body: { email, password }
export const UpdateEmail = async (req, res) => {
    const { userId } = req.params;
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'New email is required' });
    }

    try {
        const user = await authenticateUser(userId, password, res);
        if (!user) return;

        const updated = await updateUserEmail(userId, email);
        res.status(200).json(updated);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Email already in use' });
        }
        console.error('Error updating email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /UpdateNickname/:userId   body: { nickname }
export const UpdateNickname = async (req, res) => {
    const { userId } = req.params;
    const { nickname } = req.body;

    if (!nickname) {
        return res.status(400).json({ error: 'New nickname is required' });
    }

    try {
        const updated = await updateUserNickname(userId, nickname);
        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updated);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Nickname already in use' });
        }
        console.error('Error updating nickname:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /UpdatePassword/:userId   body: { password, newPassword }
export const UpdatePassword = async (req, res) => {
    const { userId } = req.params;
    const { password, newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length <8) {
        return res.status(400).json({
            error: 'Salasanan tulee olla vähintään 8 merkkiä pitkä.'
        });
    }

    try {
        const user = await authenticateUser(userId, password, res);
        if (!user) return;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(userId, hashedPassword);
        res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};