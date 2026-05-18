import { useEffect, useState } from "react";
import { getReports, updateReportStatus } from "../../services/admin.service";
import toast from "react-hot-toast";
import { Flag, Check, X } from "lucide-react";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchReports = async () => {
    try {
      const res = await getReports(filter);
      setReports(res.data.data);
    } catch (error) {
      toast.error("Không thể lấy danh sách báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateReportStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Flag className="text-red-500" /> Quản lý Báo cáo
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">Tất cả</option>
          <option value="PENDING">Đang chờ (PENDING)</option>
          <option value="RESOLVED">Đã xử lý (RESOLVED)</option>
          <option value="DISMISSED">Đã bỏ qua (DISMISSED)</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">Người báo cáo</th>
              <th className="py-3 px-4 font-medium">Đối tượng</th>
              <th className="py-3 px-4 font-medium">Lý do</th>
              <th className="py-3 px-4 font-medium">Trạng thái</th>
              <th className="py-3 px-4 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{r.id}</td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">{r.reporter?.displayName || "Unknown"}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                  {r.targetType} (ID: {r.targetId})
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200 max-w-xs truncate" title={r.reason}>
                  {r.reason}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    r.status === 'RESOLVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(r.id, "RESOLVED")}
                        className="p-1.5 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Đánh dấu đã xử lý"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r.id, "DISMISSED")}
                        className="p-1.5 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Bỏ qua"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">Không có báo cáo nào.</div>
        )}
      </div>
    </div>
  );
}
