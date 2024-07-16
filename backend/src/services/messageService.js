import { prisma } from '../utils/prisma.js';
import { generateCustomUUID } from '../utils/uuid.js';

const newMessage = async (senderId, receiverId, content, mediaUrl, mediaType) => {
    try {
        const message = await prisma.message.create({
            data: {
                id: generateCustomUUID(),
                senderId: senderId,
                receiverId: receiverId,
                content: content,
                mediaUrl,
                mediaType
            },
        });
        return message;
    } catch (error) {
        throw error;
    }
};

const getMessage = async (senderId, receiverId) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
            include: {
                sender: {
                    select: { username: true },
                },
                receiver: {
                    select: { username: true },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        const sanitizedMessages = messages.map(message => {
            const { senderId, receiverId, ...rest } = message;
            return rest;
        });
        return sanitizedMessages;
    } catch (error) {
        throw error;
    }
};

const getLastMessage = async (userId) => {
    const lastChatIds = await prisma.$queryRaw`
        SELECT DISTINCT ON (LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"))
               id
        FROM "Message"
        WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
        ORDER BY LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"), "createdAt" DESC
    `;

    const lastChats = await prisma.message.findMany({
        where: {
            id: {
                in: lastChatIds.map(chat => chat.id),
            },
        },
        include: {
            sender: true,
            receiver: true,
        },
    });

    const userIds = new Set();
    lastChats.forEach(chat => {
        if (chat.senderId !== userId) userIds.add(chat.senderId);
        if (chat.receiverId !== userId) userIds.add(chat.receiverId);
    });

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: Array.from(userIds),
            },
        },
        select: {
            id: true,
            username: true,
        },
    });

    const lastMessages = [];

    lastChats.forEach(chat => {
        const otherUserId = chat.senderId === userId ? chat.receiverId : chat.senderId;
        const user = users.find(u => u.id === otherUserId);
        const message = {
            username: user?.username ?? '',
            content: chat.content,
            mediaType: chat.mediaType,
            lastChat: chat.createdAt,
        };
        const existingIndex = lastMessages.findIndex(msg => msg.username === message.username);
        if (existingIndex === -1) {
            lastMessages.push(message);
        } else {
            if (message.lastChat > lastMessages[existingIndex].lastChat) {
                lastMessages[existingIndex] = message;
            }
        }
    });

    return lastMessages;
};

export { newMessage, getMessage, getLastMessage };