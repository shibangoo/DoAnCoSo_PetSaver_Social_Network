export default function PostCard({ post }) {
  if (!post) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div>
          <p className="font-semibold">{post.author?.name}</p>
          <p className="text-xs text-gray-500">Vừa xong</p>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 text-gray-800">{post.content}</p>

      {/* Actions */}
      <div className="flex justify-around mt-4 text-gray-600 text-sm border-t pt-2">
        <button>👍 Thích</button>
        <button>💬 Bình luận</button>
        <button>↗️ Chia sẻ</button>
      </div>
    </div>
  );
}