import { getAvatar } from "../../utils/avatar";
import ReactionButton from "./ReactionButton";
import { FaComment, FaShare, FaMapMarkerAlt, FaCalendarAlt, FaGift } from "react-icons/fa";
import { reactPost } from "../../services/post.service";

export default function PostCard({ post }) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Kiểm tra xem user hiện tại đã thả cảm xúc bài này chưa
  const myReaction = post.reactions?.find(r => r.userId === user?.id)?.type;
  
  const handleReact = async (type) => {
    try {
      await reactPost(post.id, type);
    } catch (err) {
      console.error("Lỗi thả cảm xúc", err);
    }
  };

  const isLost = post.isLostPet;

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm mb-4 border hover:shadow-md transition-shadow animate-fade-in relative overflow-hidden ${isLost ? 'border-red-300 bg-red-50/10' : 'border-gray-50'}`}>

      {isLost && (
        <div className="absolute top-5 right-[-35px] bg-red-600 text-white font-bold text-xs py-1 px-10 rotate-45 shadow-md animate-pulse pointer-events-none z-10">
          SOS
        </div>
      )}

      {/* AUTHOR */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <img
          src={getAvatar(post.author?.avatar)}
          className="w-12 h-12 rounded-full object-cover bg-gray-200 border border-gray-100"
        />

        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-800">
              {post.author?.displayName || "User"}
            </p>
            {isLost && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-200">Tìm thú lạc</span>}
          </div>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* SOS INFO */}
      {isLost && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 text-sm space-y-2">
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
        <p className={`text-gray-700 whitespace-pre-wrap mb-3 text-[15px] ${isLost ? 'font-medium' : ''}`}>{post.content}</p>
      )}

      {/* IMAGE */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mt-3 mb-3 bg-gray-50 border border-gray-100">
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
          <span className="hover:underline cursor-pointer">{post._count?.comments || 0} bình luận</span>
        </div>
      </div>

      <div className="border-t border-gray-100 mb-2"></div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <ReactionButton initialReaction={myReaction} onReact={handleReact} />
        
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-gray-500 font-medium">
          <FaComment className="text-gray-400" />
          <span>Bình luận</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-gray-500 font-medium hidden sm:flex">
          <FaShare className="text-gray-400" />
          <span>Chia sẻ</span>
        </button>
      </div>

    </div>
  );
}