import express from "express"
import { isAthencticated } from "../middlewares/auth.js";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers, renameGroup, sendAttachments } from "../controller/chat.js";
import { attachmentsMulter } from "../middlewares/multer.js";
import { addMembersValidator, chatIdValidator, leaveGroupValidator, newGroupChatValidator, removeMemberValidator, renameValidator, sendattachmentsValidator, validateHandler } from "../lib/validator.js";

const app = express.Router();



app.use(isAthencticated)
// After this user must be logged in to access routes

app.post("/new_group_chat", newGroupChatValidator(), validateHandler, newGroupChat)
app.get("/my_chats", getMyChats)
app.get("/my_groups", getMyGroups)
app.put("/add_members", addMembersValidator(), validateHandler, addMembers)
app.put("/remove_members", removeMemberValidator(), validateHandler, removeMembers)
app.delete("/leave_group/:id", leaveGroupValidator(), validateHandler, leaveGroup)
app.post("/send_attachment", attachmentsMulter, sendattachmentsValidator(), validateHandler, sendAttachments)
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages)

app.route("/:id")
    .get(chatIdValidator(), validateHandler, getChatDetails)
    .put(renameValidator(), validateHandler, renameGroup)
    .delete(chatIdValidator(), validateHandler, deleteChat);




export default app