import React, { useEffect, useState } from 'react';
import { getUserInfo, getUserRating, getUserStatus } from '../lib/codeforces';

const UserProfile = ({ handle }) => {
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
  const [problemsByCategory, setProblemsByCategory] = useState({});
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = await getUserInfo(handle);
        setProfile(userInfo ? userInfo[0] : null);
    
        const userRatings = await getUserRating(handle);
        setRatings(userRatings || []);
    
        const userStatus = await getUserStatus(handle);
        setSubmissions(userStatus || []);
    
        const solvedProblems = userStatus.filter(submission => submission.verdict === 'OK').length;
        setTotalProblemsSolved(solvedProblems);
    
        // Fetch problems by category
        const categories = {};
        userStatus.forEach(submission => {
          submission.problem.tags.forEach(tag => {
            if (categories[tag]) {
              categories[tag]++;
            } else {
              categories[tag] = 1;
            }
          });
        });
        setProblemsByCategory(categories);

        // Calculate submission metrics
        const metrics = calculateSubmissionMetrics(userStatus);
        setMetrics(metrics);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error state or logging as necessary
      }
    };

    fetchData();
  }, [handle]);

  // Function to calculate submission metrics
  const calculateSubmissionMetrics = (submissions) => {
    const totalSubmissions = submissions.length;
    const successfulSubmissions = submissions.filter(submission => submission.verdict === 'OK').length;
    const successRate = totalSubmissions > 0 ? ((successfulSubmissions / totalSubmissions) * 100).toFixed(2) : 0;
    // Calculate more metrics as needed
    return {
      successRate,
      totalSubmissions,
    };
  };

  if (!profile) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-blue-600">
        <a href={`https://codeforces.com/profile/${profile.handle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">{profile.handle}</a>
      </h2>
      <p className="mb-2">
        <strong className="text-lg text-gray-700">Rating:</strong> <span className={`px-4 py-2 ${getRatingColor(profile.rating)}`}>{profile.rating}</span>
      </p>
      <p className="mb-2">
        <strong className="text-lg text-gray-700">Rank:</strong> <span className={`px-2 py-1 ${getRatingColor(profile.rating)} rounded-md`}>{profile.rank}</span>
      </p>
      <p className="mb-4">
        <strong className="text-lg text-gray-700">Max Rating:</strong> <span className={`px-2 py-1 ${getRatingColor(profile.maxRating)} rounded-md`}>{profile.maxRating}</span>
      </p>
  
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Contests Participated ({ratings.length})</h3>
        <table className="min-w-full">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2 text-left">Contest Name</th>
              <th className="px-4 py-2 text-left">Rating</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-4 py-2">
                  <a href={`https://codeforces.com/contest/${rating.contestId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">{rating.contestName}</a>
                </td>
                <td className={`px-4 py-2 ${getRatingColor(rating.newRating)}`}>{rating.newRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Recent Submissions</h3>
        <ul className="space-y-2">
          {submissions.slice(0, 10).map((submission, index) => (
            <li key={index} className={`p-2 rounded-lg ${getSubmissionClass(submission.verdict)}`}>
              <strong className="text-base">{submission.problem.name}:</strong> {submission.verdict}
            </li>
          ))}
        </ul>
      </div>
  
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">User Statistics Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold">Total Problems Solved</p>
            <p>{totalProblemsSolved}</p>
          </div>
          {/* Add more statistics as needed */}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Problems Solved by Category</h3>
        <ul>
          {Object.keys(problemsByCategory).map((category, index) => (
            <li key={index}>
              {category}: {problemsByCategory[category]}
            </li>
          ))}
        </ul>
      </div>

      {metrics && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Submission Efficiency</h3>
          <p>Success Rate: {metrics.successRate}%</p>
          <p>Total Submissions: {metrics.totalSubmissions}</p>
          {/* Add more metrics */}
        </div>
      )}
    </div>
  );
};

// Function to determine rating color class based on rating value
const getRatingColor = (rating) => {
  if (rating >= 1900) {
    return 'bg-purple-700 text-white'; // Adjust this to match your Tailwind CSS class for purple text
  } else if (rating >= 1600) {
    return 'bg-blue-700 text-white'; // Adjust this to match your Tailwind CSS class for blue text
  } else if (rating >= 1400) {
    return 'bg-cyan-700 text-white'; // Adjust this to match your Tailwind CSS class for cyan text
  } else if (rating >= 1200) {
    return 'bg-green-700 text-white'; // Adjust this to match your Tailwind CSS class for green text
  } else {
    return 'bg-gray-200'; // Adjust this to match your Tailwind CSS class for gray text
  }
};

// Function to determine submission background color based on verdict
const getSubmissionClass = (verdict) => {
  switch (verdict) {
    case 'OK':
      return 'bg-green-100';
    case 'TIME_LIMIT_EXCEEDED':
      return 'bg-red-100';
    case 'WRONG_ANSWER':
    case 'RUNTIME_ERROR':
    case 'COMPILATION_ERROR':
      return 'bg-red-100';
    default:
      return '';
  }
};

export default UserProfile;
