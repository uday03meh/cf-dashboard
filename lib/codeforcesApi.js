// lib/codeforcesApi.js

const BASE_URL = 'https://codeforces.com/api';

export const fetchData = async (handle) => {
  try {
    const response = await fetch(`${BASE_URL}/user.info?handles=${handle}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
};
