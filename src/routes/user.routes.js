import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    createTask,
    getAllTasks,
    getTask,
    updateTask,
    deleteTask
} from "../controllers/user.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//Secure routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/tasks").post(verifyJWT, createTask)
router.route("/tasks").get(verifyJWT, getAllTasks)
router.route("/task/:id").get(verifyJWT, getTask)
router.route("/tasks/:id").put(verifyJWT, updateTask)
router.route("/tasks/:id").delete(verifyJWT, deleteTask)
export default router