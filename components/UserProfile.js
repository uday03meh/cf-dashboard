import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import ReactCountryFlag from "react-country-flag";
import {
  getUserInfo,
  getUserRating,
  getUserStatus,
  getProblemset,
} from "../lib/codeforces";
import "chartjs-adapter-date-fns";
import RecommendedProblems from "./RecommendedProblems";
import Swal from "sweetalert2";

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale
);

const UserProfile = ({ handle }) => {
  const [profile, setProfile] = useState(null);
  const lookup = require("country-code-lookup");
  const [ratings, setRatings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [totalProblemsSolved, setTotalProblemsSolved] = useState(0);
  const [problemsByCategory, setProblemsByCategory] = useState({});
  const [metrics, setMetrics] = useState({});
  const [difficultyDistribution, setDifficultyDistribution] = useState({});
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [problemsByDifficulty, setProblemsByDifficulty] = useState([]);
  const [solvedProblemIds, setsolvedProblemIds] = useState([]);
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

        const solvedProblems = userStatus.filter(
          (submission) => submission.verdict === "OK"
        ).length;
        setTotalProblemsSolved(solvedProblems);

        // Fetch problems by category
        const categories = {};
        userStatus.forEach((submission) => {
          submission.problem.tags.forEach((tag) => {
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
          const successfulSubmissions = submissions.filter(
            (submission) => submission.verdict === "OK"
          ).length;
          const successRate =
            totalSubmissions > 0
              ? ((successfulSubmissions / totalSubmissions) * 100).toFixed(2)
              : 0;
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

          submissions.forEach((submission) => {
            const submissionDate = new Date(
              submission.creationTimeSeconds * 1000
            ).toDateString();
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
        setMetrics((metrics) => ({ ...metrics, ...streaks }));

        const problemsByDifficulty = {};
        userStatus.forEach((submission) => {
          if (submission.verdict === "OK") {
            const difficulty = submission.problem.rating || "Unrated";
            problemsByDifficulty[difficulty] =
              (problemsByDifficulty[difficulty] || 0) + 1;
          }
        });
        setProblemsByDifficulty(problemsByDifficulty);
        if (userInfo) {
          const SSI = new Set(
            userStatus
              .filter((sub) => sub.verdict === "OK")
              .map((sub) => sub.problem.contestId + sub.problem.index)
          );
          setsolvedProblemIds(SSI);
          console.log(SSI);
          const userRating = profile?.rating;
          // Fetch problemset
          const { problems } = await getProblemset({ tags: "" }); // Adjust tags as needed

          // Filter recommended problems
          console.log("Problems:", problems);
          setProblems(problems);
          const recommendedProblems = problems
            .filter(
              (problem) =>
                problem.rating >= userRating &&
                problem.rating <= userRating + 200
            )
            .filter((problem) => !SSI.has(problem.contestId + problem.index))
            .slice(0, 20);

          setRecommendedProblems(recommendedProblems);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle]);

  // Prepare data for Pie Chart
  const pieData = {
    labels: Object.keys(problemsByCategory),
    datasets: [
      {
        label: "# of Problems Solved",
        data: Object.values(problemsByCategory),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6347",
          "#32CD32",
          "#8A2BE2",
          "#00CED1",
          "#FFD700",
          "#40E0D0",
          "#FF69B4",
          "#CD5C5C",
          "#1E90FF",
          "#FFA07A",
          "#8B4513",
          "#6A5ACD",
          "#20B2AA",
          "#778899",
          "#7FFF00",
          "#D2691E",
          "#DC143C",
          "#FF4500",
          "#DA70D6",
          // Add more colors if you have more categories
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6347",
          "#32CD32",
          "#8A2BE2",
          "#00CED1",
          "#FFD700",
          "#40E0D0",
          "#FF69B4",
          "#CD5C5C",
          "#1E90FF",
          "#FFA07A",
          "#8B4513",
          "#6A5ACD",
          "#20B2AA",
          "#778899",
          "#7FFF00",
          "#D2691E",
          "#DC143C",
          "#FF4500",
          "#DA70D6",
        ],
      },
    ],
  };

  const linedata = {
    labels: ratings.map(
      (item) => new Date(item.ratingUpdateTimeSeconds * 1000)
    ),
    datasets: [
      {
        label: "Rating",
        data: ratings.map((item) => item.newRating),
        borderColor: "rgba(0, 0, 0, 0.6)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(0, 0, 0, 0.8)",
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Initial background color
      },
    ],
  };

  const lineoptions = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
        },
        ticks: {
          display: true, // Hide x-axis ticks
        },
        grid: {
          display: false, // Hide x-axis grid lines
        },
      },
      y: {
        beginAtZero: false,
        min: 0,
        max: Math.ceil((profile?.rating + 200) / 100) * 100,
      },
    },
    plugins: {
      customBackgroundColor: {
        id: "customBackgroundColor",
        beforeDraw: (chart) => {
          const {
            ctx,
            chartArea: { top, bottom },
            scales: { y },
          } = chart;
          const gradient = ctx.createLinearGradient(0, top, 0, bottom);

          const colors = [
            { stop: 0.25, color: "rgba(23, 99, 100, 0.2)" }, // Red for low ratings
            { stop: 0.5, color: "rgba(255, 205, 86, 0.2)" }, // Yellow for medium ratings
            { stop: 0.75, color: "rgba(75, 192, 192, 0.2)" }, // Green for high ratings
            { stop: 1, color: "rgba(54, 162, 235, 0.2)" }, // Blue for very high ratings
          ];

          colors.forEach(({ stop, color }) => {
            gradient.addColorStop(stop, color);
          });

          ctx.save();
          ctx.fillStyle = gradient;
          ctx.fillRect(0, top, chart.width, bottom - top);
          ctx.restore();
        },
      },
    },
  };

  const difficultyLabels = Object.keys(problemsByDifficulty).sort(
    (a, b) => a - b
  );
  const difficultyData = difficultyLabels.map(
    (label) => problemsByDifficulty[label]
  );

  const data = {
    labels: difficultyLabels,
    datasets: [
      {
        label: "Solved Problems",
        data: difficultyData,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#32CD32",
          "#8A2BE2",
          "#00CED1",
          "#FFD700",
          "#40E0D0",
          "#FF69B4",
          "#CD5C5C",
          "#1E90FF",
          "#FFA07A",
          "#8B4513",
          "#6A5ACD",
          "#20B2AA",
          "#778899",
          "#7FFF00",
          "#D2691E",
          "#DC143C",
          "#FF4500",
          "#DA70D6",
        ],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
  console.log(ratings);

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  // if (error) return <div className="text-center mt-8 text-red-500">Error: {error}</div>;

  if (!profile)
    return (
      <div className="text-center text-xl text-red-500 mt-8">
        Profile not found!
      </div>
    );

  return (
    <div className="mx-auto max-w-xl p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-4 text-blue-600 text-center">
        <a
          href={`https://codeforces.com/profile/${profile.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600"
        >
          {profile.handle}
        </a>
      </h2>
      <img
        src={profile.titlePhoto}
        alt={`{profile.handle}'s profile photo`}
        className="w-20 h-20 rounded-full"
      />

      <div className="text-3xl flex gap-4 font-bold mb-4 text-blue-600">
        <div className="my-auto pr-0">
          {profile.firstName != undefined ? ` ${profile.firstName}` : ""}
          {profile.lastName != undefined ? ` ${profile.lastName}` : ""}
        </div>
        <div>
          {profile.country && (
            <ReactCountryFlag
              countryCode={`${lookup.byCountry(`${profile.country}`).fips}`}
              svg
              // style={{
              //     width: '2em',
              //     height: '2em',
              // }}
              title={`${lookup.byCountry(`${profile.country}`).fips}`}
            />
          )}
        </div>
        {/* {console.log(lookup.byCountry("India").fips)} */}
      </div>
      <p className="mb-2">
        <strong className="text-lg text-gray-700">
          Rating:{" "}
          <span
            className={`px-2 py-1 ${getRatingColor(profile.rating)} rounded-md`}
          >
            {" "}
            {profile.rating != undefined ? ` ${profile.rating}` : "unrated"}
          </span>
        </strong>
      </p>
      <p className="mb-2">
        <strong className="text-lg text-gray-700">
          Rank:{" "}
          <span
            className={`px-2 py-1 ${getRatingColor(profile.rating)} rounded-md`}
          >
            {profile.rank != undefined ? ` ${profile.rank}` : "unrated"}
          </span>
        </strong>
      </p>
      {profile.maxRating ? (
        <p className="mb-4">
          <strong className="text-lg text-gray-700">Max Rating:</strong>{" "}
          <span
            className={`px-2 py-1 ${getRatingColor(
              profile.maxRating
            )} rounded-md`}
          >
            <strong>
              {profile.maxRating}
              {` (${getRank(profile.maxRating)}) `}
            </strong>
          </span>
        </p>
      ) : (
        ""
      )}

      <p className="text-gray-600">
        Friends: <span className="font-bold">{profile.friendOfCount}</span>
      </p>
      <p className="text-gray-600">
        Contribution: <span className="font-bold">{profile.contribution}</span>
      </p>
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-2 text-blue-600">
          Contests Participated ({ratings.length})
        </h2>
      </div>
      {ratings.length > 0 ? (
        <div>
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 text-left text-md">#</th>
                <th className="px-4 py-2 text-left text-md">Contest Name</th>
                <th className="px-4 py-2 text-left text-md">Rating</th>
              </tr>
            </thead>
            <tbody>
              {/* {console.log(ratings.reverse())} */}
              {[...ratings].reverse().map((rating, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-4 py-2">{ratings.length - index}.</td>
                  <td className="px-4 py-2">
                    <a
                      href={`https://codeforces.com/contest/${rating.contestId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      {rating.contestName}
                    </a>
                  </td>
                  <td
                    className={`px-2 text-center py-2 min-w-xl ${getDeltaColor(
                      rating.newRating - rating.oldRating
                    )}`}
                  >
                    <strong>
                      {rating.newRating}
                      {rating.newRating - rating.oldRating > 0
                        ? ` (+${rating.newRating - rating.oldRating})`
                        : ` (${rating.newRating - rating.oldRating})`}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        ""
      )}
      {submissions.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">
            Recent Submissions
          </h2>
          <ul className="space-y-2">
            {submissions.slice(0, 10).map((submission, index) => (
              <li
                key={index}
                className={`p-2 rounded-lg ${getSubmissionClass(
                  submission.verdict
                )}`}
              >
                <a
                  href={`https://codeforces.com/problemset/problem/${submission.problem.contestId}/${submission.problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  {" "}
                  {submission.problem.name} :{" "}
                </a>
                <strong
                  className={`${getSubmissionResultColor(submission.verdict)}`}
                >
                  {getSubmissionResult(submission.verdict)}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          No Recent Submissions
        </h2>
      )}

      {totalProblemsSolved > 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg mt-6">
          <h3 className="text-2xl font-bold mb-4 text-blue-600">Stats</h3>
          <p className="text-gray-600">
            Total Problems Solved: {totalProblemsSolved}
          </p>
          <p className="text-gray-600">Success Rate: {metrics.successRate}%</p>
          <p className="text-gray-600">
            Total Submissions: {metrics.totalSubmissions}
          </p>
          <p className="text-gray-600">
            Current Streak: {metrics.currentStreak} days
          </p>
          <p className="text-gray-600">
            Longest Streak: {metrics.longestStreak} days
          </p>
        </div>
      ) : (
        ""
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          Problems Solved by Category
        </h2>
        <Pie data={pieData} />
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          Ratings Over Time
        </h2>
        <Line
          data={linedata}
          options={lineoptions}
          plugins={[lineoptions.plugins.customBackgroundColor]}
        />
      </div>

      <RecommendedProblems handle={handle} />
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">
          Solved Problems by Difficulty
        </h2>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

// Function to determine rating color class based on rating value
const getRatingColor = (rating) => {
  if (rating >= 2100) {
    return "bg-[#FFA12A]"; // Adjust this to match your Tailwind CSS class for purple text
  }
  if (rating >= 1900) {
    return "bg-purple-700 text-white"; // Adjust this to match your Tailwind CSS class for purple text
  } else if (rating >= 1600) {
    return "bg-blue-700 text-white"; // Adjust this to match your Tailwind CSS class for blue text
  } else if (rating >= 1400) {
    return "bg-cyan-600 text-white"; // Adjust this to match your Tailwind CSS class for cyan text
  } else if (rating >= 1200) {
    return "bg-green-700 text-white"; // Adjust this to match your Tailwind CSS class for green text
  } else {
    return "bg-gray-200"; // Adjust this to match your Tailwind CSS class for gray text
  }
};

const getRank = (rating) => {
  if (rating >= 2100) {
    return "Master"; // Adjust this to match your Tailwind CSS class for purple text
  }
  if (rating >= 1900) {
    return "Candidate Master"; // Adjust this to match your Tailwind CSS class for purple text
  } else if (rating >= 1600) {
    return "Expert"; // Adjust this to match your Tailwind CSS class for blue text
  } else if (rating >= 1400) {
    return "Specialist"; // Adjust this to match your Tailwind CSS class for cyan text
  } else if (rating >= 1200) {
    return "Pupil"; // Adjust this to match your Tailwind CSS class for green text
  } else {
    return "Newbie"; // Adjust this to match your Tailwind CSS class for gray text
  }
};

const getDeltaColor = (rating) => {
  if (rating > 0) {
    return "bg-green-700 text-white"; // Adjust this to match your Tailwind CSS class for green text
  } else {
    return "text-black bg-red-400"; // Adjust this to match your Tailwind CSS class for gray text
  }
};

// Function to determine submission background color based on verdict
const getSubmissionClass = (verdict) => {
  switch (verdict) {
    case "OK":
      return "bg-green-100";
    case "TIME_LIMIT_EXCEEDED":
      return "bg-red-100";
    case "WRONG_ANSWER":
    case "RUNTIME_ERROR":
    case "COMPILATION_ERROR":
      return "bg-red-100";
    default:
      return "";
  }
};

const getSubmissionResult = (verdict) => {
  switch (verdict) {
    case "OK":
      return "AC";
    case "TIME_LIMIT_EXCEEDED":
      return "TLE";
    case "WRONG_ANSWER":
      return "WA";
    case "RUNTIME_ERROR":
      return "RE";
    case "COMPILATION_ERROR":
      return "CE";
    default:
      return "";
  }
};

const getSubmissionResultColor = (verdict) => {
  switch (verdict) {
    case "OK":
      return "text-green-500";
    case "TIME_LIMIT_EXCEEDED":
      return "text-red-500";
    case "WRONG_ANSWER":
    case "RUNTIME_ERROR":
    case "COMPILATION_ERROR":
      return "text-red-500";
    default:
      return "";
  }
};

export default UserProfile;
