import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { createPet } from "../../services/pet.service";

export default function AddPetModal({ isOpen, onClose, onPetAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    healthStatus: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.species.trim()) {
      toast.error("Vui lòng điền Tên và Giống loài của bé", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        avatar
      };
      await createPet(payload);
      toast.success("Thêm hồ sơ thú cưng thành công!", { position: "top-center" });
      onPetAdded(); // trigger reload profile
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm thú cưng", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-xl p-6 animate-fade-in">
        <h3 className="font-bold text-2xl text-center mb-6 text-gray-800">Tạo Hồ Sơ Thú Cưng</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div 
              className="w-24 h-24 rounded-full border-4 border-orange-100 bg-orange-50 flex items-center justify-center cursor-pointer overflow-hidden relative group shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🐾</span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-semibold">Đổi ảnh</span>
              </div>
            </div>
            <span className="text-sm text-gray-500 font-medium cursor-pointer hover:text-orange-500" onClick={() => fileInputRef.current?.click()}>
              Tải ảnh lên (Tối đa 5MB)
            </span>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên thú cưng *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="VD: Milu" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loài *</label>
              <select name="species" value={formData.species} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" required>
                <option value="">Chọn loài...</option>
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giống (Tùy chọn)</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="VD: Poodle" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi (Tùy chọn)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="Tính theo năm" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all">Hủy</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition-all disabled:bg-gray-400">
              {loading ? "Đang xử lý..." : "Lưu Hồ Sơ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
