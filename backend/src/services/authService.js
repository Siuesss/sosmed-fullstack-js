import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.js';
import { generateCustomUUID } from '../utils/uuid.js';

const Register = async (username, email, password) => {
    try {
        const usernameWithPrefix = `@${username}`;
        const hashPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
        data:{
            id: generateCustomUUID(),
            email,
            username: usernameWithPrefix,
            hashPassword,
        }
    });
    return { message: 'User registered successfully' };
    } catch(error) {
        throw error
    }
};

const Login = async (identifier, password) => {

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: `@${identifier}` }
                ],
            },
        });

        if (!user) {
            throw new Error('Email or password incorrect');
        }
        if (!user.hashPassword) {
            throw new Error('User password not set');
        }
        if (!bcrypt.compareSync(password, user.hashPassword)) {
            throw new Error('Email or password incorrect');
        }
        return user;
    } catch (error) {
        throw error;
    }
};

const changepassword = async (userId, oldPassword, newPassword) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (user.hashPassword === null) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    hashPassword: hashedPassword,
                },
            });
        } else {
            if (!bcrypt.compareSync(oldPassword, user.hashPassword)) {
                throw new Error('Password incorrect');
            } else {
                const hashedPassword = bcrypt.hashSync(newPassword, 10);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        hashPassword: hashedPassword,
                    },
                });
            }
        }

        return { message: 'Password updated successfully' };
    } catch (error) {
        throw error;
    }
}

export {Register, Login, changepassword}