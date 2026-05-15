import { getAvatar } from "../../utils/avatar";
import ReactionButton from "./ReactionButton";
import { FaComment, FaShare, FaMapMarkerAlt, FaCalendarAlt, FaGift, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { reactPost, deletePost } from "../../services/post.service";
import { useState } from "react";
import toast from "react-hot-toast";
import EditPostModal from "./EditPostModal";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onPostUpdated }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const isAuthor = Number(user?.id) === Number(post.authorId);
  
  // Kiểm tra xem user hiện tại đã thả cảm xúc bài này chưa
  const myReaction = post.reactions?.find(r => r.userId === user?.id)?.type;
  
  const handleReact = async (type) => {
    try {
      await reactPost(post.id, type);
    } catch (err) {
      console.error("Lỗi thả cảm xúc", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await deletePost(post.id);
        toast.success("Đã xóa bài viết!");
        if (onPostUpdated) onPostUpdated();
      } catch (err) {
        toast.error("Có lỗi xảy ra khi xóa bài viết.");
      }
    }
  };

  const handleReport = () => {
    toast.success("Đã gửi báo cáo người dùng. Cảm ơn bạn!");
    setShowNotiModal(false);
  };

  const handleHide = () => {
    toast.success("Đã ẩn bài viết này.");
    setShowNotiModal(false);
  };

  const handleXClick = () => {
    setShowNotiModal(true);
  };

  const isLost = post.isLostPet;

  return (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm mb-4 border dark:border-gray-700 hover:shadow-md transition-shadow animate-fade-in relative overflow-hidden ${isLost ? 'border-red-300 dark:border-red-500 bg-red-50/10' : 'border-gray-50'}`}>

      {isLost && (
        <div className="absolute top-5 right-[-35px] bg-red-600 text-white font-bold text-xs py-1 px-10 rotate-45 shadow-md animate-pulse pointer-events-none z-10">
          SOS
        </div>
      )}

      {/* AUTHOR */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <img
          src={getAvatar(post.author?.avatar)}
          className="w-12 h-12 rounded-full object-cover bg-gray-200 border border-gray-100 cursor-pointer hover:opacity-80 transition"
          onClick={() => window.location.href = `/profile/${post.author?.id}`}
        />

        <div>
          <div className="flex items-center gap-2">
            <p 
              className="font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:underline"
              onClick={() => window.location.href = `/profile/${post.author?.id}`}
            >
              {post.author?.displayName || "User"}
            </p>
            {isLost && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-200">Tìm thú lạc</span>}
          </div>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        {/* X BUTTON & EDIT MENU */}
        <div className="absolute right-0 top-0 flex items-center gap-2">
          {isAuthor && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50 transition"
              title="Chỉnh sửa bài viết"
            >
              <FaEdit />
            </button>
          )}

          <button 
            onClick={handleXClick}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
            title="Xóa / Tùy chọn"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* SOS INFO */}
      {isLost && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-xl p-3 mb-3 text-sm space-y-2">
          {post.lastSeenLocation && (
            <div className="flex items-start gap-2 text-red-800">
              <FaMapMarkerAlt className="mt-0.5 text-red-500 shrink-0" />
              <p><strong>Khu vực lạc:</strong> {post.lastSeenLocation}</p>
            </div>
          )}
          {post.lostDate && (
            <div className="flex items-center gap-2 text-red-800">
              <FaCalendarAlt className="text-red-500 shrink-0" />
              <p><strong>Ngày thất lạc:</strong> {new Date(post.lostDate).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
          {post.reward && (
            <div className="flex items-center gap-2 text-red-800">
              <FaGift className="text-red-500 shrink-0" />
              <p><strong>Hậu tạ:</strong> <span className="font-bold">{post.reward}</span></p>
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      {post.content && (
        <p className={`text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-3 text-[15px] ${isLost ? 'font-medium' : ''}`}>{post.content}</p>
      )}

      {/* IMAGE */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mt-3 mb-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
          <img
            src={post.image}
            className="w-full h-auto max-h-[500px] object-cover"
            alt="Post content"
          />
        </div>
      )}
      
      {/* STATS */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3 px-2">
        <div className="flex items-center gap-1">
          <span className="bg-orange-100 text-orange-500 p-1 rounded-full text-[10px]">🐾</span>
          <span>{post.reactions?.length || 0} cảm xúc</span>
        </div>
        <div className="flex gap-4">
          <span 
            className="hover:underline cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          >
            {post._count?.comments || 0} bình luận
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 mb-2"></div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <ReactionButton initialReaction={myReaction} onReact={handleReact} />
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all font-medium ${showComments ? 'text-orange-500 bg-orange-50 dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <FaComment className={showComments ? 'text-orange-500' : 'text-gray-400'} />
          <span>Bình luận</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all text-gray-500 dark:text-gray-400 font-medium hidden sm:flex">
          <FaShare className="text-gray-400" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* COMMENT SECTION */}
      {showComments && <CommentSection postId={post.id} postAuthorId={post.authorId} />}

      <EditPostModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        currentPost={post} 
        onPostUpdated={onPostUpdated} 
      />

      {/* NOTI MODAL FOR ALL */}
      {showNotiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 relative shadow-xl text-center">
            <button 
              onClick={() => setShowNotiModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
            
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Tùy chọn bài viết</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Bạn muốn thực hiện hành động nào với bài viết {isAuthor ? "này" : `của ${post.author?.displayName || "người này"}`}?
            </p>
            
            <div className="space-y-3">
              {isAuthor ? (
                <button 
                  onClick={() => {
                    setShowNotiModal(false);
                    handleDelete();
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                >
                  <FaTrash /> Xóa bài viết
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleHide}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    🚫 Hạn chế / Ẩn bài viết này
                  </button>
                  <button 
                    onClick={handleReport}
                    className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    🚩 Báo cáo người dùng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}