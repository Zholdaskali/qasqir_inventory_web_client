/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveLogInLogs } from "../../../store/slices/logSlices/logInSlice";
import { API_GET_LOGIN_LOGS } from "../../../api/API";
import { CiCalendarDate } from "react-icons/ci";
import Notification from "../../../components/notification/Notification";

const LoginLogs = () => {
  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);

  const dispatch = useDispatch();
  const logInLogs = useSelector((state) => state.logInLogs);
  const authToken = useSelector((state) => state.token.token);

  const fetchLogInLogs = async () => {
    try {
      const response = await axios.get(API_GET_LOGIN_LOGS, {
        params: { startDate, endDate },
        headers: { "Auth-token": authToken },
      });
      const data = response.data.body;
      const sortedData =
        data?.length > 0
          ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          : [];
      dispatch(saveLogInLogs(sortedData));
      toast.success("Успешно", { toastId: "fetchSuccess" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Не удалось загрузить логи");
    }
  };

  // Функция для экспорта логов в CSV
  const exportToCSV = () => {
    if (!logInLogs.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["ID", "ID Пользователя", "Имя Пользователя", "Дата"];
    const rows = logInLogs.map((log) => [
      `"${log.loginLogId}"`,
      `"${log.userId}"`,
      `"${log.userName}"`,
      `"${log.timestamp}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `login_logs_from_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Логи входов экспортированы в CSV");
  };

  return (
    <div className="h-[90vh] w-full flex flex-col p-4">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
        <h1 className="text-xl font-semibold">Входы</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Кнопки */}
          <div className="flex gap-2 items-end">
            <button
              onClick={fetchLogInLogs}
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
              <th className="text-left px-3 py-2">ID Пользователя</th>
              <th className="text-left px-3 py-2">Имя Пользователя</th>
              <th className="text-left px-3 py-2">Дата</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {logInLogs.map((log) => (
              <tr key={log.loginLogId} className="hover:bg-gray-50">
                <td className="px-3 py-2">{log.userId}</td>
                <td className="px-3 py-2">{log.userName}</td>
                <td className="px-3 py-2">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Notification />
    </div>
  );
};

export default LoginLogs;