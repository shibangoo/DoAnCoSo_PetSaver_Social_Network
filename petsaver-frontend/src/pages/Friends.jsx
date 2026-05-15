import { useState, useEffect } from "react";
import SidebarLeft from "../components/layout/SidebarLeft";
import Navbar from "../components/layout/Navbar";

import FriendTabs from "../components/friends/FriendTabs";
import FriendCard from "../components/friends/FriendCard";
import FriendRequestCard from "../components/friends/FriendRequestCard";
import { getFriends, getRequests } from "../services/friend.service";
import { getSuggestions } from "../services/auth.service";

export default function Friends() {
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await getFriends();
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await getRequests();
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await getSuggestions();
      setSuggestions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    fetchSuggestions();
  }, []);

  return (
    <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex transition-colors">

      {/* SIDEBAR */}
      <div className="w-64 p-4 hidden lg:block">
        <SidebarLeft />
      </div>

      {/* MAIN */}
      <div className="flex-1 max-w-2xl mx-auto p-4">

        <Navbar />

        <h2 className="text-xl font-bold mb-3 dark:text-white">Friends</h2>

        <FriendTabs tab={tab} setTab={setTab} />

        <div className="space-y-3">

          {tab === "requests" && (
            requests.length > 0 ? requests.map((req) => (
              <FriendRequestCard 
                key={req.id} 
                request={req} 
                onRequestHandled={() => {
                  fetchRequests();
                  fetchFriends();
                }}
              />
            )) : <p className="dark:text-gray-300">Không có lời mời kết bạn nào.</p>
          )}

          {tab === "friends" && (
            loading ? <p className="dark:text-gray-300">Đang tải danh sách bạn bè...</p> : 
            friends.length > 0 ? friends.map((u) => (
              <FriendCard key={u.id} user={u} onFriendRemoved={fetchFriends} />
            )) : <p className="dark:text-gray-300">Bạn chưa có bạn bè nào. Hãy kết bạn thêm nhé!</p>
          )}

          {tab === "suggestions" && (
            suggestions.length > 0 ? suggestions.map((u) => (
              <FriendCard key={u.id} user={u} isSuggestion={true} />
            )) : <p className="dark:text-gray-300">Không có gợi ý nào</p>
          )}

        </div>

      </div>

      {/* RIGHT */}
      <div className="w-80 p-4 hidden xl:block">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold dark:text-white">Tips</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            🐾 Kết bạn để xem nhiều thú cưng hơn!
          </p>
        </div>
      </div>

    </div>
  );
}