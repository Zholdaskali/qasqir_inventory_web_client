/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveExceptionLogs } from "../../../store/slices/logSlices/exceptionSlice";
import { API_GET_EXCEPTION_LOGS } from "../../../api/API";
import { CiCalendarDate } from "react-icons/ci";
import Notification from "../../../components/notification/Notification";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const ExceptionLogs = () => {
  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);

  const dispatch = useDispatch();
  const exceptionLogs = useSelector((state) => state.exceptionLogs);
  const authToken = useSelector((state) => state.token.token);

  const fetchExceptionLogs = async () => {
    if (!startDate || !endDate) {
      toast.error("Пожалуйста, выберите обе даты.");
      return;
    }
    try {
      const response = await axios.get(API_GET_EXCEPTION_LOGS, {
        params: { startDate, endDate },
        headers: { "Auth-token": authToken },
      });
      const data = response.data.body;
      const sortedData =
        data?.length > 0
          ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          : [];
      dispatch(saveExceptionLogs(sortedData));
      toast.success("Успешно", { toastId: "fetchSuccess" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Произошла ошибка");
    }
  };

  // Функция для экспорта логов в CSV
  const exportToCSV = () => {
    if (!exceptionLogs.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["ID", "Причина", "Сообщение", "Дата"];
    const rows = exceptionLogs.map((log) => [
      `"${log.exceptionId}"`,
      `"${log.cause}"`,
      `"${log.message}"`,
      `"${log.timestamp}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exception_logs_from_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Логи ошибок экспортированы в CSV");
  };

  // Расчет метрик для дашборда
  const totalLogs = exceptionLogs.length;
  const uniqueCauses = [...new Set(exceptionLogs.map(log => log.cause))].length;
  const mostCommonCause = exceptionLogs.length > 0
    ? Object.entries(
        exceptionLogs.reduce((acc, log) => {
          acc[log.cause] = (acc[log.cause] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    : "N/A";

  // Данные для линейного графика (ошибки по дням)
  const exceptionsPerDay = exceptionLogs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(exceptionsPerDay).sort(),
    datasets: [
      {
        label: "Ошибки по дням",
        data: Object.keys(exceptionsPerDay).sort().map(date => exceptionsPerDay[date]),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Данные для круговой диаграммы (распределение причин ошибок)
  const causeCounts = exceptionLogs.reduce((acc, log) => {
    acc[log.cause] = (acc[log.cause] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(causeCounts),
    datasets: [
      {
        data: Object.values(causeCounts),
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Обзор ошибок</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Карточки с метриками */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-600">Всего ошибок</h3>
            <p className="text-3xl font-bold text-blue-600">{totalLogs}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-600">Уникальные причины</h3>
            <p className="text-3xl font-bold text-green-600">{uniqueCauses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-600">Частая причина</h3>
            <p className="text-lg font-bold text-purple-600 truncate">{mostCommonCause}</p>
          </div>
          {/* Графики */}
          <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Ошибки по дням</h3>
            <div className="h-64">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: "Количество ошибок" } },
                    x: { title: { display: true, text: "Дата" } },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Распределение причин</h3>
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
        <h1 className="text-2xl font-bold text-gray-800">Ошибки</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Кнопки */}
          <div className="flex gap-3 items-end">
            <button
              onClick={fetchExceptionLogs}
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
              <th className="text-left px-4 py-3 font-semibold">Причина</th>
              <th className="text-left px-4 py-3 font-semibold">Сообщение</th>
              <th className="text-left px-4 py-3 font-semibold">Дата</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {exceptionLogs.map((log) => (
              <tr key={log.exceptionId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">{log.cause}</td>
                <td className="px-4 py-3">{log.message}</td>
                <td className="px-4 py-3">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Notification />
    </div>
  );
};

export default ExceptionLogs;