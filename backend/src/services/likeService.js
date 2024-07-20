import { prisma } from '../utils/prisma.js';
import { generateCustomUUID } from '../utils/uuid.js';
import { createLikeNotification } from './notifService.js';

const Like = async (postId, userId) => {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (existingLike?.liked === false) {
      const updatedLike = await prisma.like.update({
        where: {
          id: existingLike.id,
        },
        data: {
          liked: !existingLike.liked,
        },
      });

      await createLikeNotification(post.authorId, "Ada yang menyukai postingan Anda.");

      return updatedLike.liked;
    }

    if (existingLike?.liked === true) {
      const updatedLike = await prisma.like.update({
        where: {
          id: existingLike.id,
        },
        data: {
          liked: !existingLike.liked,
        },
      });

      return updatedLike.liked;
    } else {
      const newLike = await prisma.like.create({
        data: {
          id: generateCustomUUID(),
          postId,
          userId,
          liked: true,
        },
      });

      await createLikeNotification(post.authorId, "Ada yang menyukai postingan Anda.");

      return newLike.liked;
    }
  } catch (error) {
    throw new Error(`Failed to add/remove like: ${error.message}`);
  }
};

export { Like };