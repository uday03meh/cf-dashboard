// app/page.js
"use client";
import React, { useState } from 'react';
import UserProfile from '../components/UserProfile'; // Example import of UserProfile component

const Home = () => {
  const [handle, setHandle] = useState('');
  const [submittedHandle, setSubmittedHandle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulating fetch data with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmittedHandle(handle);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      setError('Invalid handle. Please try again.');
      setTimeout(() => {
        setError('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">Codeforces Dashboard</h1>
        <form onSubmit={handleSubmit} className="text-center">
          <div className="flex items-center justify-center mb-4">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter Codeforces Handle"
              className="border rounded p-3 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
        {error && <div className="text-center mt-8 text-red-500">{error}</div>}
        {submittedHandle && <UserProfile handle={submittedHandle} />}
      </div>
    </div>
  );
};

export default Home;
