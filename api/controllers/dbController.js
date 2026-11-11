import { findAllUsers, findUserByEmail, insertUser } from "../models/userModel.js";
import bcrypt from "bcryptjs";


export const GetAllUsers = async (req, res) => {
    try {
        const users = await findAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const CreateUser = async (req, res) => {
    const { nickname, email, password } = req.body;

    if (!nickname || !email || !password) {
        return res.status(400).json({ error: 'Nickname, email, and password are required' });
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