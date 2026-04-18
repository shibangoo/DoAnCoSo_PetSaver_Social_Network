import { FaThumbsUp } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa";
import { FaShare } from "react-icons/fa";
import ReactionButton from "./ReactionButton";

export default function PostCard({ post }) {
  if (!post) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div>
          <h3 className="font-semibold">{post.author?.name}</h3>
          <p className="text-sm text-gray-500">Vừa xong</p>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3">{post.content}</p>

      {/* Actions */}
      <div className="flex justify-between border-t pt-2 text-gray-600">
  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded w-full justify-center">
     <ReactionButton />
  </button>

  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded w-full justify-center">
    <FaRegCommentDots />
    <span>Bình luận</span>
  </button>

  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded w-full justify-center">
    <FaShare />
    <span>Chia sẻ</span>
  </button>
</div>
    </div>
  );
}