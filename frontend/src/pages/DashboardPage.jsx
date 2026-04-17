import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
            Protected Dashboard
          </h2>
          
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome back, {user?.username}!
          </p>
          
          <div className="mt-12">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
              CHUPALA
            </h1>
          </div>
          
          <p className="mt-8 max-w-xl mx-auto text-xl text-gray-500">
            You have successfully authenticated using JWT tokens stored in httpOnly cookies.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-400">
            <span>✓ Secure authentication</span>
            <span>✓ httpOnly cookies</span>
            <span>✓ Protected routes</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
