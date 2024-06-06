// components/ProblemStatistics.js
import React, { useEffect, useState } from 'react';
import { getProblems } from '../lib/codeforces';

const ProblemStatistics = ({ submissions }) => {
  const [problemStats, setProblemStats] = useState({});

  useEffect(() => {
    const fetchProblemStats = async () => {
      const problemData = await getProblems();
      const stats = problemData.problemStatistics.reduce((acc, problem) => {
        acc[problem.index] = problem;
        return acc;
      }, {});
      setProblemStats(stats);
    };
    fetchProblemStats();
  }, []);

  const solvedProblems = submissions.filter(submission => submission.verdict === 'OK');

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Problem Statistics</h3>
      <ul className="list-disc list-inside">
        {solvedProblems.map((problem, index) => (
          <li key={index}>
            {problem.problem.name} - Rating: {problemStats[problem.problem.index]?.rating || 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemStatistics;
