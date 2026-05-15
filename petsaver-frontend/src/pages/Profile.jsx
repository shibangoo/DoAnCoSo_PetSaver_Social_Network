import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatar } from "../utils/avatar";
import { getMe } from "../services/auth.service";
import PostCard from "../components/post/PostCard";
import PetCard from "../components/pet/PetCard";
import AddPetModal from "../components/pet/AddPetModal";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAddPet, setOpenAddPet] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getMe();
      setProfile(res.data);
    } catch (err) {
      console.error("Lỗi lấy thông tin profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center animate-pulse">Đang tải hồ sơ...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">Lỗi tải trang</div>;
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen pb-10">

      {/* ===== COVER ===== */}
      <div className="h-56 bg-gradient-to-r from-orange-400 to-orange-500 relative">
        <button
          onClick={() => navigate("/home")}
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:bg-white transition"
        >
          ← Trang chủ
        </button>

        {/* AVATAR */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <img
            src={getAvatar(profile.avatar)}
            className="w-32 h-32 rounded-full border-4 border-white object-cover bg-gray-200 shadow-md"
          />
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="mt-20 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {profile.displayName || "Người dùng ẩn danh"}
        </h2>
        <p className="text-gray-500">
          {profile.email}
        </p>

        {/* BIO */}
        <p className="mt-3 text-gray-600 text-sm max-w-md mx-auto bg-orange-50 py-2 px-4 rounded-full border border-orange-100">
          🐾 {profile.accountType === 'SHELTER' ? 'Tổ chức cứu hộ' : 'Yêu thú cưng • Pet Lover'}
        </p>
      </div>

      {/* ===== ACTION ===== */}
      <div className="flex justify-center gap-3 mt-6">
        <button className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-600 hover:shadow-md transition-all active:scale-95">
          Chỉnh sửa hồ sơ
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PETS */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">Thú cưng ({profile.pets?.length || 0})</h3>
              <button 
                onClick={() => setOpenAddPet(true)}
                className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer"
                title="Thêm thú cưng"
              >
                +
              </button>
            </div>

            <div className="space-y-3">
              {profile.pets && profile.pets.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {profile.pets.map(pet => (
                    <PetCard key={pet.id} pet={pet} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-3xl opacity-50 mb-2 block">😿</span>
                  <p className="text-sm text-gray-500">Chưa có bé nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POSTS */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-gray-800 px-2">Bài viết của {profile.displayName}</h3>

          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100 animate-fade-in">
              <span className="text-5xl opacity-50 block mb-4">📝</span>
              <p className="text-gray-500 font-medium">Chưa có bài viết nào.</p>
            </div>
          )}
        </div>

      </div>

      <AddPetModal 
        isOpen={openAddPet} 
        onClose={() => setOpenAddPet(false)} 
        onPetAdded={fetchProfile}
      />
    </div>
  );
}