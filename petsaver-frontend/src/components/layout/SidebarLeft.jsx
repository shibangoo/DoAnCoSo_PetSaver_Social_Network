import {
  HomeSymbol,
  ExploreSymbol,
  FriendsSymbol,
  BellSymbol,
  MessageSymbol,
  SettingSymbol,
} from "../icons/Symbols";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import CreatePostModal from "../post/CreatePostModal";

/* ================= ITEM ================= */
function Item({ icon, text, active, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200
      ${active 
        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500 scale-[1.02]" 
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.02]"}`}
    >
      <div className="flex items-center gap-3">

        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition">
          {icon}
        </div>

        <span className="font-medium">{text}</span>
      </div>

      {badge && (
        <span className="bg-orange-500 text-white text-xs px-2 py-[2px] rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

/* ================= MAIN ================= */
export default function SidebarLeft() {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const path = location.pathname;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await API.get('/notifications/unread-count');
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Lỗi đếm thông báo:", err);
      }
    };
    
    fetchUnreadCount();
    
    // Tạo 1 listener để update count khi có sự kiện (ví dụ realtime comment)
    const interval = setInterval(fetchUnreadCount, 5000); // Polling mỗi 5s cho real-time
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 h-full transition-colors">

      {/* LOGO */}
      <h1
        onClick={() => window.location.reload()}
        className="text-xl font-bold text-orange-500 mb-6 flex items-center gap-2 cursor-pointer"
      >
        🐾 PetSaver
      </h1>

      {/* MENU */}
      <div className="space-y-2">

        <Item
          icon={<HomeSymbol />}
          text="Home"
          active={path === "/home"}
          onClick={() => {
            if (path === "/home") {
              window.dispatchEvent(new Event("reloadFeed"));
            } else {
             navigate("/home");
            }
        }}
        />

        <Item
          icon={<ExploreSymbol />}
          text="Explore"
          active={path === "/explore"}
          onClick={() => navigate("/explore")}
        />

        <Item
          icon={<FriendsSymbol />}
          text="Friends"
          active={path === "/friends"}
          onClick={() => navigate("/friends")}
        />

        <Item
          icon={<BellSymbol />}
          text="Notifications"
          badge={unreadCount > 0 ? unreadCount : null}
          active={path === "/notifications"}
          onClick={() => navigate("/notifications")}
        />

        <Item
          icon={<MessageSymbol />}
          text="Messages"
          active={path === "/messages"}
          onClick={() => navigate("/messages")}
        />

        <Item
          icon={<SettingSymbol />}
          text="Settings"
          active={path === "/settings"}
          onClick={() => navigate("/settings")}
        />

      </div>

      {/* BUTTON */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="mt-6 w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition"
      >
        + Create Post
      </button>

      {/* CREATE POST MODAL */}
      <CreatePostModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        user={user} 
      />
    </div>
  );
}