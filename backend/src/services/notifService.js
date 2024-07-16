import {prisma} from '../utils/prisma.js';
import { generateCustomUUID as UUID } from '../utils/uuid.js';
import { io } from "../server.js";
import dotenv from 'dotenv';

dotenv.config();

const getNotif = async (userId) => {
    const notif = await prisma.notification.findMany({
        where: {userId},
        select: {
            id: true,
            type: true,
            message: true,
            postId: true,
            createdAt: true,
        }
    });
    return notif;
}

const createMentionNotification = async (mentionedUserId, mentionedUsername, postId) => {
      const notif = await prisma.notification.create({
        data: {
          id: UUID(),
          userId: mentionedUserId,
          type: 'mention',
          message: `You were mentioned in a post by ${mentionedUsername}`,
          postId: postId,
        },
      });
      return notif;
  };

const createFollowNotification = async (userId, message) => {
      const notif = await prisma.notification.create({
        data: {
          id: UUID(),
          userId,
          type: 'Notif',
          message,
        },
      });
      io.emit('newNotification', notif);
      return notif;
  };

  const createLikeNotification = async (userId, message) => {
      const notif = await prisma.notification.create({
        data: {
          id: UUID(),
          userId,
          type: 'Notif',
          message,
        },
      });
      io.emit('newNotification', notif);
      return notif;
  };

export {getNotif, createMentionNotification, createFollowNotification, createLikeNotification}