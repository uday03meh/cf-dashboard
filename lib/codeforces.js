// lib/codeforces.js

import axios from "axios";

export const getUserInfo = async (handle) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    // console.log('User Info:', response.data.result);
    return response.data.result;
  } catch (error) {
    // console.error('Error fetching user info:', error);
    return null;
  }
};

export const getUserRating = async (handle) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`
    );
    // console.log('User Rating:', response.data.result);
    return response.data.result;
  } catch (error) {
    // console.error('Error fetching user rating:', error);
    return null;
  }
};

export const getUserStatus = async (handle) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );
    // console.log('User Status:', response.data.result);
    return response.data.result;
  } catch (error) {
    // console.error('Error fetching user status:', error);
    return null;
  }
};

export const getProblemset = async () => {
  try {
    const response = await axios.get(
      "https://codeforces.com/api/problemset.problems"
    );
    // console.log('Problemset:', response.data.result);
    return {
      problems: response.data.result.problems,
      problemStatistics: response.data.result.problemStatistics,
    };
  } catch (error) {
    // console.error('Error fetching problemset:', error);
    return {
      problems: [],
      problemStatistics: [],
    };
  }
};
