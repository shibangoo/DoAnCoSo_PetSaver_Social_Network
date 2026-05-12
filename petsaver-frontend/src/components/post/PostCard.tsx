import { getAvatar } from "../../utils/avatar";

export default function PostCard({ post }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">

      {/* AUTHOR */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={getAvatar(post.author?.avatar)}
          className="w-10 h-10 rounded-full object-cover bg-gray-200"
        />

        <div>
          <p className="font-semibold">
            {post.author?.displayName || "User"}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <p>{post.content}</p>

      {/* IMAGE */}
      {post.image && (
        <img
          src={post.image}
          className="rounded-xl mt-3 w-full"
        />
      )}

    </div>
  );
}