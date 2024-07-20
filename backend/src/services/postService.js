import { prisma } from '../utils/prisma.js';
import { generateCustomUUID as UUID} from '../utils/uuid.js';
import { createMentionNotification } from './notifService.js';
import path from 'path';
import fs from 'fs';

const createPost = async (authorId, content, mediaUrl,mediaType,mentionedUserId) => {
  const post = await prisma.post.create({
    data: {
      id: UUID(),
      authorId,
      content,
      mediaUrl,
      mediaType,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: authorId },
    select: { username: true }
  });


  for (const mentionedUser of mentionedUserId) {
    await createMentionNotification(mentionedUser.id, user.username, post.id);
  }

  return post;
};

const getAllPosts = async (userId) => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      mediaType: true,
      mediaUrl: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          username: true,
          id: true,
        },
      },
      views: {
        select: {
          id: true,
        }
      },
      likes: {
        select: {
          liked: true,
        }
      },
    },
  });

  return posts.map(post => {
    const isMine = post.author.id === userId;
    const { id, ...authorWithoutId } = post.author;

    return {
      ...post,
      author: authorWithoutId,
      isMine,
    };
  });
};

const deletePost = async (postId, userId) => {
  try {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
      mediaUrl: true
    },
  });

  if(post.mediaUrl){
    const oldImagePath = path.join(__dirname, '..', '..', post.mediaUrl);
    fs.unlink(oldImagePath, (err) => {
      if(err){
        console.error(`Failed to delete old profile image: ${oldImagePath}`, err);
      }
    })
  }

  await prisma.like.deleteMany({
    where: {
      postId: postId,
    }
  })

  await prisma.comment.deleteMany({
    where:{
      postId
    }
  })

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return { message: 'Post deleted successfully' };
  } catch (error) {
    throw error
  }
};

const getpostbyId = async (postId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      content: true,
      mediaUrl: true,
      mediaType: true,
      views: {
        select: {
          id: true
        }
      },
      likes: {
        select: {
          liked: true,
        }
      },
      comments: {
        select: {
          content: true,
          parentId: true,
          author: {
            select: {
              username: true
            }
          }
        }
      },
      author: {
        select: {
          username: true
        }
      }
    }
  });
  return post;
}

export {getAllPosts, createPost, deletePost, getpostbyId}