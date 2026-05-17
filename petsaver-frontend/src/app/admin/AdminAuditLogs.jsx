import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/admin.service";
import toast from "react-hot-toast";
import { ActivitySquare } from "lucide-react";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getAuditLogs();
        setLogs(res.data.data);
      } catch (error) {
        toast.error("Không thể lấy nhật ký hệ thống.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <ActivitySquare className="text-blue-500" /> Nhật ký Quản trị
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
              <th className="py-3 px-4 font-medium">ID</th>
              <th className="py-3 px-4 font-medium">Thời gian</th>
              <th className="py-3 px-4 font-medium">Admin</th>
              <th className="py-3 px-4 font-medium">Hành động</th>
              <th className="py-3 px-4 font-medium">Chi tiết (JSON)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{log.id}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                  {log.admin?.displayName || "Unknown"} <br />
                  <span className="text-xs text-gray-500">{log.admin?.email}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-lg text-gray-600 dark:text-gray-400 max-w-xs overflow-x-auto">
                    {log.details}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">Chưa có hoạt động nào.</div>
        )}
      </div>
    </div>
  );
}
