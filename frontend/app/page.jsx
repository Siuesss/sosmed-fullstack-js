'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaCamera } from 'react-icons/fa';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [isLog, setIslog] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, { withCredentials: true });
        setIslog(response.data.loggedIn);
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post/content`, {
        withCredentials: true,
      });
      const postsWithLikeStatus = response.data.map((post) => ({
        ...post,
        hasLiked: post.likes.some((like )=> like.liked),
      }));
      const shuffledPosts = postsWithLikeStatus.sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      await fetchPosts();

      setContent('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post/delete/${postId}`, {
        withCredentials: true,
      });

      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like/${postId}`, {}, {
        withCredentials: true,
      });

      await fetchPosts();
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handlerlogout = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      setIslog(response.data.loggedIn);
      await fetchPosts();
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
       {isLog ? (
        <button onClick={handlerlogout}>Logout</button>
      ) : (
        <Link href={'/login'}>Login</Link>
      )}
      <h2 className="text-xl font-semibold mb-4">All Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="bg-white shadow rounded-lg p-4 mb-6">
            <Link href={`/${post.id}`}>
              <p className="text-gray-800 mb-2">{post.content}</p>
              {post.mediaUrl && (
                post.mediaType === 'IMAGE' ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${post.mediaUrl}`}
                    alt="Post media"
                    width={400}
                    height={400}
                    priority={post.id === posts[0].id}
                    className="rounded mt-2"
                  />
                ) : (
                  <video src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${post.mediaUrl}`} controls width="400" className="rounded mt-2" />
                )
              )}
            </Link>
            <div className="mt-2 flex items-center justify-between">
              {isLog && (
                <div className="flex items-center">
                  {post.hasLiked ? (
                    <FcLike onClick={() => handleLike(post.id)} className="cursor-pointer text-xl" />
                  ) : (
                    <FcLikePlaceholder onClick={() => handleLike(post.id)} className="cursor-pointer text-xl" />
                  )}
                  <span className="text-gray-600 ml-2">{post.likes.filter(like => like.liked).length} likes</span>
                </div>
              )}
              {post.isMine && (
                <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
  
      {isLog && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 bg-white shadow p-4 rounded-lg">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              className="flex-1 p-1 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
            />
            <label className="ml-1 cursor-pointer text-blue-500 hover:text-blue-600">
              <FaCamera className="text-lg" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                ref={fileInputRef}
              />
            </label>
            <button type="submit" className="ml-1 bg-blue-500 text-white py-1 px-2 rounded-lg hover:bg-blue-600">Tweet</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostsPage;