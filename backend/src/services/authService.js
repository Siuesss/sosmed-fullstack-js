import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma.js';
import { generateCustomUUID } from '../utils/uuid.js';

const Register = async (username, email, password) => {
    try {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        const existingUsername = await prisma.user.findUnique({where: {username: `@${username}`}});
        // if(existingEmail){
        //     throw new Error('Email already in use');
        // }
        // if(existingUsername){
        //     throw new Error('Username already in use');
        // }
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
    // if (!identifier) {
    //     throw new Error('Identifier cannot be null or empty');
    // }

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

        // if (!user) {
        //     throw new Error('User not found');
        // }

        // const currentDate = new Date();

        // const lastPasswordChange = user.lastPasswordChange || new Date(0);
        // const daysSinceLastChange = Math.floor((currentDate.getTime() - lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24));

        // if (daysSinceLastChange > 0) {
        //     await prisma.user.update({
        //         where: { id: userId },
        //         data: { passwordChangeCount: 0 }
        //     });
        //     user.passwordChangeCount = 0;
        // }

        // if (user.passwordChangeCount >= 5) {
        //     throw new Error('Password change limit exceeded for today');
        // }

        if (user.hashPassword === null) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    hashPassword: hashedPassword,
                    // passwordChangeCount: user.passwordChangeCount + 1,
                    // lastPasswordChange: currentDate,
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
                        // passwordChangeCount: user.passwordChangeCount + 1,
                        // lastPasswordChange: currentDate,
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