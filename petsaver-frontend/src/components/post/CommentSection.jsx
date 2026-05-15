import { useState, useEffect, useRef } from "react";
import { getAvatar } from "../../utils/avatar";
import API from "../../services/api";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaReply, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function CommentSection({ postId, postAuthorId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const commentsEndRef = useRef(null);
  
  // State for replying and editing
  const [replyingTo, setReplyingTo] = useState(null); // { id, name }
  const [editingId, setEditingId] = useState(null); // comment id
  const inputRef = useRef(null);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Lỗi lấy bình luận:", err);
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 3000);
    return () => clearInterval(interval);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      if (editingId) {
        await API.put(`/posts/${postId}/comments/${editingId}`, { content });
        setEditingId(null);
      } else {
        await API.post(`/posts/${postId}/comments`, { 
          content, 
          parentId: replyingTo?.id || null 
        });
        setReplyingTo(null);
      }
      setContent("");
      fetchComments();
      if (!editingId && !replyingTo) {
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (commentId) => {
    try {
      await API.post(`/posts/${postId}/comments/${commentId}/react`, { type: 'LIKE' });
      fetchComments();
    } catch (err) {
      toast.error("Không thể thả cảm xúc");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await API.delete(`/posts/${postId}/comments/${commentId}`);
      toast.success("Đã xóa bình luận");
      fetchComments();
    } catch (err) {
      toast.error("Lỗi xóa bình luận");
    }
  };

  const handleReply = (comment) => {
    setReplyingTo({ id: comment.id, name: comment.user?.displayName });
    setEditingId(null);
    setContent(`@${comment.user?.displayName} `);
    inputRef.current?.focus();
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setReplyingTo(null);
    setContent(comment.content);
    inputRef.current?.focus();
  };

  const cancelAction = () => {
    setReplyingTo(null);
    setEditingId(null);
    setContent("");
  };

  const renderComment = (c, isReply = false) => {
    const isCommentAuthor = c.userId === user.id;
    const canDelete = isCommentAuthor || postAuthorId === user.id;
    const myReaction = c.reactions?.find(r => r.userId === user.id);
    
    // Group reactions
    const reactionCounts = { LIKE: 0, DISLIKE: 0, SAD: 0, ANGRY: 0 };
    c.reactions?.forEach(r => {
      if (reactionCounts[r.type] !== undefined) reactionCounts[r.type]++;
    });
    const totalReactions = c.reactions?.length || 0;

    const reactionConfig = {
      LIKE: { icon: "👍", label: "Thích", color: "text-blue-500" },
      DISLIKE: { icon: "👎", label: "Không thích", color: "text-gray-500" },
      SAD: { icon: "😢", label: "Buồn", color: "text-amber-500" },
      ANGRY: { icon: "😡", label: "Giận dữ", color: "text-red-500" }
    };

    const handleReactToComment = async (type) => {
      try {
        await API.post(`/posts/${postId}/comments/${c.id}/react`, { type });
        fetchComments();
      } catch (err) {
        toast.error("Không thể thả cảm xúc");
      }
    };

    return (
      <div key={c.id} className={`flex gap-3 ${isReply ? 'ml-10 mt-2' : ''}`}>
        <img 
          src={getAvatar(c.user?.avatar)} 
          className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer"
          onClick={() => window.location.href = `/profile/${c.user?.id}`}
        />
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-2xl inline-block max-w-full relative group">
            <span className="font-bold text-gray-800 dark:text-gray-100 mr-2 cursor-pointer hover:underline text-sm" onClick={() => window.location.href = `/profile/${c.user?.id}`}>
              {c.user?.displayName || "User"}
            </span>
            <p className="text-gray-700 dark:text-gray-200 break-words text-sm whitespace-pre-wrap">{c.content}</p>
            
            {/* Reaction Badge */}
            {totalReactions > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-sm px-1.5 py-0.5 text-[10px] flex items-center gap-1 border border-gray-100 dark:border-gray-600">
                {reactionCounts.LIKE > 0 && <span>👍</span>}
                {reactionCounts.DISLIKE > 0 && <span>👎</span>}
                {reactionCounts.SAD > 0 && <span>😢</span>}
                {reactionCounts.ANGRY > 0 && <span>😡</span>}
                <span className="text-gray-600 dark:text-gray-300 font-medium ml-0.5">{totalReactions}</span>
              </div>
            )}
            
            {/* Hover Actions Menu */}
            <div className="absolute top-2 -right-16 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-0">
              {isCommentAuthor && (
                <button onClick={() => handleEdit(c)} className="p-1.5 bg-white dark:bg-gray-600 rounded-full shadow-sm text-gray-500 hover:text-blue-500">
                  <FaEdit size={12} />
                </button>
              )}
              {canDelete && (
                <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-white dark:bg-gray-600 rounded-full shadow-sm text-gray-500 hover:text-red-500">
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>
          
          {/* Action links */}
          <div className="flex items-center gap-4 mt-1 ml-2 text-xs font-medium text-gray-500">
            <div className="relative group/react inline-block">
              <button 
                onClick={() => handleReactToComment(myReaction ? myReaction.type : 'LIKE')}
                className={`hover:underline ${myReaction ? reactionConfig[myReaction.type]?.color : ''}`}
              >
                {myReaction ? reactionConfig[myReaction.type]?.label : 'Thích'}
              </button>
              
              {/* Emojis Popup */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white dark:bg-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.15)] rounded-full px-3 py-1.5 hidden group-hover/react:flex gap-2 animate-fade-in border border-gray-100 dark:border-gray-700 z-50 pointer-events-auto">
                {Object.entries(reactionConfig).map(([type, {icon, label}]) => (
                  <button
                    key={type}
                    onClick={() => handleReactToComment(type)}
                    className="text-2xl hover:scale-125 transition-transform relative group/emoji"
                  >
                    {icon}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover/emoji:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {!isReply && (
              <button onClick={() => handleReply(c)} className="hover:underline">Phản hồi</button>
            )}
            <span className="text-gray-400 font-normal">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          
          {/* Render Replies */}
          {c.replies?.map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4 animate-fade-in">
      <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2 space-y-4 mb-3">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-gray-400 my-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map(c => renderComment(c))
        )}
        <div ref={commentsEndRef} />
      </div>

      {(replyingTo || editingId) && (
        <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-t-xl text-xs font-medium text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/30 border-b-0">
          <span>{editingId ? "Đang chỉnh sửa bình luận" : `Đang phản hồi ${replyingTo?.name}`}</span>
          <button onClick={cancelAction} className="hover:text-red-500"><FaTimes /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
        <img 
          src={getAvatar(user.avatar)} 
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <input 
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận..."
          className={`flex-1 bg-gray-50 dark:bg-gray-700 border ${replyingTo || editingId ? 'border-orange-200 dark:border-orange-800/50 rounded-b-xl rounded-t-none border-t-0' : 'border-gray-100 dark:border-gray-600 rounded-full'} px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 dark:text-white transition-all`}
        />
        <button 
          type="submit" 
          disabled={loading || !content.trim()}
          className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50 transition absolute right-1 top-1/2 -translate-y-1/2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </form>
    </div>
  );
}
