import { useNavigate } from "react-router-dom";
import { getAvatar } from "../utils/avatar";

export default function Profile() {
  const navigate = useNavigate();

  // 🔥 FIX LỖI: luôn define user
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // fake posts (sau này connect API)
  const posts = [
    {
      id: 1,
      content: "Hôm nay boss rất ngoan 🐶",
      image: "https://images.unsplash.com/photo-1558788353-f76d92427f16",
    },
    {
      id: 2,
      content: "Dắt boss đi dạo 🌿",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
    },
  ];

  return (
    <div className="bg-[#f5f6f8] min-h-screen">

      {/* ===== COVER ===== */}
      <div className="h-56 bg-gradient-to-r from-orange-400 to-orange-500 relative">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/home")}
          className="fixed top-4 left-4 z-50 bg-white px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
        >
          ← Home
        </button>

        {/* AVATAR */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <img
            src={getAvatar(user?.avatar)}
            className="w-28 h-28 rounded-full border-4 border-white object-cover bg-gray-200 shadow"
          />
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold">
          {user?.displayName || "User"}
        </h2>
        <p className="text-gray-500">
          @{user?.username || "username"}
        </p>

        {/* BIO */}
        <p className="mt-2 text-gray-600 text-sm">
          🐾 Yêu thú cưng • Pet Lover • Cuộc sống cùng boss
        </p>
      </div>

      {/* ===== ACTION ===== */}
      <div className="flex justify-center gap-3 mt-4">
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600">
          Edit Profile
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300">
          Share
        </button>
      </div>

      {/* ===== POSTS ===== */}
      <div className="max-w-2xl mx-auto mt-6 px-4">

        <h3 className="font-semibold mb-3">Bài viết</h3>

        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded-2xl shadow-sm mb-4"
          >
            <p>{post.content}</p>

            {post.image && (
              <img
                src={post.image}
                className="rounded-xl mt-3 w-full"
              />
            )}
          </div>
        ))}

      </div>

    </div>
  );
}