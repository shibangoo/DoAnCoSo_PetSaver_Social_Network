import { getAvatar } from "../../utils/avatar";

export default function FriendRequestCard({ user }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">

      <div className="flex items-center gap-3">
        <img
          src={getAvatar(user.avatar)}
          className="w-12 h-12 rounded-full object-cover bg-gray-200"
        />

        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm hover:bg-orange-600">
          Accept
        </button>

        <button className="bg-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300">
          Reject
        </button>
      </div>
    </div>
  );
}