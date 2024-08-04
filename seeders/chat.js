import { faker } from '@faker-js/faker';
import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";

const createSingleChats = async (numChats) => {
    try {
        const users = await User.find().select("_id");
        const chatsPromise = []

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                chatsPromise.push(
                    Chat.create({
                        name: faker.lorem.words(2),
                        members: [users[i], users[j]]
                    })
                )
            }
        }

        await Promise.all(chatsPromise)
        console.log("Single chats created successfully");
        process.exit()
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

export { createSingleChats }