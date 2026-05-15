import { getAvatar } from "../../utils/avatar";
import { unfriend, sendFriendRequest } from "../../services/friend.service";
import toast from "react-hot-toast";

export default function FriendCard({ user, onFriendRemoved, isSuggestion = false }) {
  const handleUnfriend = async () => {
    if (window.confirm(`Bạn có chắc muốn hủy kết bạn với ${user.displayName || user.name}?`)) {
      try {
        await unfriend(user.id);
        toast.success("Đã hủy kết bạn!");
        if (onFriendRemoved) onFriendRemoved();
      } catch (err) {
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(user.id);
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (err) {
      toast.error("Không thể gửi kết bạn. Có thể đã gửi rồi.");
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
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* BUTTON */}
      {isSuggestion ? (
        <button 
          onClick={handleAddFriend}
          className="bg-orange-50 text-orange-500 px-4 py-1 rounded-full text-sm hover:bg-orange-100 transition-colors font-medium"
        >
          + Kết bạn
        </button>
      ) : (
        <button 
          onClick={handleUnfriend}
          className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-1 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Hủy kết bạn
        </button>
      )}
    </div>
  );
}