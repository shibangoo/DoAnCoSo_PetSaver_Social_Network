import { useState, useCallback } from "react";
import { FaTimes, FaSearch, FaUserPlus, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../services/api";
import { getAvatar } from "../../utils/avatar";

/**
 * Modal cho phép chủ sở hữu tìm và gửi lời mời đồng sở hữu.
 *
 * Props:
 *  - petId     {number}    ID của thú cưng
 *  - petName   {string}    Tên thú cưng (hiển thị trong tiêu đề)
 *  - onClose   {function}  Đóng modal
 *  - onSuccess {function}  Callback sau khi gửi thành công
 */
export default function InviteCoOwnerModal({ petId, petName, onClose, onSuccess }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(null); // userId đang được gửi lời mời

  // ─── Tìm kiếm người dùng ──────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await API.get("/search", { params: { q: query } });
      const users = res.data?.users || res.data?.results?.users || [];
      setResults(users);
    } catch (err) {
      toast.error("Không tìm kiếm được người dùng. Thử lại sau.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ─── Gửi lời mời ──────────────────────────────────────────────────────────
  const handleInvite = async (userId) => {
    setInviting(userId);
    try {
      await API.post("/co-ownership/invite", {
        petId: Number(petId),
        inviteeId: Number(userId),
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Không gửi được lời mời. Thử lại sau.";
      toast.error(msg);
    } finally {
      setInviting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              Mời đồng sở hữu
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Tìm người dùng để mời cùng chăm sóc{" "}
              <span className="font-semibold text-orange-500">{petName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-orange-300 transition">
              <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-full"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition active:scale-95 flex items-center gap-1"
            >
              {searching ? <FaSpinner className="animate-spin" /> : "Tìm"}
            </button>
          </div>
        </div>

        {/* RESULTS */}
        <div className="px-6 pb-6 max-h-72 overflow-y-auto space-y-2">
          {results.length === 0 && !searching && query.trim() && (
            <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-6">
              Không tìm thấy người dùng nào. Thử từ khóa khác.
            </p>
          )}
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <img
                src={getAvatar(u.avatar)}
                alt={u.displayName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {u.displayName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {u.email}
                </p>
              </div>
              <button
                onClick={() => handleInvite(u.id)}
                disabled={inviting === u.id}
                className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800/40 transition active:scale-95 disabled:opacity-60"
              >
                {inviting === u.id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaUserPlus />
                )}
                Mời
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
