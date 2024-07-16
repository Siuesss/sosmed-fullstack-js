import { prisma } from '../utils/prisma.js';
import { generateCustomUUID } from '../utils/uuid.js';
import { createFollowNotification } from './notifService.js';

const followUser = async (followerId, followingId) => {
    try {
        const existingFollow = await prisma.follow.findFirst({
            where: {
                followerId,
                followingId,
            },
        });

        if (existingFollow?.followed === false) {
            const updatedFollow = await prisma.follow.update({
                where: {
                    id: existingFollow.id,
                },
                data: {
                    followed: !existingFollow.followed,
                },
            });

            await createFollowNotification(followingId, "ada yang follow nih");

            return updatedFollow.followed;
        }
        if (existingFollow?.followed === true) {
            const updatedFollow = await prisma.follow.update({
                where: {
                    id: existingFollow.id,
                },
                data: {
                    followed: !existingFollow.followed,
                },
            });

            return updatedFollow.followed;
        } else {
            const newFollow = await prisma.follow.create({
                data: {
                    id: generateCustomUUID(),
                    followerId,
                    followingId,
                    followed: true,
                },
            });

            await createFollowNotification(followingId, "ada yang follow nih");

            return newFollow.followed;
        }
    } catch (error) {
        throw new Error(`Failed to follow/unfollow user: ${error.message}`);
    }
};

export { followUser };