import mongoose from 'mongoose'

const schema =  mongoose.Schema({
    content: String,
    attachments: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    chat: {
        type: mongoose.Types.ObjectId,
        ref: "Chat",
        required: true
    }
}, {
    timestamps: true
})

export const Message = mongoose.model("Message", schema)