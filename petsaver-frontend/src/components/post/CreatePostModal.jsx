import { useState, useRef } from "react";
import { getAvatar } from "../../utils/avatar";
import { createPost } from "../../services/post.service";
import toast from "react-hot-toast";

export default function CreatePostModal({ isOpen, onClose, user }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  
  // SOS Fields
  const [isLostPet, setIsLostPet] = useState(false);
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [reward, setReward] = useState("");
  const [lostDate, setLostDate] = useState("");

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      setContent("");
      setImage(null);
      setIsLostPet(false);
      setLastSeenLocation("");
      setReward("");
      setLostDate("");
      onClose();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB", { position: "top-center" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      toast.error("Vui lòng nhập nội dung hoặc thêm ảnh", { position: "top-center" });
      return;
    }

    if (isLostPet && !lastSeenLocation.trim()) {
      toast.error("Vui lòng nhập khu vực bé đi lạc để mọi người dễ tìm!", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      await createPost({ 
        content, 
        image,
        isLostPet,
        lastSeenLocation: isLostPet ? lastSeenLocation : undefined,
        reward: isLostPet ? reward : undefined,
        lostDate: isLostPet && lostDate ? lostDate : undefined
      });
      toast.success("Đăng bài thành công!", { position: "top-center" });
      
      handleClose();
      
      // Báo cho Home.jsx tải lại feed
      window.dispatchEvent(new Event("reloadFeed"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi đăng bài", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* OVERLAY */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      />

      {/* MODAL */}
      <div className={`relative bg-white dark:bg-[#1e1e1e] w-full max-w-xl rounded-2xl shadow-xl p-5 animate-fade-in flex flex-col max-h-[90vh] ${isLostPet ? 'border-2 border-red-500' : ''}`}>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-100 flex-shrink-0">
          <h3 className={`font-bold text-xl w-full text-center ${isLostPet ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
            {isLostPet ? "🚨 Đăng tin Tìm Thú Lạc 🚨" : "Tạo bài viết mới"}
          </h3>
          <button
            onClick={handleClose}
            className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* CỘT CUỘN NỘI DUNG */}
        <div className="overflow-y-auto pr-2 flex-1 custom-scrollbar">
          
          {/* USER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={getAvatar(user?.avatar)}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-gray-800 dark:text-white block">
                  {user?.displayName || "User"}
                </span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">Cộng đồng PetSaver</span>
              </div>
            </div>

            {/* LOST PET TOGGLE */}
            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setIsLostPet(!isLostPet)}>
              <span className="text-xl">🚨</span>
              <span className="text-sm font-bold text-red-600 select-none">SOS Tìm thú</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isLostPet ? 'bg-red-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isLostPet ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
          </div>

          {/* SOS FORM FIELDS */}
          {isLostPet && (
            <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100 animate-fade-in space-y-3">
              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">Nơi bé đi lạc (Bắt buộc) *</label>
                <input type="text" value={lastSeenLocation} onChange={e => setLastSeenLocation(e.target.value)} placeholder="VD: Công viên ABC, Quận 1..." className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-red-700 mb-1">Ngày thất lạc</label>
                  <input type="date" value={lostDate} onChange={e => setLostDate(e.target.value)} className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-700 mb-1">Hậu tạ (Tùy chọn)</label>
                  <input type="text" value={reward} onChange={e => setReward(e.target.value)} placeholder="VD: 5.000.000đ" className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm" />
                </div>
              </div>
              <p className="text-[11px] text-red-500 text-center font-medium">Bật chế độ này, bài viết của bạn sẽ được đánh dấu khẩn cấp trên Bảng tin.</p>
            </div>
          )}

          {/* TEXTAREA */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isLostPet ? "Hãy mô tả đặc điểm nhận dạng của bé (Màu lông, vòng cổ, vết bớt...)" : "Meow! Bạn đang nghĩ gì thế?"}
            className={`w-full min-h-[100px] resize-none outline-none bg-transparent text-lg text-gray-800 dark:text-white placeholder-gray-400 ${isLostPet ? 'text-red-900 placeholder-red-300' : ''}`}
          />

          {/* IMAGE PREVIEW */}
          {image && (
            <div className="relative mb-4 group animate-fade-in">
              <img src={image} alt="Preview" className="w-full max-h-64 object-cover rounded-xl border border-gray-100 bg-gray-50" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-gray-800/70 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ACTIONS & BUTTON */}
        <div className="flex-shrink-0 pt-2 border-t mt-2">
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex items-center justify-between shadow-sm bg-gray-50">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">Thêm vào bài viết</span>

            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors cursor-pointer bg-white border border-gray-200 shadow-sm"
                title="Thêm ảnh"
              >
                <svg className="w-5 h-5 stroke-orange-500 fill-none stroke-2 pointer-events-none" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <circle cx="8" cy="10" r="2" />
                  <path d="M21 15l-5-5-6 6-3-3-4 4" />
                </svg>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* BUTTON */}
          <button 
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && !image)}
            className={`mt-3 w-full py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-sm text-lg
              ${loading || (!content.trim() && !image) 
                ? 'bg-gray-300 cursor-not-allowed' 
                : isLostPet ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg active:scale-95 shadow-red-200 animate-pulse' : 'bg-orange-500 hover:bg-orange-600 hover:shadow-md active:scale-95'}`}
          >
            {loading ? "Đang xử lý..." : isLostPet ? "Phát tín hiệu SOS" : "Đăng bài"}
          </button>
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}