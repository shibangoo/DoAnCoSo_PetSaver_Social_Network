import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { sharePost } from "../../services/post.service";
import toast from "react-hot-toast";
import { getAvatar } from "../../utils/avatar";

export default function SharePostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!isOpen || !post) return null;

  const handleShare = async () => {
    setIsLoading(true);
    try {
      // The shared post ID should be the original post ID
      // If the post we are sharing is already a shared post, we share its parent? 
      // User requested: "if user share their own post, it's similar".
      // Usually, it's safer to share the original post to avoid deep nesting.
      const targetPostId = post.sharedPostId ? post.sharedPostId : post.id;
      
      await sharePost(targetPostId, content);
      toast.success("Đã chia sẻ bài viết thành công!");
      setContent("");
      onClose();
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi chia sẻ bài viết.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const targetPost = post.sharedPost || post;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mx-auto pl-8">Chia sẻ bài viết</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={getAvatar(user?.avatar)}
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {user?.displayName || "Bạn"}
            </span>
          </div>

          <textarea
            className="w-full bg-transparent outline-none resize-none min-h-[80px] text-gray-700 dark:text-gray-200 mb-4"
            placeholder="Nói gì đó về bài viết này..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Shared Post Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-900 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={getAvatar(targetPost.author?.avatar)}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {targetPost.author?.displayName || "User"}
                </p>
                <p className="text-[10px] text-gray-500">
                  {new Date(targetPost.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            {targetPost.content && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">
                {targetPost.content}
              </p>
            )}
            {targetPost.image && (
              <img 
                src={targetPost.image} 
                alt="preview" 
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleShare}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition disabled:opacity-50"
          >
            {isLoading ? "Đang chia sẻ..." : "Chia sẻ ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
