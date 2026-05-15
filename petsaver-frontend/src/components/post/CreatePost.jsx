import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatar } from "../../utils/avatar";

export default function CreatePost({ onOpen }) {
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-4 border dark:border-gray-700 transition-colors">

      {/* TOP */}
      <div className="flex items-center gap-3">

        {/* AVATAR */}
        <img
          src={getAvatar(user?.avatar)}
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-700
          cursor-pointer transition duration-200
          hover:scale-105 hover:ring-2 hover:ring-orange-400 hover:shadow-md"
        />

        {/* INPUT */}
        <input
          value={content}
          onClick={onOpen} //click mở modal
          readOnly //tránh nhập trực tiếp
          placeholder={`${user?.displayName || "Bạn"} ơi, bạn đang nghĩ gì về thú cưng của mình?`}
          className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-full outline-none text-sm cursor-pointer transition-colors"
        />
      </div>

      {/* LINE */}
      <div className="border-t dark:border-gray-700 my-3 transition-colors"></div>

      {/* ACTION */}
      <div className="flex justify-between items-center">

        {/* BUTTONS */}
        <div className="flex gap-4 text-gray-500 dark:text-gray-400 text-sm">

          <Action icon="image" text="Photo" />
          <Action icon="emoji" text="Feeling" />
          <Action icon="pet" text="Tag Pet" />

        </div>

        {/* POST BTN */}
        <button
          onClick={onOpen} // 🔥 click mở modal
          className="px-5 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Đăng
        </button>

      </div>
    </div>
  );
}

/* ===== ACTION COMPONENT ===== */
function Action({ icon, text }) {
  return (
    <button className="flex items-center gap-2 hover:text-orange-500 transition">

      {icon === "image" && (
        <svg className="w-5 h-5 stroke-orange-500 fill-none stroke-2" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <circle cx="8" cy="10" r="2" />
          <path d="M21 15l-5-5-6 6-3-3-4 4" />
        </svg>
      )}

      {icon === "emoji" && (
        <svg className="w-5 h-5 stroke-orange-500 fill-none stroke-2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1" />
          <circle cx="15" cy="10" r="1" />
          <path d="M8 15c2 2 6 2 8 0" />
        </svg>
      )}

      {icon === "pet" && (
        <svg className="w-5 h-5 stroke-orange-500 fill-none stroke-2" viewBox="0 0 24 24">
          <circle cx="6" cy="9" r="2" />
          <circle cx="18" cy="9" r="2" />
          <circle cx="12" cy="7" r="2" />
          <path d="M5 17c0-3 14-3 14 0 0 2-3 3-7 3s-7-1-7-3z" />
        </svg>
      )}

      <span>{text}</span>
    </button>
  );
}