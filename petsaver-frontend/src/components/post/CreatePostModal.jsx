import { getAvatar } from "../../utils/avatar";

export default function CreatePostModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* OVERLAY */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div className="relative bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-lg p-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg dark:text-white">
            Tạo bài viết
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* USER */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={getAvatar(user?.avatar)}
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium dark:text-white">
            {user?.displayName || "User"}
          </span>
        </div>

        {/* TEXTAREA */}
        <textarea
          placeholder="Bạn đang nghĩ gì?"
          className="w-full h-28 resize-none outline-none bg-transparent text-lg
          text-black dark:text-white placeholder-gray-400"
        />

        {/* ACTIONS */}
        <div className="mt-4 border dark:border-gray-700 rounded-xl p-3 flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Thêm vào bài viết của bạn</span>

          <div className="flex gap-3">
            <span>📷</span>
            <span>😊</span>
            <span>📍</span>
          </div>
        </div>

        {/* BUTTON */}
        <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600">
          Đăng
        </button>

      </div>
    </div>
  );
}