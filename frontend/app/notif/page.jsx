"use client";
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link'; 
import { io, Socket } from 'socket.io-client';


const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notif/all`, {
          withCredentials: true,
        });
        const sortedNotifications = response.data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sortedNotifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, { withCredentials: true })
      .then((res) => {
        const userId = res.data.user.id;
        socketRef.current?.emit('userConnected', userId);
      })
      .catch((err) => {
        console.error('Error fetching user session:', err);
      });

    socketRef.current.on('newNotification', (notification) => {
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newNotification');
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      {loading && <p className="text-center py-4">Loading...</p>}
      {error && <p className="text-center text-red-500 py-4">Error: {error}</p>}
      <ul className="space-y-4">
        {notifications.map((notif) => (
          <li key={notif.id} className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-100 transition cursor-default">
            <p className="text-lg font-medium">Type: {notif.type}</p>
            <p className="text-gray-600">Message: {notif.message}</p>
            <p className="text-gray-500 text-sm">{new Date(notif.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            {notif.postId && (
              <p className="mt-2">
                <Link className="text-blue-500 hover:underline" href={`/${notif.postId}`}>
                  View post
                </Link>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;