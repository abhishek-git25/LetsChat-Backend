import { body, check, param, validationResult } from 'express-validator'
import { ErrorHandler } from '../utils/utilit.js'

const newGroupChatValidator = () => [
    body("name", "Please enter name").notEmpty(),
    body("members").notEmpty().withMessage("Please add members").isArray({ min: 2, max: 100 }).withMessage("Members should be between 2-100"),
]

const addMembersValidator = () => [
    body("chatId", "Please enter Chat ID").notEmpty(),
    body("members")
        .notEmpty()
        .withMessage("Please add members")
        .isArray({ min: 1, max: 97 })
        .withMessage("Members should be between 1-97"),
]

const registerValidator = () => [
    body("name", "Please enter name").notEmpty(),
    body("username", "Please enter username").notEmpty(),
    body("bio", "Please enter bio").notEmpty(),
    body("password", "Please enter password").notEmpty(),
]

const loginValidator = () => [
    body("username", "Please enter username").notEmpty(),
    body("password", "Please enter password").notEmpty(),
]

const removeMemberValidator = () => [
    body("chatId", "Please Enter ChatID").notEmpty(),
    body("userId", "Please enter UserId").notEmpty()
]

const leaveGroupValidator = () => [
    param("id", "Please enter chat id").notEmpty(),
]

const sendattachmentsValidator = () => [
    body("chatId", "Please Enter ChatID").notEmpty(),
]

const chatIdValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty()
]

const renameValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name", "Please enter the name").notEmpty()

]

const sendRequestValidator = () => [
    body("userId", "Please enter UserId").notEmpty()
]

const acceptRequestValidator = () => [
    body("requestId", "Please enter Request Id").notEmpty(),
    body("accept")
        .notEmpty()
        .withMessage("Please Add Accepts")
        .isBoolean()
        .withMessage("Accept must be boolean")
]


const adminLoginValidator = () => [
    body("secretKey", "Secret key is empty").notEmpty(),
]




const validateHandler = (req, res, next) => {
    const errors = validationResult(req)
    console.log(errors , "76");

    const errorMessages = errors.
        array().
        map((error) => error.msg).
        join(", ")

        console.log(errorMessages , "83");

    if (errors.isEmpty()) {
        return next()
    } else {
        next(new ErrorHandler(errorMessages, 400))
    }
}


export {
    registerValidator,
    validateHandler,
    loginValidator,
    newGroupChatValidator,
    addMembersValidator,
    removeMemberValidator,
    leaveGroupValidator,
    sendattachmentsValidator,
    chatIdValidator,
    renameValidator,
    sendRequestValidator,
    acceptRequestValidator,
    adminLoginValidator
}