import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaPaw,
  FaHeart,
  FaUserFriends,
  FaCrown,
  FaCalendarAlt,
  FaDna,
  FaShieldAlt,
  FaArrowLeft,
  FaUserPlus,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

import Navbar from "../components/layout/Navbar";
import SidebarLeft from "../components/layout/SidebarLeft";
import PostCard from "../components/post/PostCard";
import { getPetById } from "../services/pet.service";
import { getAvatar } from "../utils/avatar";
import API from "../services/api";
import InviteCoOwnerModal from "../components/pet/InviteCoOwnerModal";

// ─── Hàm helper ───────────────────────────────────────────────────────────────
const getPetEmoji = (species) => {
  if (!species) return "🐾";
  const s = species.toLowerCase();
  if (s.includes("chó") || s.includes("dog")) return "🐶";
  if (s.includes("mèo") || s.includes("cat")) return "🐱";
  if (s.includes("thỏ") || s.includes("rabbit")) return "🐰";
  if (s.includes("chim") || s.includes("bird")) return "🦜";
  if (s.includes("cá") || s.includes("fish")) return "🐠";
  if (s.includes("rùa") || s.includes("turtle")) return "🐢";
  return "🐾";
};

const getHealthBadge = (status) => {
  const map = {
    HEALTHY: { label: "Khỏe mạnh", cls: "bg-green-100 text-green-700 border-green-200" },
    SICK: { label: "Đang bệnh", cls: "bg-red-100 text-red-700 border-red-200" },
    RECOVERING: { label: "Đang hồi phục", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    UNKNOWN: { label: "Chưa rõ", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  return map[status] || { label: status || "Chưa rõ", cls: "bg-gray-100 text-gray-500 border-gray-200" };
};

// ─── Sub-component: Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/30 gap-1">
      <span className="text-xl text-orange-400">{icon}</span>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">{label}</p>
      <p className="text-base font-bold text-gray-800 dark:text-white">{value || "—"}</p>
    </div>
  );
}

// ─── Sub-component: Owner Avatar ─────────────────────────────────────────────
function OwnerBadge({ user, label, isCrown }) {
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      onClick={() => navigate(`/profile/${user.id}`)}
      title={`Xem hồ sơ của ${user.displayName}`}
    >
      <div className="relative">
        <img
          src={getAvatar(user.avatar)}
          className="w-12 h-12 rounded-full object-cover border-2 border-orange-300 dark:border-orange-600 group-hover:ring-2 group-hover:ring-orange-400 transition"
          alt={user.displayName}
        />
        {isCrown && (
          <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow">
            👑
          </span>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-orange-500 transition truncate max-w-[80px]">
          {user.displayName}
        </p>
        <p className="text-[10px] text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [pet, setPet] = useState(null);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ─ Fetch pet detail ────────────────────────────────────────────────────────
  const fetchPet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPetById(id);
      if (res.data?.isDeleted) {
        setIsDeleted(true);
      } else {
        setPet(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin thú cưng:", err);
      toast.error("Không thể tải thông tin thú cưng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ─ Fetch tagged posts ──────────────────────────────────────────────────────
  const fetchTaggedPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      // API: GET /posts?taggedPetId=<id>  hoặc lọc từ feed
      // Nếu backend chưa có endpoint riêng, thử qua /pets/:id/posts
      const res = await API.get(`/posts`, { params: { taggedPetId: id } });
      const posts = res.data?.posts || res.data || [];
      setTaggedPosts(posts);
    } catch (err) {
      // Graceful fallback – không hiển thị lỗi toast vì có thể API chưa hỗ trợ filter
      console.warn("Không tải được bài viết được gắn thẻ:", err?.response?.data?.message || err.message);
      setTaggedPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPet();
    fetchTaggedPosts();
  }, [fetchPet, fetchTaggedPosts]);

  // ─ Computed flags ──────────────────────────────────────────────────────────
  const isOwner = pet && Number(currentUser?.id) === Number(pet.ownerId);
  const isCoOwner = pet && Number(currentUser?.id) === Number(pet.coOwnerId);
  const health = getHealthBadge(pet?.healthStatus);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Đang tải
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-orange-400 text-4xl animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Đang tải hồ sơ thú cưng...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Đã bị xóa
  // ─────────────────────────────────────────────────────────────────────────────
  if (isDeleted) {
    return (
      <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 max-w-md text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <FaExclamationTriangle className="text-yellow-400 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Hồ sơ đã bị gỡ bỏ
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Hồ sơ thú cưng này đã được chủ nhân gỡ bỏ khỏi PetSaver.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-600 transition active:scale-95"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Không tìm thấy
  // ─────────────────────────────────────────────────────────────────────────────
  if (!pet) {
    return (
      <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-4xl mb-4">😿</p>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Không tìm thấy thú cưng này.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-orange-500 hover:underline text-sm"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Chính
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#f5f6f8] dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex">
        {/* SIDEBAR */}
        <div className="w-64 p-4 hidden lg:block flex-shrink-0">
          <SidebarLeft />
        </div>

        {/* MAIN */}
        <div className="flex-1 max-w-3xl mx-auto p-4">
          <Navbar />

          {/* ── BACK BUTTON ── */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 transition mb-4 font-medium group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>

          {/* ══════════════════════════════════════════════════════
              CARD: HERO SECTION – Avatar + Tên + Badges
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-5">

            {/* Cover gradient */}
            <div className="h-36 bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 relative">
              <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20 select-none">
                {getPetEmoji(pet.species)}
              </div>
              {pet.isAdopted && (
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  ✓ Đã nhận nuôi
                </span>
              )}
            </div>

            {/* Avatar + Info */}
            <div className="px-6 pb-6 relative">
              {/* Avatar */}
              <div className="absolute -top-14 left-6">
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-orange-100 shadow-lg">
                  {pet.avatar ? (
                    <img
                      src={pet.avatar}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {getPetEmoji(pet.species)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name + badges */}
              <div className="pt-16 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {pet.name}
                    <span className="text-2xl">{getPetEmoji(pet.species)}</span>
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    {pet.species}
                    {pet.breed && (
                      <span className="text-gray-400 dark:text-gray-500"> • {pet.breed}</span>
                    )}
                  </p>

                  {/* Health badge */}
                  <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full border ${health.cls}`}>
                    {health.label}
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 flex-wrap">
                  {isOwner && !pet.coOwnerId && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-all active:scale-95 shadow-sm"
                    >
                      <FaUserPlus />
                      Mời đồng sở hữu
                    </button>
                  )}
                  {isOwner && pet.coOwnerId && (
                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 px-3 py-1.5 rounded-xl font-medium">
                      <FaUserFriends className="text-orange-400" />
                      Đã có đồng sở hữu
                    </span>
                  )}
                </div>
              </div>

              {/* ── STATS ROW ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <StatCard
                  icon={<FaCalendarAlt />}
                  label="Tuổi"
                  value={pet.age != null ? `${pet.age} tuổi` : null}
                />
                <StatCard
                  icon={<FaDna />}
                  label="Loài"
                  value={pet.species}
                />
                <StatCard
                  icon={<FaPaw />}
                  label="Giống"
                  value={pet.breed}
                />
                <StatCard
                  icon={<FaShieldAlt />}
                  label="Tag cần duyệt"
                  value={pet.requireTagApproval ? "Có" : "Không"}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD: OWNERS
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-5">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaCrown className="text-yellow-400" />
              Người sở hữu
            </h2>
            <div className="flex flex-wrap gap-6">
              {pet.owner && (
                <OwnerBadge user={pet.owner} label="Chủ sở hữu" isCrown />
              )}
              {pet.coOwner && (
                <OwnerBadge user={pet.coOwner} label="Đồng sở hữu" isCrown={false} />
              )}
              {!pet.owner && !pet.coOwner && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Chưa có thông tin chủ sở hữu.
                </p>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD: TAGGED POSTS
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaHeart className="text-red-400" />
              Bài viết có gắn thẻ{" "}
              <span className="text-orange-500">{pet.name}</span>
            </h2>

            {loadingPosts ? (
              <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                <FaSpinner className="animate-spin text-orange-400" />
                <span>Đang tải bài viết...</span>
              </div>
            ) : taggedPosts.length > 0 ? (
              <div className="space-y-0">
                {taggedPosts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={fetchTaggedPosts} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="text-5xl block mb-3 opacity-40">📷</span>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Chưa có bài viết nào gắn thẻ {pet.name}.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Hãy đăng bài và gắn thẻ bé này nhé! 🐾
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Mời đồng sở hữu */}
      {showInviteModal && (
        <InviteCoOwnerModal
          petId={pet.id}
          petName={pet.name}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            fetchPet();
            toast.success("Đã gửi lời mời đồng sở hữu thành công!");
          }}
        />
      )}
    </div>
  );
}
