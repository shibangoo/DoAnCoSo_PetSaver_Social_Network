import { HiOutlineCamera } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";


export default function Profile() {
  const navigate = useNavigate();

  return (
    
    <div className="bg-gray-100 min-h-screen">

      {/* COVER */}
      <div className="relative">
<div className="absolute top-4 left-4">
    <button
      onClick={() => navigate("/home")}
      className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow hover:bg-gray-100"
    >
      ← Trang chủ
    </button>
</div>


        <div className="h-60 bg-gradient-to-r from-blue-400 to-blue-600"></div>

        {/* AVATAR */}
        <div className="absolute -bottom-12 left-10">
          <div className="relative">
            <img
              src="https://i.pravatar.cc/150"
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />

            {/* edit avatar */}
            <button className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full hover:bg-gray-300">
              <HiOutlineCamera />
            </button>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="mt-16 px-10">
        <h1 className="text-2xl font-bold">Hoàng</h1>
        <p className="text-gray-500">Yêu thú cưng 🐶</p>
      </div>
      {/* ACTION BUTTON */}
      <div className="px-10 mt-4 flex gap-3">
      </div>

      {/* TABS */}
      <div className="mt-6 border-t px-10 flex gap-6 text-gray-600">
        <button className="py-3 border-b-2 border-blue-500 text-blue-500">
          Bài viết
        </button>
        <button className="py-3 hover:text-blue-500">Thú cưng</button>
        <button className="py-3 hover:text-blue-500">Giới thiệu</button>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Hoàng</h3>
          <p className="text-gray-500 text-sm">Vừa xong</p>
          <p className="mt-2">Đây là bài viết đầu tiên 🐶</p>
        </div>
      </div>

    </div>
  );
}