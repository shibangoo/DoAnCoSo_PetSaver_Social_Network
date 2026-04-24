import { HiOutlineHome } from "react-icons/hi";
import { HiOutlineBell } from "react-icons/hi";
import { HiOutlineUser } from "react-icons/hi";
import { useNavigate } from "react-router-dom";



export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
};
  return (
    <div className="bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <h1 className="text-blue-600 font-bold text-xl">PetSaver</h1>

      <input
        type="text"
        placeholder="Tìm kiếm..."
        className="bg-gray-100 px-4 py-2 rounded-full w-96 outline-none"
      />

      <div className="flex items-center gap-6 text-gray-600">
        <HiOutlineHome className="text-2xl cursor-pointer hover:text-blue-500 transition" />
        <HiOutlineBell className="text-2xl cursor-pointer hover:text-blue-500 transition" />
                <HiOutlineUser
  onClick={() => navigate("/profile")}
  className="text-2xl cursor-pointer"
/>
</div>
    </div>
  );
}