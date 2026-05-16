import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getExploreContent, searchAll } from "../services/search.service";
import PostCard from "../components/post/PostCard";
import PetCard from "../components/pet/PetCard";
import { getAvatar } from "../utils/avatar";
import Navbar from "../components/layout/Navbar";
import SidebarLeft from "../components/layout/SidebarLeft";

export default function Explore() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exploreData, setExploreData] = useState({ posts: [], users: [], pets: [] });
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], pets: [] });
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, USERS, POSTS, PETS

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (query) {
          const res = await searchAll(query);
          setSearchResults(res.data);
        } else {
          const res = await getExploreContent();
          setExploreData(res.data);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu Explore:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    // SEARCH MODE
    if (query) {
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Kết quả tìm kiếm cho: <span className="text-orange-500">"{query}"</span>
            </h2>
            
            {/* TABS */}
            <div className="flex gap-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
              {['ALL', 'USERS', 'POSTS', 'PETS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? "border-b-2 border-orange-500 text-orange-500" 
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {tab === 'ALL' && "Tất cả"}
                  {tab === 'USERS' && `Mọi người (${searchResults.users.length})`}
                  {tab === 'POSTS' && `Bài viết (${searchResults.posts.length})`}
                  {tab === 'PETS' && `Thú cưng (${searchResults.pets.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS */}
          <div className="space-y-6">
            {/* USERS */}
            {(activeTab === 'ALL' || activeTab === 'USERS') && searchResults.users.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 px-2">Mọi người</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.users.map(u => (
                    <div key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                      <img src={getAvatar(u.avatar)} className="w-14 h-14 rounded-full object-cover border border-gray-100" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-800 dark:text-white truncate">{u.displayName}</p>
                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PETS */}
            {(activeTab === 'ALL' || activeTab === 'PETS') && searchResults.pets.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 px-2">Thú cưng</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.pets.map(p => (
                    <PetCard key={p.id} pet={p} />
                  ))}
                </div>
              </div>
            )}

            {/* POSTS */}
            {(activeTab === 'ALL' || activeTab === 'POSTS') && searchResults.posts.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 px-2">Bài viết</h3>
                <div className="space-y-4 max-w-2xl">
                  {searchResults.posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* NO RESULTS */}
            {searchResults.users.length === 0 && searchResults.pets.length === 0 && searchResults.posts.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <span className="text-5xl opacity-50 block mb-4">🔍</span>
                <p className="text-gray-500 dark:text-gray-400">Không tìm thấy kết quả nào phù hợp.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // EXPLORE MODE
    return (
      <div className="space-y-8">
        {/* SUGGESTED USERS */}
        {exploreData.users.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 px-2">Những người bạn có thể biết</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
              {exploreData.users.map(u => (
                <div key={u.id} className="min-w-[160px] bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center snap-center border border-gray-100 dark:border-gray-700">
                  <img src={getAvatar(u.avatar)} className="w-20 h-20 rounded-full object-cover mb-3 shadow-sm border-2 border-white dark:border-gray-700" />
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate w-full">{u.displayName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full mb-3">{u.bio || 'Pet Lover'}</p>
                  <button 
                    onClick={() => navigate(`/profile/${u.id}`)}
                    className="w-full py-1.5 text-sm font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Xem hồ sơ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTED PETS */}
        {exploreData.pets.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 px-2">Khám phá thú cưng</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
              {exploreData.pets.map(p => (
                <PetCard key={p.id} pet={p} />
              ))}
            </div>
          </div>
        )}

        {/* TRENDING POSTS */}
        {exploreData.posts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 px-2">Bài viết thịnh hành</h2>
            <div className="space-y-4 max-w-2xl">
              {exploreData.posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex transition-colors">
      {/* LEFT SIDEBAR */}
      <div className="w-64 p-4 hidden lg:block sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <SidebarLeft />
      </div>

      {/* CENTER CONTENT */}
      <div className="flex-1 max-w-4xl mx-auto p-4 w-full">
        <Navbar />
        {renderContent()}
      </div>
    </div>
  );
}


