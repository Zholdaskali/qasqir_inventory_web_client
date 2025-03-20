/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveActionLogs } from "../../../store/slices/logSlices/actionLogSlice";
import { API_GET_ACTION_LOGS } from "../../../api/API";
import Notification from "../../../components/notification/Notification";
import { CiCalendarDate } from "react-icons/ci";

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

  return (
    <div className="h-[90vh] w-full flex flex-col p-4">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
        <h1 className="text-xl font-semibold">Действия</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Кнопки */}
          <div className="flex gap-2 items-end">
            <button
              onClick={fetchActionLogs}
              className="bg-blue-600 px-5 py-2 text-sm text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              Вывести
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 px-5 py-2 text-sm text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200"
            >
              Экспорт в CSV
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex-1">
              <label className="flex items-center gap-1 text-sm">
                <CiCalendarDate /> Начало
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded-md w-full text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1 text-sm">
                <CiCalendarDate /> Конец
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded-md w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-auto mt-4 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <table className="w-full table-auto border-separate border-spacing-y-1">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 text-sm">
            <tr>
              <th className="text-left px-3 py-2">Дата</th>
              <th className="text-left px-3 py-2">Пользователь</th>
              <th className="text-left px-3 py-2">Действие</th>
              <th className="text-left px-3 py-2">Эндпоинт</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {actionLogs.map((log) => (
              <tr key={log.actionLoId} className="hover:bg-gray-50">
                <td className="px-3 py-2">{log.timestamp}</td>
                <td className="px-3 py-2">{log.userEmail}</td>
                <td className="px-3 py-2">{log.action}</td>
                <td className="px-3 py-2">{log.endpoint}</td>
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