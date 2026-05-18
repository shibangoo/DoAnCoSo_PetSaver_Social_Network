import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/admin.service";
import toast from "react-hot-toast";
import { DollarSign, Users, PawPrint, HeartHandshake } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalPets: 0,
    successfulRescues: 0,
    revenue: 0
  });
  const [chartData, setChartData] = useState(null);
  const [selectedChart, setSelectedChart] = useState("activeUsers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats({
          ...res.data.data,
          revenue: 0 // Doanh thu = 0 mặc định như yêu cầu
        });
        if (res.data.data.chartData) {
          setChartData(res.data.data.chartData);
        }
      } catch (error) {
        toast.error("Không thể lấy dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Đang tải dữ liệu...</div>;
  }

  const statCards = [
    {
      id: "revenue",
      title: "Tổng Doanh Thu",
      value: `$${stats.revenue}`,
      icon: <DollarSign size={32} className="text-green-500" />,
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: "activeUsers",
      title: "User Hoạt Động",
      value: stats.activeUsers,
      icon: <Users size={32} className="text-blue-500" />,
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: "totalPets",
      title: "Tổng Số Pet",
      value: stats.totalPets,
      icon: <PawPrint size={32} className="text-orange-500" />,
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      id: "successfulRescues",
      title: "Số Ca Cứu Hộ",
      value: stats.successfulRescues,
      icon: <HeartHandshake size={32} className="text-pink-500" />,
      bg: "bg-pink-100 dark:bg-pink-900/30",
    },
  ];

  const currentChartData = chartData ? chartData[selectedChart] : [];
  const chartColors = {
    revenue: "#22c55e",
    activeUsers: "#3b82f6",
    totalPets: "#f97316",
    successfulRescues: "#ec4899"
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedChart(card.id)}
            className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border flex items-center space-x-4 transition-all cursor-pointer hover:-translate-y-1 ${selectedChart === card.id
                ? 'border-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/30'
                : 'border-gray-100 dark:border-gray-700'
              }`}
          >
            <div className={`p-4 rounded-xl ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {chartData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            Biểu đồ thống kê 7 ngày qua
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[selectedChart]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors[selectedChart]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white, #fff)' }}
                  itemStyle={{ fontWeight: 'bold', color: chartColors[selectedChart] }}
                />
                <Area type="monotone" dataKey="value" stroke={chartColors[selectedChart]} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
