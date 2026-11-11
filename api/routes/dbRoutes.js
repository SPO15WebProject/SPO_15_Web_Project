import { Router } from "express";
import {
    GetAllUsers,
    CreateUser,
    GetUserByEmail,
    LoginUser
} from "../controllers/dbController.js";

const router = Router()

router.get('/GetAllUsers', GetAllUsers)
router.post('/CreateUser', CreateUser)
router.post('/GetUserByEmail', GetUserByEmail)
router.post('/Login', LoginUser)

export default router;