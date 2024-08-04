import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    groupChat: {
        type: Boolean,
        default: false
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref : "User"
    },
    members : [
        {
            type : mongoose.Types.ObjectId,
            ref : "User"
        }
    ],
},{
    timestamps : true
})

export const Chat = mongoose.model("Chat", schema)