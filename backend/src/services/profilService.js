import { prisma } from '../utils/prisma.js';
import fs from 'fs';
import path from 'path';

const getProfilbyusername = async (userId, loggedInUserId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                name: true,
                image: true,
                posts: {
                    select: {
                        id: true,
                        content: true,
                        mediaUrl: true,
                        mediaType: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                            }
                        },
                        likes: {
                            select: {
                                liked: true,
                            }
                        }
                    },
                },
                _count: {
                    select: {
                        followers: {
                            where: { followed: true }
                        },
                        following: {
                            where: { followed: true }
                        },
                    }
                }
            },
        });

        const followStatus = await prisma.follow.findFirst({
            where: {
              followerId: loggedInUserId,
              followingId: userId,
              followed: true,
            }
        });

        const postsWithIsMine = user.posts.map(post => ({
            ...post,
            isMine: post.author.id === loggedInUserId,
            author: {
                username: post.author.username,
            },
        }));

        const isFollowing = Boolean(followStatus);

        return {
            username: user.username,
            name: user.name,
            image: user.image,
            posts: postsWithIsMine,
            followersCount: user._count.following,
            followingCount: user._count.followers,
            isFollowing,
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

const editProfil = async(userId, name, username, mediaUrl) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (mediaUrl) {
        if (user.image) {
          const oldImagePath = path.join(__dirname, '..','..',user.image);
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(`Failed to delete old profile image: ${oldImagePath}`, err);
            }
          });
        }
        updateData.image = mediaUrl;
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          username: `@${username}`,
          image: mediaUrl,
        },
      });
  
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

export { getProfilbyusername, editProfil };