import { compare } from 'bcrypt';
import { User } from '../models/user.js'
import { cookieOptions, emitEvent, sendToken, uploadFilesToCloudinary } from '../utils/features.js';
import { TryCatch } from '../middlewares/error.js';
import { ErrorHandler } from '../utils/utilit.js';
import { Chat } from '../models/chat.js';
import { Request } from '../models/request.js';
import { NEW_REQUEST, REFETCH_CHATS } from '../constants/events.js';
import { getOtherMembers } from '../lib/helper.js';


const newUsers = TryCatch(async (req, res, next) => {

    const { name, username, password, bio } = req.body

    const file = req.file;

    if (!file) return next(new ErrorHandler("Please Upload Avatar"))

    const result = await uploadFilesToCloudinary([file])
    console.log(result , "21");


    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url
    }

    const user = await User.create({
        name,
        username,
        password,
        bio,
        avatar
    })

    // res.status(201).json({ message: "User created successfully" })
    sendToken(res, user, 201, "User Created")

}
)


const login = TryCatch(async (req, res, next) => {

    const { username, password } = req.body
    const user = await User.findOne({ username }).select("+password")

    if (!user) {
        return next(new ErrorHandler("Invalid Username", 400))
    }
    const isMatch = await compare(password, user.password)

    if (!isMatch) {
        return next(new ErrorHandler("Invalid Password", 400))
    }
    sendToken(res, user, 201, `Welcome Back, ${user.name}`)

})

const getMyProfile = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.user)

    if (!user) return next(new ErrorHandler("User not found", 404))


    res.status(200).json({
        succcess: true,
        data: user
    })
})

const logout = TryCatch(async (req, res) => {
    return res.status(200).cookie('lets_chat_token', '', { ...cookieOptions, maxAge: 0 }).json({
        succcess: true,
        message: "Logged out successfully"
    })
})


const searchUser = TryCatch(async (req, res) => {

    const { name = "" } = req.query

    const myChats = await Chat.find({
        groupChat: false,
        members: req.user
    })

    const allUserFromMyChat = myChats.flatMap((chat) => chat.members)

    const allUserExceptMyAndMyFriends = await User.find({
        _id: { $nin: allUserFromMyChat },
        name: { $regex: name, $options: "i" }
    })

    const users = allUserExceptMyAndMyFriends.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url
    }))

    return res.status(200).json({
        succcess: true,

        message: name,
        users
    })
})

const sendFriendRequest = TryCatch(async (req, res, next) => {
    const { userId } = req.body;

    const request = await Request.findOne({
        $or: [
            { sender: req.user, receiver: userId },
            { sender: userId, receiver: req.user }
        ]
    })

    if (request) return new next(new ErrorHandler("Request already sent", 400))

    await Request.create({
        sender: req.user,
        receiver: userId
    })

    emitEvent(req, NEW_REQUEST, [userId])

    return res.status(200).json({
        succcess: true,
        message: "Request sent"
    })

})

const acceptFriendRequest = TryCatch(async (req, res, next) => {
    const { requestId, accept } = req.body;

    const request = await Request.findById(requestId)
        .populate("sender", "name")
        .populate("receiver", "name")

    if (!request) return next(new ErrorHandler("Request not found", 404))

    if (request.receiver._id.toString() !== req.user.toString()) {
        return next(
            new ErrorHandler("You are not authorized to accept this request", 401)
        )
    }

    if (!accept) {
        await request.deleteOne()

        return res.status(200).json({
            succcess: true,
            message: "Friend Request Rejected"
        })
    }

    const members = [request.sender._id, request.receiver._id]

    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name} and ${request.receiver.name}`
        }),
        request.deleteOne()
    ])

    emitEvent(req, REFETCH_CHATS, members)

    return res.status(200).json({
        succcess: true,
        message: "Friend request accepted",
        senderId: request.sender._id
    })
})

const getMyFriends = TryCatch(async (req, res, next) => {
    const chatId = req.query.chatId

    const chats = await Chat.find({ members: req.user, groupChat: false }).populate("members", "name avatar")

    const friends = chats.map(({ members }) => {
        const otherUser = getOtherMembers(members, req.user)

        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url
        }
    })

    if (chatId) {
        const chat = await Chat.findById(chatId)
        const availableFriends = friends.filter((friend) => !chat.members.includes(friend._id))

        return res.status(200).json({
            succcess: true,
            friends: availableFriends
        })
    } else {
        return res.status(200).json({
            succcess: true,
            friends
        })
    }
})

const getAllNotifications = TryCatch(async (req, res) => {
    const request = await Request.find({ receiver: req.user }).populate(
        "sender",
        "name avatar"
    )

    const allRequests = request.map(({ _id, sender }) => ({
        _id, sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url
        }
    }))

    return res.status(200).json({
        succcess: true,
        request: allRequests
    })

})




export { login, newUsers, getMyProfile, logout, searchUser, sendFriendRequest, acceptFriendRequest, getAllNotifications, getMyFriends }