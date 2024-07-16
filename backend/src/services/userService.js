import { prisma } from "../utils/prisma.js";

const isSelf = async (userId, username) => {
    try {
        const userByUsername = await prisma.user.findUnique({
            where: { username: username },
            select: { id: true },
        });

        if (!userByUsername) {
            throw new Error('Username not found');
        }

        return userByUsername.id === userId; 
    }catch(error){
        throw error
    }
}

const checkUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
};


const checkUsernames = async (usernames) => {
    try {
        const users = [];
        for (const username of usernames) {
            const user = await checkUsername(username);
            if (user) {
                users.push(user);
            }
        }
        return users;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const checkUserId = async (userId) => {
    try {
        const check = await prisma.user.findFirst({
            where: {id: userId},
            select: {id:true, username: true},
        });

        return check;
    }catch(error){
        throw error;
    }
}

const checkUserIdnoselectid = async (userId) => {
    try {
        const check = await prisma.user.findFirst({
            where: {id: userId},
            select: {username: true},
        });

        return check;
    }catch(error){
        throw error;
    }
}

export {isSelf, checkUsername, checkUsernames, checkUserId, checkUserIdnoselectid};