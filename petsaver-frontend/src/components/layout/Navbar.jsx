import { useNavigate } from "react-router-dom";
import { getAvatar } from "../../utils/avatar";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white rounded-2xl shadow-sm px-5 py-3 flex items-center gap-4 mb-4">

      {/* SEARCH */}
      <div className="flex-1 flex items-center bg-gray-100 px-4 py-2 rounded-full">
        <input
          placeholder="Search pets, people, tags..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* AVATAR */}
      <img
        src={getAvatar(user?.avatar)}
        onClick={() => navigate("/profile")}
        className="w-10 h-10 rounded-full object-cover bg-gray-200
        cursor-pointer transition duration-200
        hover:scale-105 hover:ring-2 hover:ring-orange-400 hover:shadow-md"
      />

    </div>
  );
}