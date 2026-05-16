import { getAvatar } from "../../utils/avatar";

export default function FriendListModal({ isOpen, onClose, friends, title = "Danh sách bạn bè" }) {
  if (!isOpen) return null;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleNavigate = (friendId) => {
    if (friendId === currentUser.id) {
      window.location.href = '/profile';
    } else {
      window.location.href = `/profile/${friendId}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* MODAL CONTENT */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in flex flex-col max-h-[80vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title} ({friends?.length || 0})</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* LIST */}
        <div className="p-4 overflow-y-auto space-y-3">
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <div 
                key={friend.id} 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={getAvatar(friend.avatar)}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-600 cursor-pointer"
                  onClick={() => handleNavigate(friend.id)}
                />
                <div className="flex-1">
                  <p 
                    className="font-semibold text-gray-800 dark:text-white cursor-pointer hover:underline"
                    onClick={() => handleNavigate(friend.id)}
                  >
                    {friend.displayName || friend.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{friend.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <span className="text-4xl opacity-50 block mb-2">👥</span>
              <p className="text-gray-500 dark:text-gray-400">Không có bạn bè nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
