import { useNavigate } from "react-router-dom";
import { getAvatar } from "../../utils/avatar";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất!", { position: "top-center" });
    navigate("/");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 mb-4">

      {/* SEARCH */}
      <div className="flex-1 flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
        <input
          placeholder="Search pets, people, tags..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* USER & AVATAR */}
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user?.displayName || "User"}
        </span>
        
        <img
          src={getAvatar(user?.avatar)}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 rounded-full object-cover bg-gray-200
          cursor-pointer transition-all duration-300
          hover:shadow-md hover:ring-2 hover:ring-orange-400 active:scale-95"
          alt="Avatar"
        />

        {/* DROPDOWN */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50 animate-fade-in origin-top-right">
            <div 
              onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
            >
              Hồ sơ của tôi
            </div>
            <div 
              onClick={() => { setIsDropdownOpen(false); navigate("/settings"); }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
            >
              Cài đặt
            </div>
            <div className="border-t border-gray-100 my-1"></div>
            <div 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors font-medium"
            >
              Đăng xuất
            </div>
          </div>
        )}
      </div>

    </div>
  );
}