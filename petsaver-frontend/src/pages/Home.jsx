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
    window.scrollTo({ top: 0, behavior: "smooth" }); // optional xịn hơn
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

        {/* 🔥 CLICK → OPEN MODAL */}
        <CreatePost 
          onPostCreated={fetchPosts} 
          onOpen={() => setOpenModal(true)} 
        />

        {loading && <p className="text-center">Loading...</p>}

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-400">
            Chưa có bài viết
          </p>
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

      {/* 🔥 MODAL */}
      <CreatePostModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        user={user}
      />

    </div>
  );
}