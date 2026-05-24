import { useState, useRef, useEffect } from "react";
import { getAvatar } from "../../utils/avatar";
import { createPost } from "../../services/post.service";
import { getMe } from "../../services/auth.service";
import toast from "react-hot-toast";

export default function CreatePostModal({ isOpen, onClose, user }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [feeling, setFeeling] = useState("");
  const [showFeelings, setShowFeelings] = useState(false);
  const feelingsList = ["😊 Hạnh phúc", "😢 Buồn", "🤩 Hào hứng", "🥰 Yêu đời", "😡 Tức giận", "😴 Buồn ngủ", "🥳 Chúc mừng"];
  
  // SOS Fields
  const [isLostPet, setIsLostPet] = useState(false);
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [reward, setReward] = useState("");
  const [lostDate, setLostDate] = useState("");

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [userPets, setUserPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showPetSelector, setShowPetSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getMe().then(res => {
        if (res.data && res.data.pets) {
          setUserPets(res.data.pets);
        }
      }).catch(err => console.error("Lỗi lấy danh sách thú cưng", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      setContent("");
      setImages([]);
      setFeeling("");
      setShowFeelings(false);
      setIsLostPet(false);
      setLastSeenLocation("");
      setReward("");
      setLostDate("");
      setSelectedPets([]);
      setShowPetSelector(false);
      onClose();
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (images.length + files.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh/video", { position: "top-center" });
      return;
    }

    const newImages = [];
    let hasError = false;

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      
      if (file.size > maxSize) {
        toast.error(`${file.name} vượt quá ${isVideo ? '20MB' : '5MB'}`, { position: "top-center" });
        hasError = true;
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePetSelection = (pet) => {
    if (selectedPets.find(p => p.id === pet.id)) {
      setSelectedPets(selectedPets.filter(p => p.id !== pet.id));
    } else {
      setSelectedPets([...selectedPets, pet]);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc thêm ảnh", { position: "top-center" });
      return;
    }

    if (isLostPet && !lastSeenLocation.trim()) {
      toast.error("Vui lòng nhập khu vực bé đi lạc để mọi người dễ tìm!", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const imagesPayload = images.length > 0 ? JSON.stringify(images) : undefined;
      const petIdsPayload = selectedPets.length > 0 ? selectedPets.map(p => p.id) : undefined;

      await createPost({ 
        content, 
        image: imagesPayload,
        petIds: petIdsPayload,
        feeling,
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
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h3 className={`font-bold text-xl w-full text-center ${isLostPet ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
            {isLostPet ? "🚨 Đăng tin Tìm Thú Lạc 🚨" : "Tạo bài viết mới"}
          </h3>
          <button
            onClick={handleClose}
            className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
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
                  {feeling && <span className="font-normal text-gray-600 dark:text-gray-300 ml-1">đang cảm thấy {feeling}</span>}
                </span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">Cộng đồng PetSaver</span>
              </div>
            </div>

            {/* LOST PET TOGGLE */}
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" onClick={() => setIsLostPet(!isLostPet)}>
              <span className="text-xl">🚨</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 select-none">SOS Tìm thú</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isLostPet ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isLostPet ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
            {/* TAGGED PETS DISPLAY */}
            {selectedPets.length > 0 && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span className="text-sm text-gray-500">cùng với</span>
                {selectedPets.map(p => (
                  <span key={p.id} className="text-sm font-semibold text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/30">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SOS FORM FIELDS */}
          {isLostPet && (
            <div className="bg-red-50 dark:bg-red-950/10 rounded-xl p-4 mb-4 border border-red-100 dark:border-red-900/30 animate-fade-in space-y-3">
              <div>
                <label className="block text-xs font-bold text-red-700 dark:text-red-400 mb-1">Nơi bé đi lạc (Bắt buộc) *</label>
                <input 
                  type="text" 
                  value={lastSeenLocation} 
                  onChange={e => setLastSeenLocation(e.target.value)} 
                  placeholder="VD: Công viên ABC, Quận 1..." 
                  className="w-full px-3 py-2 border border-red-200 dark:border-red-900/50 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-red-300 dark:placeholder-red-800" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-red-700 dark:text-red-400 mb-1">Ngày thất lạc</label>
                  <input 
                    type="date" 
                    value={lostDate} 
                    onChange={e => setLostDate(e.target.value)} 
                    className="w-full px-3 py-2 border border-red-200 dark:border-red-900/50 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-700 dark:text-red-400 mb-1">Hậu tạ (Tùy chọn)</label>
                  <input 
                    type="text" 
                    value={reward} 
                    onChange={e => setReward(e.target.value)} 
                    placeholder="VD: 5.000.000đ" 
                    className="w-full px-3 py-2 border border-red-200 dark:border-red-900/50 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-red-300 dark:placeholder-red-800" 
                  />
                </div>
              </div>
              <p className="text-[11px] text-red-500 dark:text-red-400/80 text-center font-medium">Bật chế độ này, bài viết của bạn sẽ được đánh dấu khẩn cấp trên Bảng tin.</p>
            </div>
          )}

          {/* TEXTAREA */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isLostPet ? "Hãy mô tả đặc điểm nhận dạng của bé (Màu lông, vòng cổ, vết bớt...)" : `${user?.displayName || "Bạn"} ơi, bạn đang nghĩ gì thế?`}
            className={`w-full min-h-[100px] resize-none outline-none bg-transparent text-lg placeholder-gray-400 ${
              isLostPet 
                ? 'text-red-900 dark:text-red-200 placeholder-red-300 dark:placeholder-red-700/50 font-medium' 
                : 'text-gray-800 dark:text-white'
            }`}
          />

          {/* IMAGE PREVIEW */}
          {images.length > 0 && (
            <div className={`grid gap-2 mb-4 animate-fade-in ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {images.map((imgUrl, index) => (
                <div key={index} className="relative group">
                  {imgUrl.startsWith('data:video/') ? (
                      <video src={imgUrl} controls className="w-full h-48 object-cover rounded-xl border border-gray-100 bg-gray-50" />
                  ) : (
                      <img src={imgUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-100 bg-gray-50" />
                  )}
                  <button
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-gray-800/70 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800 z-10"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PET SELECTOR */}
          {showPetSelector && (
              <div className="mb-4 animate-fade-in border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#2a2a2a]">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Tag thú cưng của bạn</p>
                  {userPets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {userPets.map(pet => {
                            const isSelected = selectedPets.find(p => p.id === pet.id);
                            return (
                                <div 
                                    key={pet.id}
                                    onClick={() => togglePetSelection(pet)}
                                    className={`px-3 py-1.5 border rounded-full text-sm cursor-pointer flex items-center gap-2 transition-colors
                                        ${isSelected ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50'}`}
                                >
                                    <img src={pet.avatar || 'https://via.placeholder.com/30'} alt={pet.name} className="w-5 h-5 rounded-full object-cover" />
                                    {pet.name}
                                </div>
                            );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Bạn chưa có thú cưng nào để tag.</p>
                  )}
              </div>
          )}

          {/* FEELINGS PICKER */}
          {showFeelings && (
              <div className="mb-4 animate-fade-in border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#2a2a2a]">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Bạn đang cảm thấy thế nào?</p>
                  <div className="flex flex-wrap gap-2">
                      {feelingsList.map(f => (
                          <div 
                              key={f}
                              onClick={() => { setFeeling(f); setShowFeelings(false); }}
                              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-700 hover:border-orange-200 transition-colors"
                          >
                              {f}
                          </div>
                      ))}
                      <div 
                          onClick={() => { setFeeling(""); setShowFeelings(false); }}
                          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-300 transition-colors"
                      >
                          ✕ Hủy
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* ACTIONS & BUTTON */}
        <div className="flex-shrink-0 pt-2 border-t dark:border-gray-700 mt-2">
          <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex items-center justify-between shadow-sm bg-gray-50 dark:bg-gray-800/40">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">Thêm vào bài viết</span>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowFeelings(!showFeelings)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm"
                title="Cảm xúc"
              >
                <span className="text-xl">😊</span>
              </button>
              <button 
                onClick={() => { setShowPetSelector(!showPetSelector); setShowFeelings(false); }}
                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors cursor-pointer border shadow-sm ${
                  showPetSelector 
                    ? 'border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
                title="Tag thú cưng"
              >
                <svg className="w-5 h-5 stroke-orange-500 fill-none stroke-2 pointer-events-none" viewBox="0 0 24 24">
                  <circle cx="6" cy="9" r="2" />
                  <circle cx="18" cy="9" r="2" />
                  <circle cx="12" cy="7" r="2" />
                  <path d="M5 17c0-3 14-3 14 0 0 2-3 3-7 3s-7-1-7-3z" />
                </svg>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm"
                title="Thêm ảnh/video"
              >
                <svg className="w-5 h-5 stroke-orange-500 fill-none stroke-2 pointer-events-none" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <circle cx="8" cy="10" r="2" />
                  <path d="M21 15l-5-5-6 6-3-3-4 4" />
                </svg>
              </button>
              <input 
                type="file" 
                multiple
                accept="image/*,video/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* BUTTON */}
          <button 
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && images.length === 0)}
            className={`mt-3 w-full py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-sm text-lg
              ${loading || (!content.trim() && images.length === 0) 
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