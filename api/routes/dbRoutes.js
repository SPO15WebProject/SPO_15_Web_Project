import { Router } from "express";
import {
    getAllUsers,
    createUser,
    getUserByEmail,
    loginUser,
    logoutUser,
    getMe,
    deleteUser,
    updateEmail,
    updateNickname,
    updatePassword
} from "../controllers/userController.js";
import {
    createGroup,
    addGroupMember,
    removeGroupMember,
    deleteGroup,
    getGroupById,
    getAllGroups,
    getMyGroups
} from "../controllers/groupController.js";
import {
    createGroupMessage,
    getGroupMessages,
    deleteGroupMessage
} from "../controllers/groupMessageController.js";
import {
    createReview,
    getAllReviews,
    getReviewById,
    getReviewsByMovie,
    getReviewsByUser,
    deleteReview,
    updateReview
} from "../controllers/reviewController.js";
import {
    createList,
    getAllLists,
    getListById,
    getListsByUser,
    getListsByGroup,
    updateList,
    deleteList,
    addMovieToList,
    removeMovieFromList,
    addListToGroup,
    removeListFromGroup
} from "../controllers/listController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router()

router.get('/GetAllUsers', getAllUsers)
router.post('/CreateUser', createUser)
router.post('/GetUserByEmail', getUserByEmail)
router.post('/Login', loginUser)
router.post('/Logout', logoutUser)
router.delete('/DeleteUser/:userId', authMiddleware, deleteUser)
router.put('/UpdateEmail/:userId', authMiddleware, updateEmail)
router.put('/UpdateNickname/:userId', authMiddleware, updateNickname)
router.put('/UpdatePassword/:userId', authMiddleware, updatePassword)

router.post('/CreateGroup', authMiddleware, createGroup)
router.post('/AddGroupMember', authMiddleware, addGroupMember)
router.delete('/RemoveGroupMember', authMiddleware, removeGroupMember)
router.delete('/DeleteGroup/:groupId', authMiddleware, deleteGroup)
router.get('/GetGroupById/:groupId', getGroupById)
router.get('/GetAllGroups', getAllGroups)
router.get('/GetMyGroups', authMiddleware, getMyGroups)

router.post('/CreateGroupMessage', authMiddleware, createGroupMessage)
router.get('/GetGroupMessages/:groupId', authMiddleware, getGroupMessages)
router.delete('/DeleteGroupMessage/:messageId', authMiddleware, deleteGroupMessage)

router.post('/CreateReview', authMiddleware, createReview)
router.get('/GetAllReviews', getAllReviews)
router.get('/GetReviewById/:reviewId', getReviewById)
router.get('/GetReviewsByMovie/:movieId', getReviewsByMovie)
router.get('/GetReviewsByUser/:userId', getReviewsByUser)
router.delete('/DeleteReview/:reviewId', authMiddleware, deleteReview)
router.put('/UpdateReview/:reviewId', authMiddleware, updateReview)

router.post('/CreateList', authMiddleware, createList)
router.get('/GetAllLists', getAllLists)
router.get('/GetListById/:listId', getListById)
router.get('/GetListsByUser/:userId', getListsByUser)
router.get('/GetListsByGroup/:groupId', getListsByGroup)
router.put('/UpdateList/:listId', authMiddleware, updateList)
router.delete('/DeleteList/:listId', authMiddleware, deleteList)
router.post('/AddMovieToList', authMiddleware, addMovieToList)
router.delete('/RemoveMovieFromList/:listId/:movieId', authMiddleware, removeMovieFromList)
router.post('/AddListToGroup', authMiddleware, addListToGroup)
router.delete('/RemoveListFromGroup/:listId/:groupId', authMiddleware, removeListFromGroup)

//Palauttaa kirjautuneen käyttäjän evästeen jos on eväste
router.get('/Me', authMiddleware, getMe)

export default router;