
'use client'

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { FaVideo } from "react-icons/fa";
import { MdInsertPhoto } from "react-icons/md";


const MessageList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/message/last/me`, {
          withCredentials: true,
        });

        const sortedChats = res.data.sort((a, b) => new Date(b.lastChat).getTime() - new Date(a.lastChat).getTime());
        setChats(sortedChats);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    socketRef.current.on('newMessage', () => {
      fetchChats()
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">Last Chats</h1>
      <ul className="space-y-4">
        {chats.map((chat) => (
          <li key={chat.username} className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-100 transition text-black">
            <a href={`/chat/${chat.username}`} className="flex justify-between items-center">
              <div>
                <strong className="text-lg">{chat.username} : </strong>
                {chat.mediaType === 'IMAGE' ? (
                   <MdInsertPhoto />
                ) : (
                  <strong className="text-lg">{chat.content}</strong>
                )}
                {chat.mediaType === 'VIDEO' ? (
                   <FaVideo />
                ) : (
                  <></>
                )}
                <div className="text-gray-500 text-sm">{new Date(chat.lastChat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;