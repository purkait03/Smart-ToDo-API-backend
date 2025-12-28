import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Task } from "../models/task.model.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"


const options = {
    httpOnly: true,
    secure: true
}


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, password } = req.body

    if ([username, email, fullname, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are requierd")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(401, "The user with username and email is already exist")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Somthing went wrong while registering the user")
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { createdUser, accessToken, refreshToken }, "The user is registered successfully")
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const orConditions = []

    if (username) orConditions.push({ username })
    if (email) orConditions.push({ email })

    const user = await User.findOne({
        $or: orConditions
    })

    if (!user) throw new ApiError(404, "User not found")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "Password is incorrect")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.coockie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token is refreshed"
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password is updated successfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details are updated successfully")
        )
})

const createTask = asyncHandler(async (req, res) => {
    const { title, description, priority } = req.body

    if (!title) {
        throw new ApiError(400, "Title is required")
    }

    const createdTask = await Task.create({
        title,
        description,
        priority,
        user: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdTask, "Task is created successfully")
        )
})

const getAllTasks = asyncHandler(async (req, res) => {

    const tasks = await Task.find({ user: req.user._id })

    return res
        .status(200)
        .json(
            new ApiResponse(200, tasks, "All tasks are fetched successfully")
        )
})

const getTask = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task id")
    }

    const task = await Task.findOne({
        _id: id,
        user: req.user._id
    })

    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, task, "Task fetched successfully")
        )
})

const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title, description, status, priority } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task id");
    }

    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = priority;

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updatedTask = await Task.findOneAndUpdate({
        _id: id,
        user: req.user._id
    },
        {
            $set: updateFields
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedTask, "Task fetched successfully")
        )
})

const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task id")
    }

    const deletedTask = await Task.findOneAndDelete(
        {
            _id: id,
            user: req.user._id
        }
    )

    if (!deletedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "The task has been deleted successfully")
        )
})




export {
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
}