import { Router } from "express";
import {
    GetAllUsers,
    CreateUser,
    GetUserByEmail,
    LoginUser,
    LogoutUser,
    DeleteUser,
    UpdateEmail,
    UpdateNickname,
    UpdatePassword
} from "../controllers/userController.js";
import {
    CreateGroup,
    AddGroupMember,
    RemoveGroupMember,
    DeleteGroup,
    GetGroupById,
    GetAllGroups
} from "../controllers/groupController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router()

router.get('/GetAllUsers', GetAllUsers)
router.post('/CreateUser', CreateUser)
router.post('/GetUserByEmail', GetUserByEmail)
router.post('/Login', LoginUser)
router.post('/Logout', LogoutUser)
router.delete('/DeleteUser/:userId', DeleteUser)
router.put('/UpdateEmail/:userId', UpdateEmail)
router.put('/UpdateNickname/:userId', UpdateNickname)
router.put('/UpdatePassword/:userId', UpdatePassword)

router.post('/CreateGroup', CreateGroup)
router.post('/AddGroupMember', AddGroupMember)
router.delete('/RemoveGroupMember', RemoveGroupMember)
router.delete('/DeleteGroup/:groupId', DeleteGroup)
router.get('/GetGroupById/:groupId', GetGroupById)
router.get('/GetAllGroups', GetAllGroups)

//Testireitti JWT-autentikoinnin toiminnan tarkistamiseen.
router.get('/Me', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
})

export default router;