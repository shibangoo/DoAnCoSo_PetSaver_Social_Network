import { useState } from "react";
import { HiOutlineCamera } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("posts");

  const user = {
    name: "Hoàng",
    bio: "Yêu thú cưng 🐶",
    avatar: "https://i.pravatar.cc/150",
    cover: "https://picsum.photos/800/300",
    followers: 120,
    posts: 5,
  };

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* COVER */}
      <div className="relative">
        <img
          src={user.cover}
          className="w-full h-64 object-cover"
        />

        {/* back button */}
        <button
          onClick={() => navigate("/home")}
          className="absolute top-4 left-4 bg-white px-3 py-2 rounded-full shadow"
        >
          ← Trang chủ
        </button>

        {/* avatar */}
        <div className="absolute -bottom-16 left-10">
          <div className="relative">
            <img
              src={user.avatar}
              className="w-36 h-36 rounded-full border-4 border-white object-cover"
            />

            <button className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full">
              <HiOutlineCamera />
            </button>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="mt-20 px-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.bio}</p>

          {/* stats */}
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span><b>{user.posts}</b> bài viết</span>
            <span><b>{user.followers}</b> followers</span>
          </div>
        </div>

        {/* edit button */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Chỉnh sửa hồ sơ
        </button>
      </div>

      {/* TABS */}
      <div className="mt-6 border-t px-10 flex gap-6 text-gray-600">
        <button
          onClick={() => setTab("posts")}
          className={`py-3 ${tab === "posts" && "border-b-2 border-blue-500 text-blue-500"}`}
        >
          Bài viết
        </button>

        <button
          onClick={() => setTab("pets")}
          className={`py-3 ${tab === "pets" && "border-b-2 border-blue-500 text-blue-500"}`}
        >
          Thú cưng
        </button>

        <button
          onClick={() => setTab("about")}
          className={`py-3 ${tab === "about" && "border-b-2 border-blue-500 text-blue-500"}`}
        >
          Giới thiệu
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto mt-6">

        {tab === "posts" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-500 text-sm">Vừa xong</p>
              <p className="mt-2">Đây là bài viết đầu tiên 🐶</p>
            </div>
          </div>
        )}

        {tab === "pets" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg shadow text-center">
              🐶 Mít
            </div>
            <div className="bg-white p-3 rounded-lg shadow text-center">
              🐱 Shin
            </div>
          </div>
        )}

        {tab === "about" && (
          <div className="bg-white p-4 rounded-lg shadow">
            <p>Người yêu động vật, thích cứu hộ thú cưng 🐾</p>
          </div>
        )}

      </div>
    </div>
  );
}