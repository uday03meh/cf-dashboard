// lib/codeforces.js
import axios from 'axios';

const API_BASE_URL = 'https://codeforces.com/api';

export const fetchData = async (methodName, params = {}) => {
  const url = `${API_BASE_URL}/${methodName}`;
  try {
    const response = await axios.get(url, { params });
    if (response.data.status === 'OK') {
      return response.data.result;
    } else {
      throw new Error(response.data.comment);
    }
  } catch (error) {
    console.error('Error fetching data from Codeforces API:', error);
    return null;
  }
};

export const getUserInfo = (handle) => fetchData('user.info', { handles: handle });
export const getUserRating = (handle) => fetchData('user.rating', { handle });
export const getUserStatus = (handle) => fetchData('user.status', { handle, from: 1 });
export const getUserFriends = (apiKey, apiSig, time) => fetchData('user.friends', { apiKey, apiSig, time });
export const getProblems = () => fetchData('problemset.problems');
