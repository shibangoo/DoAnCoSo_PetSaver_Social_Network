import { getAvatar } from "../../utils/avatar";
import { acceptRequest, rejectRequest } from "../../services/friend.service";
import toast from "react-hot-toast";

export default function FriendRequestCard({ request, onRequestHandled }) {
  const user = request.user; // sender

  const handleAccept = async () => {
    try {
      await acceptRequest(request.id);
      toast.success("Đã chấp nhận lời mời kết bạn!");
      if (onRequestHandled) onRequestHandled();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest(request.id);
      toast.success("Đã xóa lời mời!");
      if (onRequestHandled) onRequestHandled();
    } catch (err) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center justify-between border dark:border-gray-700 transition-colors">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img
          src={getAvatar(user.avatar)}
          className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700 cursor-pointer"
          onClick={() => window.location.href = `/profile/${user.id}`}
        />

        <div>
          <p 
            className="font-semibold dark:text-white cursor-pointer hover:underline"
            onClick={() => window.location.href = `/profile/${user.id}`}
          >
            {user.displayName || user.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Đã gửi lời mời cho bạn</p>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleAccept}
          className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm hover:bg-orange-600 font-medium transition"
        >
          Xác nhận
        </button>
        <button 
          onClick={handleReject}
          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}