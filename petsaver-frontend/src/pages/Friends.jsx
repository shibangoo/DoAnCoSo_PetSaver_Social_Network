import { useState } from "react";
import SidebarLeft from "../components/layout/SidebarLeft";
import Navbar from "../components/layout/Navbar";

import FriendTabs from "../components/friends/FriendTabs";
import FriendCard from "../components/friends/FriendCard";
import FriendRequestCard from "../components/friends/FriendRequestCard";

export default function Friends() {
  const [tab, setTab] = useState("requests");

  // 🔥 fake data (sau này connect API)
  const requests = [
    { id: 1, name: "Poodle Lover", username: "poodle", avatar: "" },
    { id: 2, name: "Pet Daddy", username: "petdaddy", avatar: "" },
  ];

  const friends = [
    { id: 3, name: "Happy Paws", username: "happy", avatar: "" },
  ];

  const suggestions = [
    { id: 4, name: "Cat Lover", username: "cat", avatar: "" },
  ];

  return (
    <div className="bg-[#f5f6f8] min-h-screen flex">

      {/* SIDEBAR */}
      <div className="w-64 p-4 hidden lg:block">
        <SidebarLeft />
      </div>

      {/* MAIN */}
      <div className="flex-1 max-w-2xl mx-auto p-4">

        <Navbar />

        <h2 className="text-xl font-bold mb-3">Friends</h2>

        <FriendTabs tab={tab} setTab={setTab} />

        <div className="space-y-3">

          {tab === "requests" &&
            requests.map((u) => (
              <FriendRequestCard key={u.id} user={u} />
            ))}

          {tab === "friends" &&
            friends.map((u) => (
              <FriendCard key={u.id} user={u} />
            ))}

          {tab === "suggestions" &&
            suggestions.map((u) => (
              <FriendCard key={u.id} user={u} />
            ))}

        </div>

      </div>

      {/* RIGHT */}
      <div className="w-80 p-4 hidden xl:block">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold">Tips</h3>
          <p className="text-sm text-gray-500 mt-2">
            🐾 Kết bạn để xem nhiều thú cưng hơn!
          </p>
        </div>
      </div>

    </div>
  );
}