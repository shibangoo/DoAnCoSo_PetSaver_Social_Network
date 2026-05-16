import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLeft from "../components/layout/SidebarLeft";
import Navbar from "../components/layout/Navbar";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Lỗi lấy thông báo", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsReadAndNavigate = async (notif) => {
    // If not read, call read api
    if (!notif.isRead) {
      try {
        await API.post(`/notifications/${notif.id}/read`);
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error(err);
      }
    }
    
    // Navigate based on type
    if (notif.type === 'REACTION' || notif.type === 'COMMENT') {
      navigate('/home', { state: { scrollToPostId: notif.referenceId } });
    } else if (notif.type === 'FRIEND_REQUEST') {
      if (notif.referenceId) navigate(`/profile/${notif.referenceId}`);
      else navigate('/friends');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setOpenMenuId(null);
      toast.success("Đã xóa thông báo");
    } catch (err) {
      toast.error("Lỗi khi xóa thông báo");
    }
  };

  return (
    <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex transition-colors">
      
      {/* SIDEBAR */}
      <div className="w-64 p-4 hidden lg:block">
        <SidebarLeft />
      </div>

      {/* MAIN */}
      <div className="flex-1 max-w-2xl mx-auto p-4">
        <Navbar />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Thông báo</h2>
          {!loading && notifications.length > 0 && (
            <span className="text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              {notifications.filter(n => !n.isRead).length} chưa đọc
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          {loading ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">Đang tải thông báo...</p>
          ) : notifications.length > 0 ? (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => markAsReadAndNavigate(notif)}
                className={`group relative p-4 border-b border-gray-50 dark:border-gray-700 cursor-pointer transition-colors flex items-start gap-3 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0
                  ${notif.isRead 
                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750' 
                    : 'bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
              >
                {/* ICON DỰA THEO LOẠI */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                  ${notif.type === 'REACTION' ? 'bg-red-100 text-red-500' : 
                    notif.type === 'COMMENT' ? 'bg-blue-100 text-blue-500' : 
                    notif.type === 'FRIEND_REQUEST' ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-500'}`}
                >
                  {notif.type === 'REACTION' ? '❤️' : notif.type === 'COMMENT' ? '💬' : notif.type === 'FRIEND_REQUEST' ? '👋' : '🔔'}
                </div>

                <div className="flex-1">
                  <p className={`text-[15px] ${notif.isRead ? 'text-gray-600 dark:text-gray-300 font-normal' : 'text-gray-800 dark:text-white font-semibold'}`}>
                    {notif.message || notif.content}
                  </p>
                  <p className={`text-xs mt-1 ${notif.isRead ? 'text-gray-400' : 'text-orange-500 font-medium'}`}>
                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                {/* DẤU CHẤM XANH NẾU CHƯA ĐỌC */}
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-3 flex-shrink-0"></div>
                )}

                {/* 3 CHẤM BÊN PHẢI (CHỈ HIỆN KHI HOVER) */}
                <div 
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${openMenuId === notif.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  ref={openMenuId === notif.id ? menuRef : null}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === notif.id ? null : notif.id); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-600"
                  >
                    •••
                  </button>

                  {/* MENU DROPDOWN */}
                  {openMenuId === notif.id && (
                    <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-10 animate-fade-in">
                      <button 
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Xóa thông báo
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                <span className="text-4xl block opacity-50">🔕</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Không có thông báo mới</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Các thông báo cũ hơn 7 ngày đã được hệ thống tự động xóa.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
