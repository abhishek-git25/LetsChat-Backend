import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { cookieOptions } from "../utils/features.js";
import { ErrorHandler } from "../utils/utilit.js";
import jwt from "jsonwebtoken";



const adminLogin = TryCatch(async (req, res, next) => {

    const { secretKey } = req.body

    const adminSecretKey = process.env.ADMIN_SECRET_KEY || "ABHISHEK_YADAV"
    const isMatch = secretKey === adminSecretKey

    if (!isMatch) return next(new ErrorHandler("Invalid admin key", 401))

    const token = jwt.sign(secretKey, process.env.JWT_SECRET)

    return res
        .status(200)
        .cookie("lets-chat-admin-token", token, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 15
        })
        .json({
            success: true,
            message: "Authenticated successfully"
        })

})


const adminLogout = TryCatch(async (req, res, next) => {
    return res
        .status(200)
        .cookie("lets-chat-admin-token", "", {
            ...cookieOptions,
            maxAge: 0
        })
        .json({
            success: true,
            message: "Logged out successfully"
        })
})

const getAdminData = TryCatch(async (req, res, next) => {
    return res.status(200).json({
        admin: true
    })
})


const allUsers = TryCatch(async (req, res) => {
    const users = await User.find({})

    const transfromData = await Promise.all(
        users.map(async ({ name, username, avatar, _id }) => {

            const [groups, friends] = await Promise.all([
                Chat.countDocuments({ groupChat: true, members: _id }),
                Chat.countDocuments({ groupChat: false, members: _id })
            ])

            return {
                name,
                username,
                avatar: avatar.url,
                _id,
                groups,
                friends
            }
        })
    )

    return res.status(200).json({
        status: "success",
        data: transfromData
    })


})

const allChats = TryCatch(async (req, res) => {

    const chats = await Chat.find({})
        .populate("members", "name avatar")
        .populate("creator", "name avatar")

    const transfromedChats = await Promise.all(
        chats.map(async ({ members, _id, groupChat, name, creator }) => {

            const totalMessages = await Message.countDocuments({ chat: _id })

            return {
                name,
                _id,
                groupChat,
                avatar: members.slice(0, 3).map((member) => member.avatar.url),
                members: members.map(({ _id, name, avatar }) => ({
                    _id,
                    name,
                    avatar: avatar.url
                })),
                creator: {
                    name: creator?.name || "None",
                    avatar: creator ? creator.avatar.url : ""
                },
                totalMembers: members.length,
                totalMessages
            }
        }))

    return res.status(200).json({
        status: "success",
        transfromedChats

    })


})

const allMessages = TryCatch(async (req, res) => {
    const messages = await Message.find({})
        .populate("sender", "name avatar")
        .populate("chat", "groupChat")

    const transformedMessages = messages.map(({ content, attachments, _id, sender, createAt, chat }) => {
        return {
            _id,
            attachments,
            content,
            createAt,
            chat: chat._id,
            groupChat: chat.groupChat,
            sender: {
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar.url
            }
        }
    })

    return res.status(200).json({
        success: true,
        messages: transformedMessages
    })
})


const getDashBoardStats = TryCatch(async (req, res) => {

    const [groupsCount, userCount, messageCount, totalChatCounts] = await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments({}),
        Message.countDocuments({}),
        Chat.countDocuments({}),
    ])

    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7)

    const last7DaysMessage = await Message.find({
        createdAt: {
            $gte: last7Days,
            $lte: today
        }
    }).select("createdAt")

    console.log(last7DaysMessage, "124", last7Days, today);

    const messages = new Array(7).fill(0)
    const dayInMilliseconds = 1000 * 60 * 60 * 24

    last7DaysMessage.forEach((message) => {
        console.log(message, 128);
        const indexApprox = (today.getTime() - message.createdAt.getTime()) / dayInMilliseconds
        const exactIndex = Math.floor(indexApprox)
        messages[6 - exactIndex]++
    })

    const stats = {
        groupsCount,
        userCount,
        messageCount,
        totalChatCounts,
        messages,
        chartMessage: last7DaysMessage
    }

    console.log(stats , "194");


    return res.status(200).json({
        success: true,
        stats
    })
})



export { allUsers, allChats, allMessages, getDashBoardStats, adminLogin, adminLogout, getAdminData }