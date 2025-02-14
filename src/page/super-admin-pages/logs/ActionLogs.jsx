/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveActionLogs } from "../../../store/slices/logSlices/actionLogSlice";
import { API_GET_ACTION_LOGS } from "../../../api/API";

import Notification from "../../../components/notification/Notification";

import filterIcon from '../../../assets/icons/filter.svg'
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiCalendarDate } from "react-icons/ci";

const ActionLogs = () => {

  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [error, setError] = useState(null);

  const actionLogs = useSelector((state) => state.actionLogs);
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();

  const [fields, setFields] = useState([]);

  const fetchActionLogs = async () => {
    setError(null);
    try {
      const response = await axios.get(
        API_GET_ACTION_LOGS,
        {
          params: { startDate, endDate },
          headers: { "Auth-token": authToken },
        }
      );

      const data = response.data.body;

      if (data?.length > 0) {
        const fieldNames = Object.keys(data[0]);
        setFields(fieldNames);

        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        dispatch(saveActionLogs(sortedData));
      } else {
        dispatch(saveActionLogs([]));
      }

      toast.success("Успешно", { toastId: "fetchSuccess" });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const downloadLogsAsTxt = () => {
    if (actionLogs.length === 0) {
      alert("Нет данных для скачивания");
      return;
    }

    const columnHeaders = "Дата | Id пользователя | Действие | Эндпоинт";

    const logsContent = [
      columnHeaders,
      ...actionLogs.map((log) => `${log.timestamp} | ${log.userId} | ${log.action} | ${log.endpoint}`)
    ].join("\n")

    const fileName = `action_logs_from_${startDate}_to_${endDate}.txt`;

    const blob = new Blob([logsContent], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[90vh] w-full flex flex-col justify-center items-center p-4 md:p-6 lg:p-8">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col md:flex-row w-full justify-between items-center border-b py-5 gap-4">
        <h1 className="text-2xl w-full md:w-1/4">Действия</h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full md:w-3/4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={fetchActionLogs}
              className="bg-main-dull-gray px-4 md:px-8 text-sm py-2 md:py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue w-full md:w-auto"
            >
              Вывести
            </button>
            <button
              onClick={downloadLogsAsTxt}
              className="bg-main-dull-gray px-4 md:px-8 text-sm py-2 md:py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue w-full md:w-auto"
            >
              Скачать
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-1/2">
            <div className="w-full md:w-1/2">
              <label htmlFor="start-date" className="flex items-center gap-x-2">
                <CiCalendarDate />
                <p>Начальная дата</p>
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-4 py-2 rounded-lg w-full"
              />
            </div>
            <div className="w-full md:w-1/2">
              <label htmlFor="end-date">Конечная дата</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-4 py-2 rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица с логами */}
      <div className="overflow-auto h-[70vh] w-full mt-7 p-5 rounded-xl scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <table className="table-auto w-full border-separate border-spacing-y-4">
          <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full sticky top-0">
            <tr>
              <th className="text-start px-2 py-1">Дата</th>
              <th className="text-start px-2 py-1">Пользователь</th>
              <th className="text-start px-2 py-1">Действие</th>
              <th className="text-start px-2 py-1">Эндпоинт</th>
            </tr>
          </thead>
          <tbody className="bg-white border-b border-full">
            {actionLogs.map((log) => (
              <tr key={log.actionLoId} className="hover:bg-gray-50">
                <td className="py-4 px-2">{log.timestamp}</td>
                <td className="px-2 py-1">{log.userEmail}</td>
                <td className="px-2 py-1">{log.action}</td>
                <td className="px-2 py-1">{log.endpoint}</td>
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
