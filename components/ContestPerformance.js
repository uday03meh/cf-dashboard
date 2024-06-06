// components/ContestPerformance.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getUserRating } from '../lib/codeforces';

const ContestPerformance = ({ handle }) => {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      const ratingData = await getUserRating(handle);
      setRatings(ratingData || []);
    };
    fetchRatings();
  }, [handle]);

  const data = {
    labels: ratings.map(rating => new Date(rating.ratingUpdateTimeSeconds * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'Contest Rating',
        data: ratings.map(rating => rating.newRating),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Contest Performance</h3>
      <Line data={data} />
    </div>
  );
};

export default ContestPerformance;
