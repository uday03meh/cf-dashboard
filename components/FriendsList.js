// components/FriendsList.js
import React, { useEffect, useState } from 'react';
import { getUserFriends } from '../lib/codeforces';

const FriendsList = ({ apiKey, apiSig, time }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsData = await getUserFriends(apiKey, apiSig, time);
      setFriends(friendsData || []);
    };
    fetchFriends();
  }, [apiKey, apiSig, time]);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Friends</h3>
      <ul className="list-disc list-inside">
        {friends.map((friend, index) => (
          <li key={index}>{friend}</li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
