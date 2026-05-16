import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAvatar } from "../utils/avatar";
import { getUserProfile } from "../services/auth.service";
import { sendFriendRequest, getUserFriends, acceptRequest, rejectRequest } from "../services/friend.service";
import API from "../services/api";
import PostCard from "../components/post/PostCard";
import PetCard from "../components/pet/PetCard";
import FriendListModal from "../components/profile/FriendListModal";
import Navbar from "../components/layout/Navbar";
import toast from "react-hot-toast";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for actions
  const [showMenu, setShowMenu] = useState(false);
  const [showRespondMenu, setShowRespondMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [openFriendsModal, setOpenFriendsModal] = useState(false);
  
  const menuRef = useRef(null);
  const respondMenuRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleNavigate = (friendId) => {
    if (friendId === currentUser.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${friendId}`);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile(id);
      setProfile(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Người dùng này không khả dụng hoặc đã khóa tài khoản");
        navigate("/home");
      } else {
        toast.error("Không thể tải hồ sơ người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendsList = async () => {
    try {
      const res = await getUserFriends(id);
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách bạn bè:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchFriendsList();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (respondMenuRef.current && !respondMenuRef.current.contains(e.target)) {
        setShowRespondMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddFriend = async () => {
    try {
      const res = await sendFriendRequest(id);
      toast.success("Đã gửi lời mời kết bạn!");
      setProfile({ ...profile, friendshipState: 'SENT_REQUEST', requestId: res.data.request?.id });
    } catch (err) {
      toast.error("Không thể gửi kết bạn. Có thể đã gửi rồi.");
    }
  };

  const handleCancelRequest = async () => {
    try {
      if (profile.requestId) {
        await rejectRequest(profile.requestId);
        toast.success("Đã hủy lời mời kết bạn!");
        setProfile({ ...profile, friendshipState: 'NONE', requestId: null });
      }
    } catch (err) {
      toast.error("Lỗi khi hủy lời mời");
    }
  };

  const handleAcceptRequest = async () => {
    try {
      if (profile.requestId) {
        await acceptRequest(profile.requestId);
        toast.success("Đã chấp nhận kết bạn!");
        setProfile({ ...profile, friendshipState: 'FRIENDS', isFriend: true });
        setShowRespondMenu(false);
        fetchFriendsList(); // Refresh friends list to include the current user
      }
    } catch (err) {
      toast.error("Lỗi khi chấp nhận kết bạn");
    }
  };

  const handleDeclineRequest = async () => {
    try {
      if (profile.requestId) {
        await rejectRequest(profile.requestId);
        toast.success("Đã từ chối lời mời!");
        setProfile({ ...profile, friendshipState: 'NONE', requestId: null });
        setShowRespondMenu(false);
      }
    } catch (err) {
      toast.error("Lỗi khi từ chối lời mời");
    }
  };

  const handleUnfriend = async () => {
    try {
      await API.delete(`/friends/${id}/unfriend`);
      toast.success("Đã hủy kết bạn");
      setProfile({ ...profile, isFriend: false });
      setShowMenu(false);
    } catch (err) {
      toast.error("Lỗi khi hủy kết bạn");
    }
  };

  const handleBlock = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn chặn người này? Họ sẽ không thể xem bài viết hay trang cá nhân của bạn nữa.")) return;
    try {
      await API.post(`/auth/block/${id}`);
      toast.success("Đã chặn người dùng");
      navigate("/home");
    } catch (err) {
      toast.error("Lỗi khi chặn");
    }
  };

  const handleReport = () => {
    if (!reportReason) return toast.error("Vui lòng chọn một lý do");
    toast.success("Cảm ơn bạn đã báo cáo. Đội ngũ PetSaver sẽ xem xét tài khoản này.");
    setShowReportModal(false);
    setReportReason("");
    setShowMenu(false);
  };

  if (loading) {
    return <div className="text-center mt-20 dark:text-white">Đang tải...</div>;
  }

  if (!profile) {
    return null; // Handled in fetchProfile catch block
  }

  return (
    <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen pb-10 transition-colors">
      <div className="max-w-4xl mx-auto pt-4 px-4 hidden lg:block">
        <Navbar />
      </div>

      {/* ===== COVER ===== */}
      <div className="h-56 bg-gradient-to-r from-blue-400 to-indigo-500 relative max-w-4xl mx-auto rounded-b-3xl">
        {profile.coverImage && (
          <img src={profile.coverImage} className="w-full h-full object-cover rounded-b-3xl opacity-90" />
        )}
        
        {/* AVATAR */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <img
            src={getAvatar(profile.avatar)}
            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover bg-white"
          />
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="mt-16 text-center px-4 relative">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {profile.displayName || "Người dùng ẩn danh"}
        </h2>
        
        {/* BIO */}
        <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto bg-orange-50 dark:bg-orange-900/20 py-2 px-4 rounded-3xl border border-orange-100 dark:border-orange-900/30 break-words whitespace-pre-wrap">
          🐾 {profile.bio || (profile.accountType === 'SHELTER' ? 'Tổ chức cứu hộ' : 'Yêu thú cưng • Pet Lover')}
        </p>
      </div>

      {/* ===== ACTION ===== */}
      <div className="flex justify-center items-center gap-3 mt-6 relative">
        {(!profile.friendshipState || profile.friendshipState === 'NONE') && (
          <button 
            onClick={handleAddFriend}
            className="bg-orange-500 text-white px-8 py-2.5 rounded-full font-bold hover:bg-orange-600 hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Kết bạn
          </button>
        )}

        {profile.friendshipState === 'SENT_REQUEST' && (
          <div className="flex gap-2">
            <button className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-6 py-2.5 rounded-full font-bold cursor-default border border-gray-200 dark:border-gray-600">
              Chờ phản hồi
            </button>
            <button 
              onClick={handleCancelRequest}
              className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-6 py-2.5 rounded-full font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-900/30"
            >
              Hủy lời mời
            </button>
          </div>
        )}

        {profile.friendshipState === 'RECEIVED_REQUEST' && (
          <div className="relative" ref={respondMenuRef}>
            <button 
              onClick={() => setShowRespondMenu(!showRespondMenu)}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 hover:shadow-md transition-all flex items-center gap-2"
            >
              Phản hồi
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {showRespondMenu && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in text-sm font-medium">
                <button onClick={handleAcceptRequest} className="w-full text-left px-4 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-gray-700">
                  Chấp nhận
                </button>
                <button onClick={handleDeclineRequest} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Từ chối
                </button>
              </div>
            )}
          </div>
        )}

        {profile.friendshipState === 'FRIENDS' && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
            >
              Bạn bè
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            </button>

            {showMenu && (
              <div className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in text-sm font-medium">
                <button onClick={handleUnfriend} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Hủy kết bạn
                </button>
                <button onClick={() => { setShowReportModal(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-700">
                  Báo cáo tài khoản
                </button>
                <button onClick={handleBlock} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700">
                  Chặn người dùng
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== TWO COLUMNS ===== */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 px-4">
        
        {/* LEFT COLUMN: PETS */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 sticky top-4">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">Thú cưng ({profile.pets?.length || 0})</h3>
            
            <div className="space-y-4">
              {profile.pets && profile.pets.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profile.pets.map(pet => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                  <span className="text-3xl opacity-50 mb-2 block">😿</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có bé nào</p>
                </div>
              )}
            </div>
          </div>

          {/* FRIENDS SECTION */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 sticky top-[22rem] mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Bạn bè ({friends.length})</h3>
              {friends.length > 0 && (
                <button 
                  onClick={() => setOpenFriendsModal(true)}
                  className="text-orange-500 text-sm hover:underline font-medium"
                >
                  Xem tất cả
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {friends.length > 0 ? (
                friends.slice(0, 6).map(friend => (
                  <img
                    key={friend.id}
                    src={getAvatar(friend.avatar)}
                    title={friend.displayName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700 cursor-pointer border border-gray-100 dark:border-gray-600 hover:scale-105 transition-transform"
                    onClick={() => handleNavigate(friend.id)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 w-full text-center py-2">
                  Chưa có bạn bè nào
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POSTS */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 px-2">Bài viết</h3>

          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 text-center border border-gray-100 dark:border-gray-700 animate-fade-in">
              <span className="text-5xl opacity-50 block mb-4">📝</span>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có bài viết nào.</p>
            </div>
          )}
        </div>

      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 animate-fade-in">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Báo cáo người dùng</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Vui lòng chọn vấn đề mà bạn cho rằng người dùng này đang vi phạm:</p>
            
            <div className="space-y-2 mb-6">
              {['Có hành vi thiếu chuẩn mực', 'Ngôn ngữ vi phạm tiêu chuẩn cộng đồng', 'Vi phạm bản quyền', 'Người dùng mạo danh', 'Bạo hành thú cưng'].map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-700 transition">
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={reason} 
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="dark:text-white text-sm font-medium">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleReport}
                disabled={!reportReason}
                className={`px-6 py-2 rounded-xl text-white font-bold transition ${reportReason ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-300 cursor-not-allowed'}`}
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      <FriendListModal
        isOpen={openFriendsModal}
        onClose={() => setOpenFriendsModal(false)}
        friends={friends}
        title={`Bạn bè của ${profile.displayName}`}
      />

    </div>
  );
}
