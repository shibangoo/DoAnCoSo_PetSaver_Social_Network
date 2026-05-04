import { useNavigate } from "react-router-dom";

export default function SidebarLeft() {
  const navigate = useNavigate();

  const user = {
    name: "Hoàng",
    avatar: "https://i.pravatar.cc/40",
  };

  return (
    <div className="sticky top-20 space-y-2">

      {/* USER */}
      <div
        onClick={() => navigate("/profile")}
        className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer"
      >
        <img src={user.avatar} className="w-10 h-10 rounded-full" />
        <span className="font-medium">{user.name}</span>
      </div>

      {/* MENU */}
      <div
        onClick={() => navigate("/home")}
        className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer"
      >
        🏠 Trang chủ
      </div>

      <div className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
        🐶 Thú cưng của tôi
      </div>

      <div className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
        📌 Bài đã lưu
      </div>

      <div className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
        ⚙️ Cài đặt
      </div>
    </div>
  );
}