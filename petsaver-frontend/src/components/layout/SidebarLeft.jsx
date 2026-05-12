import {
  HomeSymbol,
  ExploreSymbol,
  FriendsSymbol,
  BellSymbol,
  MessageSymbol,
  SettingSymbol,
} from "../icons/Symbols";

import { useLocation, useNavigate } from "react-router-dom";

/* ================= ITEM ================= */
function Item({ icon, text, active, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200
      ${active 
        ? "bg-orange-50 text-orange-500 scale-[1.02]" 
        : "text-gray-600 hover:bg-gray-100 hover:scale-[1.02]"}`}
    >
      <div className="flex items-center gap-3">

        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-orange-100 transition">
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

  const path = location.pathname;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 h-full">

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
          badge="3"
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
      <button className="mt-6 w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition">
        + Create Post
      </button>
    </div>
  );
}