'use client';

import Link from 'next/link';
import React from 'react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold mt-4">404</h1>
        <p className="text-xl mt-2">Oops! The page you are looking for cannot be found.</p>
        <Link href="/" className="text-blue-500 mt-4 underline">
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;