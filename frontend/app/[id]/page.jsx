'use client';

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NotFound from "../not-found";
import Image from 'next/image';
import { FcLike, FcLikePlaceholder } from "react-icons/fc";

const PostById= () => {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [post, setPost] = useState(null);
    const [isLog, setIslog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState(false);

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
      }, []);

    const fetchPost = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post/${id}`, {
                withCredentials: true,
            });
            const postWithLikeStatus = {
                ...res.data,
                hasLiked: res.data.likes.length > 0 && res.data.likes.some((like) => like.liked),
            };
            setPost(postWithLikeStatus);
        } catch (err) {
            setError(err ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setComment(true);
    
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/comment/create/${id}`, {
            content,
          }, { withCredentials: true });
    
          setContent('');
          fetchPost();
        } catch (error) {
          setError(error ? error.message : 'gagal mengirim comment');
        } finally {
          setComment(false);
        }
      };

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id, fetchPost]);

    const handleLike = async (postId) => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like/${postId}`, {}, {
                withCredentials: true,
            });
            fetchPost();
        } catch (error) {
            console.error('Error liking/unliking post:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!post) {
        return <NotFound />;
    }

    const isCreator = (username) => username === post.author.username;

    const likeCount = post.likes.filter(like => like.liked).length;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="post-section">
              <h1 className="text-xl font-bold mb-2">Post by {post.author.username}</h1>
              <p className="text-gray-800 mb-4">{post.content}</p>
              {post.mediaUrl && (
                <div className="mb-4">
                  {post.mediaType === 'IMAGE' ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${post.mediaUrl}`}
                      alt="Post media"
                      width={200}
                      height={150}
                      layout="responsive"
                      className="rounded-lg"
                    />
                  ) : (
                    <video
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${post.mediaUrl}`}
                      controls
                      className="rounded-lg"
                      width="200" 
                      height="150"
                    />
                  )}
                </div>
              )}
              {isLog && (
                <div className="flex items-center mb-4">
                  {post.hasLiked ? (
                    <FcLike onClick={() => handleLike(post.id)} className="cursor-pointer text-xl" />
                  ) : (
                    <FcLikePlaceholder onClick={() => handleLike(post.id)} className="cursor-pointer text-xl" />
                  )}
                  <span className="text-gray-600 ml-2">{likeCount} likes</span>
                </div>
              )}
            </div>
            {isLog && (
              <div>
                <form onSubmit={handleSubmit} className="mb-4">
                  <input
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a comment..."
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    disabled={comment}
                  >
                    {comment ? 'Commenting...' : 'Send Comment'}
                  </button>
                </form>
              </div>
            )}
            <div className="comments-section">
              <h2 className="text-lg font-semibold mb-2">Comments</h2>
              {post.comments.map((comment, index) => (
                <div key={index} className="mb-2">
                  <p className="text-gray-800 mb-1">{comment.content}</p>
                  <p className="text-gray-600">
                    by {comment.author.username} {isCreator(comment.author.username) && '- creator'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      
};

export default PostById;