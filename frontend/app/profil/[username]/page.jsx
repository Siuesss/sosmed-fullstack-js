'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import Link from 'next/link';

const ProfilePage = () => {
  const params = useParams();
  const { username } = params || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profil/${username}`);
        const profileData = {
          ...response.data,
          posts: response.data.posts.map((post) => ({
            ...post,
            hasLiked: post.likes.some((like) => like.liked),
          })),
        };
        setProfile(profileData);
      } catch (error) {
        setError(error.response ? error.response.data.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    const checkIsSelf = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${username}`, {
          withCredentials: true,
        });
        setIsSelf(response.data.isSelf);
      } catch (error) {
        console.error('Error checking self profile:', error);
      }
    };

    if (username) {
      fetchProfile();
      checkIsSelf();
    }
  }, [username]);

  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    return `/${url}`;
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post/delete/${postId}`, {
        withCredentials: true,
      });

      if (profile) {
        setProfile({
          ...profile,
          posts: profile.posts.filter((post) => post.id !== postId),
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like/${postId}`, {}, {
        withCredentials: true,
      });

      if (profile) {
        setProfile({
          ...profile,
          posts: profile.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  hasLiked: !post.hasLiked,
                  likes: post.hasLiked
                    ? post.likes.filter((like) => !like.liked)
                    : [...post.likes, { liked: true }],
                }
              : post
          ),
        });
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/follow/${username}`, {}, {
        withCredentials: true,
      });

      if (profile) {
        setProfile({
          ...profile,
          isFollowing: !profile.isFollowing,
          followersCount: profile.isFollowing
            ? profile.followersCount - 1
            : profile.followersCount + 1,
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>No profile found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Profile of {profile.username}</h1>
      {profile.name && <h2 className="text-xl mb-2">Name: {profile.name}</h2>}
      {profile.image && (
        <Image
          src={getAbsoluteUrl(profile.image)}
          alt={profile.username}
          width={96}
          height={96}
          className="rounded-full"
        />
      )}
      <div className="mt-4">
        <span className="font-semibold">Followers:</span> {profile.followersCount}
      </div>
      <div>
        <span className="font-semibold">Following:</span> {profile.followingCount}
      </div>
      {!isSelf && (
        <button
          onClick={handleFollow}
          className={`mt-4 py-1 px-2 rounded ${
            profile.isFollowing ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          } hover:${profile.isFollowing ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          {profile.isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}
      <h2 className="text-xl font-semibold mt-6 mb-4">Posts</h2>
      {profile.posts.length > 0 ? (
        <ul>
          {profile.posts.map((post) => (
            <li key={post.id} className="bg-white shadow rounded-lg p-4 mb-6">
              <Link href={`/${post.id}`}>
                <p className="text-gray-800 mb-2">{post.content}</p>
                {post.mediaUrl && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${post.mediaUrl}`}
                    alt="Post media"
                    width={200}
                    height={200}
                    className="rounded mt-2"
                  />
                )}
              </Link>
              {post.mediaType && <p className="text-gray-600 mt-2">Type: {post.mediaType}</p>}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  {post.hasLiked ? (
                    <FcLike onClick={() => handleLike(post.id)} className="cursor-pointer text-xl" />
                  ) : (
                    <FcLikePlaceholder onClick={() => handleLike(post.id)} className="cursor-pointer text-xl" />
                  )}
                  <span className="text-gray-600 ml-2">{post.likes.filter((like) => like.liked).length} likes</span>
                </div>
                {post.isMine && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );  
};

export default ProfilePage;