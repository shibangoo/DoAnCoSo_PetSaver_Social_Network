import {
  HiOutlineHome,
  HiOutlineBell,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 🔥 fake user (sau này thay bằng API)
  const user = {
    name: "Hoàng",
    avatar: "https://i.pravatar.cc/40",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-50">

      {/* LOGO */}
      <h1
        onClick={() => navigate("/home")}
        className="text-blue-600 font-bold text-xl cursor-pointer"
      >
        PetSaver
      </h1>

      {/* SEARCH */}
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Tìm kiếm thú cưng..."
          className="w-full bg-gray-100 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6 text-gray-600">

        {/* HOME */}
        <HiOutlineHome
          onClick={() => navigate("/home")}
          className="text-2xl cursor-pointer hover:text-blue-500 transition"
        />

        {/* NOTIFICATION */}
        <div className="relative cursor-pointer">
          <HiOutlineBell className="text-2xl hover:text-blue-500 transition" />
          
          {/* badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
            3
          </span>
        </div>

        {/* AVATAR + DROPDOWN */}
        <div className="relative">

          {/* avatar */}
          <img
            src={user.avatar}
            onClick={() => setOpen(!open)}
            className="w-9 h-9 rounded-full cursor-pointer border"
          />

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border animate-fadeIn">

              {/* user info */}
              <div className="px-4 py-3 border-b">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">Xem trang cá nhân</p>
              </div>

              {/* menu */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                👤 Trang cá nhân
              </button>

              <button
                onClick={() => {
                  navigate("/home");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                🏠 Trang chủ
              </button>

              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                ⚙️ Cài đặt
              </button>

              <hr />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}