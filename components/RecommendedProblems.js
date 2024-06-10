import React, { useEffect, useState } from "react";
import { getUserInfo, getUserStatus, getProblemset } from "../lib/codeforces";

const RecommendedProblems = ({ handle }) => {
  const [profile, setProfile] = useState(null);
  const [problems, setProblems] = useState([]);
  const [recommendedProblems, setRecommendedProblems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info to get rating
        const userInfo = await getUserInfo(handle);
        const userProfile = userInfo ? userInfo[0] : null;
        setProfile(userProfile);

        // Fetch user submissions to get solved problems
        const userStatus = await getUserStatus(handle);
        const solvedProblemSet = new Set(
          userStatus
            .filter((submission) => submission.verdict === "OK")
            .map(
              (submission) =>
                `${submission.problem.contestId}${submission.problem.index}`
            )
        );

        // Fetch problemset
        const { problems } = await getProblemset();
        setProblems(problems);

        if (userProfile) {
          const userRating = userProfile.rating;
          const filteredProblems = problems
            .filter(
              (problem) =>
                problem.rating >= userRating &&
                problem.rating <= userRating + 200 &&
                !solvedProblemSet.has(`${problem.contestId}${problem.index}`)
            )
            .slice(0, 10);

          setRecommendedProblems(filteredProblems);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [handle]);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-blue-600">
        Recommended Problems
      </h3>
      <ul>
        {recommendedProblems.map((problem, index) => (
          <li key={index} className="mb-2">
            <a
              href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800"
            >
              {problem.name} {problem.rating && `: ${problem.rating}`}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendedProblems;
