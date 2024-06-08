import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ReactCountryFlag from "react-country-flag";
import { getUserInfo, getUserRating, getUserStatus, getProblemset } from '../lib/codeforces';

import Swal from 'sweetalert2';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const UserProfile = ({ handle }) => {
  const [profile, setProfile] = useState(null);
  const lookup = require('country-code-lookup');
  const [ratings, setRatings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
  const [problemsByCategory, setProblemsByCategory] = useState({});
  const [metrics, setMetrics] = useState({});
  const [difficultyDistribution, setDifficultyDistribution] = useState({});
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [problemsByDifficulty, setProblemsByDifficulty] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const calculateSubmissionMetrics = (submissions) => {
          const totalSubmissions = submissions.length;
          const successfulSubmissions = submissions.filter(submission => submission.verdict === 'OK').length;
          const successRate = totalSubmissions > 0 ? ((successfulSubmissions / totalSubmissions) * 100).toFixed(2) : 0;
          return {
            successRate,
            totalSubmissions,
          };
        };

        const metrics = calculateSubmissionMetrics(userStatus);
        setMetrics(metrics);

        const calculateStreaks = (submissions) => {
          let currentStreak = 0;
          let longestStreak = 0;
          let previousDate = null;
          let currentDateStreak = 0;

          submissions.forEach(submission => {
            const submissionDate = new Date(submission.creationTimeSeconds * 1000).toDateString();
            if (previousDate === submissionDate) {
              // Same day submission
              currentDateStreak++;
            } else if (previousDate) {
              // Different day submission
              const previous = new Date(previousDate);
              const current = new Date(submissionDate);
              const diff = (previous - current) / (1000 * 60 * 60 * 24);
              if (diff === 1) {
                // Consecutive day
                currentStreak++;
              } else {
                // Break in streak
                if (currentStreak > longestStreak) {
                  longestStreak = currentStreak;
                }
                currentStreak = 1;
              }
            } else {
              // First submission
              currentStreak = 1;
            }
            previousDate = submissionDate;
          });

          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }

          return { currentStreak, longestStreak };
        };

        const streaks = calculateStreaks(userStatus);
        setMetrics(metrics => ({ ...metrics, ...streaks }));

        const problemsByDifficulty = {};
        userStatus.forEach(submission => {
          if (submission.verdict === 'OK') {
            const difficulty = submission.problem.rating || 'Unrated';
            problemsByDifficulty[difficulty] = (problemsByDifficulty[difficulty] || 0) + 1;
          }
        });
        setProblemsByDifficulty(problemsByDifficulty);

        if (userInfo) {
          const SSI = new Set(userStatus.filter(sub => sub.verdict === 'OK').map(sub => sub.problem.contestId + sub.problem.index));
          setSolvedProblemIds(SSI);

          const userRating = profile?.rating;
          const { problems } = await getProblemset({ tags: '' });

          // Filter recommended problems
          const recommendedProblems = problems
            .filter(problem => problem.rating >= userRating && problem.rating <= userRating + 200)
            .filter(problem => !SSI.has(problem.contestId + problem.index))
            .slice(0, 20);

          setRecommendedProblems(recommendedProblems);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle]);

  const pieData = {
    labels: Object.keys(problemsByCategory),
    datasets: [
      {
        label: '# of Problems Solved',
        data: Object.values(problemsByCategory),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6347', '#32CD32', '#8A2BE2', '#00CED1',
          '#FFD700', '#40E0D0', '#FF69B4', '#CD5C5C', '#1E90FF',
          '#FFA07A', '#8B4513', '#6A5ACD', '#20B2AA', '#778899',
          '#7FFF00', '#D2691E', '#DC143C', '#FF4500', '#DA70D6'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6347', '#32CD32', '#8A2BE2', '#00CED1',
          '#FFD700', '#40E0D0', '#FF69B4', '#CD5C5C', '#1E90FF',
          '#FFA07A', '#8B4513', '#6A5ACD', '#20B2AA', '#778899',
          '#7FFF00', '#D2691E', '#DC143C', '#FF4500', '#DA70D6'
        ],
      },
    ],
  };

  const difficultyLabels = Object.keys(problemsByDifficulty).sort((a, b) => a - b);
  const difficultyData = difficultyLabels.map(label => problemsByDifficulty[label]);

  const barData = {
    labels: difficultyLabels,
    datasets: [
      {
        label: 'Solved Problems',
        data: difficultyData,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#32CD32', '#8A2BE2', '#00CED1',
          '#FFD700', '#40E0D0', '#FF69B4', '#CD5C5C', '#1E90FF',
          '#FFA07A', '#8B4513', '#6A5ACD', '#20B2AA', '#778899',
          '#7FFF00', '#D2691E', '#DC143C', '#FF4500', '#DA70D6'
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">Error: {error}</div>;

  if (!profile) return <div className="text-center mt-8">Profile not found!</div>;

  return (
    <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-4 text-blue-600 text-center">{profile.handle}'s Codeforces Profile</h2>
      <div className="flex items-center mb-4">
        <img src={profile.titlePhoto} alt="Profile" className="w-20 h-20 rounded-full mr-4" />
        <div>
          <h3 className="text-2xl font-semibold">{profile.handle}</h3>
          <p className="text-gray-600">
            Rating: <span className="font-bold">{profile.rating}</span> (Max: {profile.maxRating})
          </p>
          <p className="text-gray-600">
            Rank: <span className="font-bold">{profile.rank}</span> (Max: {profile.maxRank})
          </p>
          <p className="text-gray-600">
            Country: {lookup.byIso(profile.country) ? (
              <span>
                <ReactCountryFlag countryCode={lookup.byIso(profile.country).iso2} svg style={{ marginRight: '8px' }} />
                {lookup.byIso(profile.country).country}
              </span>
            ) : profile.country}
          </p>
          <p className="text-gray-600">
            Friends: <span className="font-bold">{profile.friendOfCount}</span>
          </p>
          <p className="text-gray-600">
            Contribution: <span className="font-bold">{profile.contribution}</span>
          </p>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2 text-blue-600">Stats</h3>
        <p className="text-gray-600">Total Problems Solved: {totalProblemsSolved}</p>
        <p className="text-gray-600">Success Rate: {metrics.successRate}%</p>
        <p className="text-gray-600">Total Submissions: {metrics.totalSubmissions}</p>
        <p className="text-gray-600">Current Streak: {metrics.currentStreak} days</p>
        <p className="text-gray-600">Longest Streak: {metrics.longestStreak} days</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Problems Solved by Category</h3>
          <Pie data={pieData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Problems Solved by Difficulty</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-blue-600">Recommended Problems</h3>
        {recommendedProblems.length > 0 ? (
          <ul>
            {recommendedProblems.map((problem, index) => (
              <li key={index} className="mb-2">
                <a
                  href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {problem.name} (Rating: {problem.rating})
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recommended problems found.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
