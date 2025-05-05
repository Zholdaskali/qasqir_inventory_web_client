/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveActionLogs } from "../../../store/slices/logSlices/actionLogSlice";
import { API_GET_ACTION_LOGS } from "../../../api/API";
import Notification from "../../../components/notification/Notification";
import { CiCalendarDate } from "react-icons/ci";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const ActionLogs = () => {
  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);

  const actionLogs = useSelector((state) => state.actionLogs);
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();

  const fetchActionLogs = async () => {
    try {
      const response = await axios.get(API_GET_ACTION_LOGS, {
        params: { startDate, endDate },
        headers: { "Auth-token": authToken },
      });
      const data = response.data.body;
      const sortedData = data?.length > 0 ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
      dispatch(saveActionLogs(sortedData));
      toast.success("Успешно", { toastId: "fetchSuccess" });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  // Функция для экспорта логов в CSV
  const exportToCSV = () => {
    if (!actionLogs.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["Дата", "Пользователь", "Действие", "Эндпоинт"];
    const rows = actionLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.userEmail}"`,
      `"${log.action}"`,
      `"${log.endpoint}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `action_logs_from_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Логи экспортированы в CSV");
  };

  // Расчет метрик для дашборда
  const totalLogs = actionLogs.length;
  const uniqueUsers = [...new Set(actionLogs.map(log => log.userEmail))].length;
  const mostCommonAction = actionLogs.length > 0
    ? Object.entries(
        actionLogs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    : "N/A";

  // Данные для линейного графика (действия по дням)
  const actionsPerDay = actionLogs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(actionsPerDay).sort(),
    datasets: [
      {
        label: "Действия по дням",
        data: Object.keys(actionsPerDay).sort().map(date => actionsPerDay[date]),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Данные для круговой диаграммы (распределение типов действий)
  const actionCounts = actionLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(actionCounts),
    datasets: [
      {
        data: Object.values(actionCounts),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };

  return (
    <div className="h-[90vh] w-full flex flex-col p-6 bg-gray-50">
      {/* Мини-дашборд */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Обзор активности</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Карточки с метриками */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-600">Всего логов</h3>
            <p className="text-3xl font-bold text-blue-600">{totalLogs}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-600">Уникальные пользователи</h3>
            <p className="text-3xl font-bold text-green-600">{uniqueUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-600">Частое действие</h3>
            <p className="text-lg font-bold text-purple-600 truncate">{mostCommonAction}</p>
          </div>
          {/* Графики */}
          <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Действия по дням</h3>
            <div className="h-64">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: "Количество действий" } },
                    x: { title: { display: true, text: "Дата" } },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Распределение действий</h3>
            <div className="h-64">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 gap-4 bg-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">Действия</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Кнопки */}
          <div className="flex gap-3 items-end">
            <button
              onClick={fetchActionLogs}
              className="bg-blue-600 px-6 py-2.5 text-sm text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              Вывести
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 px-6 py-2.5 text-sm text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200"
            >
              Экспорт в CSV
            </button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <CiCalendarDate className="text-lg" /> Начало
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <CiCalendarDate className="text-lg" /> Конец
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-auto mt-6 rounded-xl bg-white shadow-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <table className="w-full table-auto border-separate border-spacing-y-1">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 text-sm">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Дата</th>
              <th className="text-left px-4 py-3 font-semibold">Пользователь</th>
              <th className="text-left px-4 py-3 font-semibold">Действие</th>
              <th className="text-left px-4 py-3 font-semibold">Эндпоинт</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {actionLogs.map((log) => (
              <tr key={log.actionLoId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">{log.timestamp}</td>
                <td className="px-4 py-3">{log.userEmail}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">{log.endpoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Notification />
    </div>
  );
};

export default ActionLogs;