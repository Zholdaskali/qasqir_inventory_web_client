/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';

import { toast } from 'react-toastify';

import { saveLogInLogs } from '../../../store/slices/logSlices/logInSlice';
import { API_GET_LOGIN_LOGS } from '../../../api/API';

import filterIcon from '../../../assets/icons/filter.svg'
import { IoIosNotificationsOutline } from "react-icons/io";
import { CiCalendarDate } from "react-icons/ci";
import Notification from '../../../components/notification/Notification';


const LoginLogs = () => {

  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [error, setError] = useState(null);


  const dispatch = useDispatch();
  const logInLogs = useSelector((state) => state.logInLogs)
  const authToken = useSelector((state) => state.token.token);


  const [fields, setFields] = useState([]);

  const fetchLogInLogs = async () => {
    setError(null);
    try {
      const response = await axios.get(API_GET_LOGIN_LOGS, {
        params: { startDate, endDate },
        headers: { "Auth-token": authToken },
      });

      const data = response.data.body;

      if (data?.length > 0) {
        // Сортировка логов по убыванию даты
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        dispatch(saveLogInLogs(sortedData));
      }

      toast.success("Успешно", { toastId: "fetchSuccess" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Не удалось загрузить логи";
      setError(errorMessage);
      toast.error(error.response?.data?.message);
    }
  };


  const downloadLogsAsTxt = () => {
    if (logInLogs.length === 0) {
      alert("Нет данных для скачивания");
      return;
    }

    const columnHeaders = "ID | ID пользователя | Дата";

    // Преобразуем данные в строку
    const logsContent = [
      columnHeaders,
      ...logInLogs.map((log) => `[${log.loginLogId}]  | ${log.userId} | ${log.timestamp}`)
    ].join("\n");

    // Формируем имя файла, используя текущую дату
    const fileName = `login_logs_from_${startDate}_to_${endDate}.txt`;

    // Создаем Blob объект с типом текста
    const blob = new Blob([logsContent], { type: "text/plain;charset=utf-8" });

    // Создаем URL для загрузки
    const url = URL.createObjectURL(blob);

    // Создаем ссылку и инициируем клик для загрузки
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; // Устанавливаем имя файла
    link.click();

    // Освобождаем созданный URL
    URL.revokeObjectURL(url);
  };


  // ... existing code ...
  return (
    <div className="h-screen w-full flex flex-col overflow-y-auto p-4">
        {/* Заголовок и фильтры */}
        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center border-b py-5">
            <h1 className="text-2xl mb-4 md:mb-0 md:w-1/4">Входы</h1>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full md:w-3/4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={fetchLogInLogs}
                            className="bg-main-dull-gray px-4 md:px-8 text-sm py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue w-full md:w-auto"
                        >
                            Вывести
                        </button>
                        <button
                            onClick={downloadLogsAsTxt}
                            className="bg-main-dull-gray px-4 md:px-8 text-sm py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue w-full md:w-auto"
                        >
                            Скачать
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="w-full md:w-auto">
                            <label htmlFor="start-date" className="flex items-center gap-x-2 mb-2">
                                <CiCalendarDate />
                                <p>Начальная дата</p>
                            </label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border px-4 py-3 rounded-lg w-full"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label htmlFor="end-date" className="flex items-center gap-x-2 mb-2">
                                <CiCalendarDate />
                                <p>Конечная дата</p>
                            </label>
                            <input
                                type="date"
                                id="end-date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border px-4 py-3 rounded-lg w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
  
        {/* Таблица с логами */}
        <div className="flex-1 overflow-hidden mt-4">
            <div className="h-full overflow-auto rounded-xl">
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-start">ID Пользователя</th>
                            <th className="px-4 py-3 text-start">Имя Пользователя</th>
                            <th className="px-4 py-3 text-start">Дата</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {logInLogs.map((log) => (
                            <tr key={log.loginLogId} className="hover:bg-gray-50">
                                <td className="py-4 px-4 text-start">{log.userId}</td>
                                <td className="py-4 px-4 text-start">{log.userName}</td>
                                <td className="py-4 px-4 text-start">{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <Notification />
    </div>
  );
}

export default LoginLogs;
