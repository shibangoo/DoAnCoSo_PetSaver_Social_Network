import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updatePost } from '../../services/post.service';

export default function EditPostModal({ isOpen, onClose, currentPost, onPostUpdated }) {
  const [formData, setFormData] = useState({
    content: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPost) {
      setFormData({
        content: currentPost.content || '',
      });
    }
  }, [currentPost, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePost(currentPost.id, formData);
      toast.success('Cập nhật bài viết thành công!');
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Chỉnh sửa bài viết</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea 
              name="content"
              value={formData.content}
              onChange={(e) => setFormData({ content: e.target.value })}
              className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none resize-none"
              rows={4}
              placeholder="Bạn đang nghĩ gì?"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
