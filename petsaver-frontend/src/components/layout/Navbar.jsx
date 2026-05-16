import { useNavigate } from "react-router-dom";
import { getAvatar } from "../../utils/avatar";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { searchAll } from "../../services/search.service";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], pets: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const res = await searchAll(searchQuery);
          setSearchResults(res.data);
          setShowResults(true);
        } catch (err) {
          console.error("Lỗi tìm kiếm:", err);
        }
      } else {
        setSearchResults({ users: [], posts: [], pets: [] });
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowResults(false);
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất!", { position: "top-center" });
    navigate("/");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 mb-4 transition-colors">

      {/* SEARCH */}
      <div ref={searchRef} className="flex-1 relative">
        <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-600 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
          <input
            placeholder="Search pets, people, tags..."
            className="bg-transparent outline-none w-full text-sm dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setShowResults(true);
            }}
          />
        </div>

        {/* LIVE SEARCH DROPDOWN */}
        {showResults && (searchResults.users.length > 0 || searchResults.pets.length > 0 || searchResults.posts.length > 0) && (
          <div className="absolute top-full mt-2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in max-h-96 overflow-y-auto">
            {/* Users */}
            {searchResults.users.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Mọi người</div>
                {searchResults.users.slice(0, 3).map(u => (
                  <div key={u.id} onClick={() => { setShowResults(false); navigate(`/profile/${u.id}`); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <img src={getAvatar(u.avatar)} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{u.displayName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pets */}
            {searchResults.pets.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Thú cưng</div>
                {searchResults.pets.slice(0, 3).map(p => (
                  <div key={p.id} onClick={() => { setShowResults(false); navigate(`/pet/${p.id}`); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <img src={getAvatar(p.avatar)} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.breed}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts */}
            {searchResults.posts.length > 0 && (
              <div>
                <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Bài viết</div>
                {searchResults.posts.slice(0, 3).map(p => (
                  <div key={p.id} onClick={() => { setShowResults(false); navigate(`/explore?q=${encodeURIComponent(searchQuery)}`); }} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={getAvatar(p.author?.avatar)} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{p.author?.displayName}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-white line-clamp-2">{p.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div 
              onClick={() => { setShowResults(false); navigate(`/explore?q=${encodeURIComponent(searchQuery)}`); }}
              className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 px-4 py-2 text-sm text-orange-500 hover:text-orange-600 cursor-pointer text-center font-medium"
            >
              Xem tất cả kết quả
            </div>
          </div>
        )}
      </div>

      {/* USER & AVATAR */}
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
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
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 border border-gray-100 dark:border-gray-700 z-50 animate-fade-in origin-top-right">
            <div 
              onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 cursor-pointer transition-colors"
            >
              Hồ sơ của tôi
            </div>
            <div 
              onClick={() => { setIsDropdownOpen(false); navigate("/settings"); }}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 cursor-pointer transition-colors"
            >
              Cài đặt
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <div 
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 cursor-pointer transition-colors font-medium"
            >
              Đăng xuất
            </div>
          </div>
        )}
      </div>

    </div>
  );
}