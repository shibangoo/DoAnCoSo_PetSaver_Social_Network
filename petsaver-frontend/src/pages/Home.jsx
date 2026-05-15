import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import SidebarLeft from "../components/layout/SidebarLeft";
import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { getPosts } from "../services/post.service";
import CreatePostModal from "../components/post/CreatePostModal";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      console.log("Lỗi load post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const reload = () => {
      fetchPosts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("reloadFeed", reload);

    return () => {
      window.removeEventListener("reloadFeed", reload);
    };
  }, []);

  return (
    <div className="bg-[#f5f6f8] min-h-screen flex">

      {/* LEFT */}
      <div className="w-64 p-4 hidden lg:block">
        <SidebarLeft />
      </div>

      {/* CENTER */}
      <div className="flex-1 max-w-2xl mx-auto p-4">
        <Navbar />

        {/* CLICK → OPEN MODAL */}
        <CreatePost
          onPostCreated={fetchPosts}
          onOpen={() => setOpenModal(true)}
        />

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-4 rounded-2xl shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-48 bg-gray-100 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center flex flex-col items-center justify-center animate-fade-in mb-4">
            <span className="text-6xl mb-4">😿</span>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Meow! Bảng tin trống trơn</h3>
            <p className="text-gray-500 text-sm">Hãy là người đầu tiên đăng bài viết nhé!</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* RIGHT */}
      <div className="w-80 p-4 hidden xl:block">
        <div className="bg-white p-4 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-3">Gợi ý</h3>
          <p>🐶 Pet Lover</p>
        </div>
      </div>

      {/* MODAL */}
      <CreatePostModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        user={user}
      />

    </div>
  );
}