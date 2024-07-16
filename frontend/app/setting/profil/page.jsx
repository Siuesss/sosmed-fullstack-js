'use client'

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleEditProfile = async (e) => {
    e.preventDefault();

    // const trimmedName = name.trim();
    // const trimmedUsername = username.trim();

    // const usernameRegex = /^[a-zA-Z0-9-_.]{3,30}$/;
    // if (trimmedName.length > 0 && trimmedName.length < 4) {
    //   setError('Nama minimal 4 karakter');
    //   setSuccess('');
    //   return;
    // }
    // if (trimmedUsername.length > 0 && !usernameRegex.test(trimmedUsername)) {
    //   setError('Username hanya boleh mengandung huruf, angka, tanda hubung, garis bawah, dan titik');
    //   setSuccess('');
    //   return;
    // }

    const formData = new FormData();
    formData.append('name', name || '');
    formData.append('username', username || '');
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profil/change/profil`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully');
        setError('');
        setName('');
        setUsername('');
        setImage(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      setSuccess('');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={handleEditProfile} className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-black"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-black"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block text-gray-700 mb-2">Profile Image</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;