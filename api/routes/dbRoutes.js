import { Router } from "express";
import {
    GetAllUsers,
    CreateUser,
    GetUserByEmail,
    LoginUser,
    LogoutUser,
    GetMe,
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
    GetAllGroups,
    GetMyGroups
} from "../controllers/groupController.js";
import {
    CreateReview,
    GetAllReviews,
    GetReviewById,
    GetReviewsByMovie,
    GetReviewsByUser,
    DeleteReview,
    UpdateReview
} from "../controllers/reviewController.js";
import {
    CreateList,
    GetAllLists,
    GetListById,
    GetListsByUser,
    GetListsByGroup,
    UpdateList,
    DeleteList,
    AddMovieToList,
    RemoveMovieFromList,
    AddListToGroup,
    RemoveListFromGroup
} from "../controllers/listController.js";

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

router.post('/CreateGroup', authMiddleware, CreateGroup)
router.post('/AddGroupMember', authMiddleware, AddGroupMember)
router.delete('/RemoveGroupMember', authMiddleware, RemoveGroupMember)
router.delete('/DeleteGroup/:groupId', authMiddleware, DeleteGroup)
router.get('/GetGroupById/:groupId', GetGroupById)
router.get('/GetAllGroups', GetAllGroups)
router.get('/GetMyGroups', authMiddleware, GetMyGroups)

router.post('/CreateReview', authMiddleware, CreateReview)
router.get('/GetAllReviews', GetAllReviews)
router.get('/GetReviewById/:reviewId', GetReviewById)
router.get('/GetReviewsByMovie/:movieId', GetReviewsByMovie)
router.get('/GetReviewsByUser/:userId', GetReviewsByUser)
router.delete('/DeleteReview/:reviewId', authMiddleware, DeleteReview)
router.put('/UpdateReview/:reviewId', authMiddleware, UpdateReview)

router.post('/CreateList', authMiddleware, CreateList)
router.get('/GetAllLists', GetAllLists)
router.get('/GetListById/:listId', GetListById)
router.get('/GetListsByUser/:userId', GetListsByUser)
router.get('/GetListsByGroup/:groupId', GetListsByGroup)
router.put('/UpdateList/:listId', authMiddleware, UpdateList)
router.delete('/DeleteList/:listId', authMiddleware, DeleteList)
router.post('/AddMovieToList', authMiddleware, AddMovieToList)
router.delete('/RemoveMovieFromList/:listId/:movieId', authMiddleware, RemoveMovieFromList)
router.post('/AddListToGroup', authMiddleware, AddListToGroup)
router.delete('/RemoveListFromGroup/:listId/:groupId', authMiddleware, RemoveListFromGroup)

//Palauttaa kirjautuneen käyttäjän evästeen jos on eväste
router.get('/Me', authMiddleware, GetMe)

export default router;