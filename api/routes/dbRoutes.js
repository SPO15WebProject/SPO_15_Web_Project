import { Router } from "express";
import { GetAllUsers, CreateUser, GetUserByEmail } from "../controllers/dbController.js";

const router = Router()

router.get('/GetAllUsers', GetAllUsers)
router.post('/CreateUser', CreateUser)
router.post('/GetUserByEmail', GetUserByEmail)

export default router;