// components/ContestPerformance.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getUserInfo, getUserRating } from '../lib/codeforces';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale);

const ContestPerformance = ({ handle }) => {
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      const userInfo = await getUserInfo(handle);
      setProfile(userInfo ? userInfo[0] : null);
      const ratingData = await getUserRating(handle);
      setRatings(ratingData || []);
    };
    fetchRatings();
  }, [handle]);

  const linedata = {
    labels: ratings.map(item => new Date(item.ratingUpdateTimeSeconds * 1000)),
    datasets: [
      {
        label: 'Rating',
        data: ratings.map(item => item.newRating),
        borderColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(0, 0, 0, 0.8)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Initial background color
      },
    ],
  };

  const lineoptions = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
        },
        ticks: {
          display: true, // Show x-axis ticks
        },
        grid: {
          display: false, // Hide x-axis grid lines
        },
      },
      y: {
        beginAtZero: false,
        min: 0,
        max: (Math.ceil((profile?.rating + 200) / 100)) * 100,
      },
    },
    plugins: {
      customBackgroundColor: {
        id: 'customBackgroundColor',
        beforeDraw: (chart) => {
          const { ctx, chartArea: { top, bottom }, scales: { y } } = chart;
          const gradient = ctx.createLinearGradient(0, top, 0, bottom);

          const colors = [
            { stop: 0.25, color: 'rgba(23, 99, 100, 0.2)' }, // Red for low ratings
            { stop: 0.5, color: 'rgba(255, 205, 86, 0.2)' }, // Yellow for medium ratings
            { stop: 0.75, color: 'rgba(75, 192, 192, 0.2)' }, // Green for high ratings
            { stop: 1, color: 'rgba(54, 162, 235, 0.2)' }, // Blue for very high ratings
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

  return (
    <div className='mt-10'>
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Ratings Over Time</h2>
      <Line data={linedata} options={lineoptions} plugins={[lineoptions.plugins.customBackgroundColor]} />
    </div>
  );
};

export default ContestPerformance;
