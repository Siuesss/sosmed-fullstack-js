'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AuthSocialButton from '../../../components/AuhSocialButton'
import Link from "next/link";
import { BsGoogle } from 'react-icons/bs';
import clsx from 'clsx';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, { identifier, password }, { withCredentials: true });
      if (response.status === 200) {
        setSuccess('Login successful');
        router.push('/');
        window.location.reload();
      } else {
        setError('Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, { withCredentials: true });
        if (response.data.loggedIn) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 sm:rounded-lg sm:px-10 drop-shadow-md shadow-2xl shadow-blue-500/70 hover:shadow-cyan-600/100">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
          <input
            id="email"
            type="email"
            className={clsx(`
            form-input
            block 
            w-full 
            rounded-md 
            border-0 
            py-1.5 
            text-gray-900 
            shadow-sm 
            ring-1 
            ring-inset 
            ring-gray-300 
            placeholder:text-gray-400 
            focus:ring-2 
            focus:ring-inset 
            focus:ring-sky-600 
            hover:shadow-inner
            sm:text-sm 
            sm:leading-6`
          )}
            placeholder="Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
          <div className="mt-2 relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={clsx(`
          form-input
          block 
          w-full 
          rounded-md 
          border-0 
          py-1.5 
          text-gray-900 
          shadow-sm 
          ring-1 
          ring-inset 
          ring-gray-300 
          placeholder:text-gray-400 
          focus:ring-2 
          focus:ring-inset 
          focus:ring-sky-600 
          hover:shadow-inner
          sm:text-sm 
          sm:leading-6`
        )}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <HiEyeOff className='dark:text-black'/> : <HiEye className='dark:text-black'/>}
          </button>
          </div>
        </div>
        <p className='text-red-500'>{error}</p>
        <p className='text-green-500'>{success}</p>
        <div className="mb-4">
            <br />
          <button
            onClick={handleLogin}
            disabled={!identifier || !password}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Login
          </button>
        </div>
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-500" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white rounded-md px-2 text-gray-700">Or continue with</span>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <AuthSocialButton
            icon={BsGoogle}
            onClick={handleGoogleLogin}
          />
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <p className="font-light text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;