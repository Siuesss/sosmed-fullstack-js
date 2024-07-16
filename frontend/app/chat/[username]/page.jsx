'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NotFound from '../../not-found';
import { io, Socket } from 'socket.io-client';
import { FaCamera } from 'react-icons/fa';
import Image from 'next/image';

const Chat = () => {
  const params = useParams();
  const encodedUsername = Array.isArray(params.username) ? params.username[0] : params.username;
  const username = decodeURIComponent(encodedUsername);
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSelfChat, setIsSelfChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, { withCredentials: true });
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${username}`, {
          withCredentials: true,
        });
        const { isSelf } = res.data;
        setIsSelfChat(isSelf);

        if (!isSelf) {
          const fetchMessages = async () => {
            try {
              const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/${username}`, {
                withCredentials: true,
              });
              setMessages(res.data);
            } catch (error) {
              setError(error);
            } finally {
              setLoading(false);
            }
          };
          fetchMessages();
        } else {
          setLoading(false);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchCurrentUser();

    socketRef.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.disconnect();
      }
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    if (!content.trim() && !file) {
      setFormError('Content atau file harus diisi.');
      setSending(false);
      return;
    }
    setFormError(null);
    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/${username}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setContent('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error ) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Chat with {username}</h1>
      <div className="messages-container mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message mb-2 flex ${message.sender?.username === username ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${message.sender?.username === username ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
            >
              <strong>{message.sender?.username ?? 'Unknown'}</strong>: {message.content}
              {message.mediaUrl && (
                message.mediaType === 'IMAGE' ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${message.mediaUrl}`}
                    alt="Post media"
                    width={400}
                    height={400}
                    className="rounded mt-2"
                  />
                ) : (
                  <video src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${message.mediaUrl}`} controls width="400" className="rounded mt-2" />
                )
              )}
              <div className="text-xs mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {formError && <div className="text-red-500 mt-2">{formError}</div>}
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
        <button type="submit" disabled={sending} className="ml-2 bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600">
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default Chat;