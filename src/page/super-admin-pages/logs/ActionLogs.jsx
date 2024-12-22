/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveActionLogs } from "../../../store/slices/logSlices/actionLogSlice";
import { API_GET_ACTION_LOGS } from "../../../api/API";

import Notification from "../../../components/notification/Notification";

import filterIcon from '../../../assets/icons/filter.svg'
import { IoIosNotificationsOutline } from "react-icons/io"; //notification none
import { CiCalendarDate } from "react-icons/ci";

const ActionLogs = () => {

  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [error, setError] = useState(null);

  const actionLogs = useSelector((state) => state.actionLogs); // Получаем логи из Redux store
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();



  const [fields, setFields] = useState([]); // Состояние для сохранения названий полей

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
        // Извлекаем названия полей из первого объекта
        const fieldNames = Object.keys(data[0]);
        setFields(fieldNames); // Сохраняем названия полей в стейт

        // Сортировка данных по убыванию даты
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        dispatch(saveActionLogs(sortedData)); // Сохраняем отсортированные логи в Redux
      } else {
        dispatch(saveActionLogs([])); // Очищаем Redux, если данных нет
      }

      toast.success("Успешно", { toastId: "fetchSuccess" }); // Уникальный тост
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };



  // Функция для генерации файла в формате TXT
  const downloadLogsAsTxt = () => {
    if (actionLogs.length === 0) {
      alert("Нет данных для скачивания");
      return;
    }

    const columnHeaders = "Дата | Id пользователя | Действие | Эндпоинт";

    // Преобразуем данные в строку
    const logsContent = [
      columnHeaders,
      ...actionLogs.map((log) => `${log.timestamp} | ${log.userId} | ${log.action} | ${log.endpoint}`)
    ].join("\n")

    // Формируем имя файла, используя текущую дату
    const fileName = `action_logs_from_${startDate}_to_${endDate}.txt`;

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

  return (
    <div className="h-[90vh] w-full flex flex-col justify-center items-center">
      <div className="flex w-full justify-between items-center border-b py-5">
        <h1 className="text-2xl w-1/4">Действия</h1>
        <div className="flex flex-row items-center justify-between gap-x-5">
          <div className="flex gap-x-2 mt-2 flex-row items-center">
            <button
              onClick={fetchActionLogs}
              className="bg-main-dull-gray px-8 text-sm py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue"
            >
              Вывести
            </button>

            <button
              onClick={downloadLogsAsTxt}
              className="bg-main-dull-gray px-8 text-sm py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue"
            >
              Скачать
            </button>
          </div>
          <div className="flex w-1/2 mb-4 items-center gap-x-5">
            <div>
              <label htmlFor="start-date" className="flex items-center gap-x-2">
                <CiCalendarDate />
                <p>Начальная дата</p>
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-4 py-3 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="end-date">Конечная дата</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-4 py-3 rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center w-1/2 gap-x-5">
            <input type="search" className="shadow-inner w-full px-6 py-2 rounded-lg border" placeholder="Поиск" />
            <img src={filterIcon} alt="filter" className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue" />
            <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
            <IoIosNotificationsOutline size={50} />
          </div>
        </div>
      </div>
      <div className="overflow-auto h-[70vh] w-full mt-7 p-5 rounded-xl">
        <table className="table-auto w-full border-separate border-spacing-y-4">
          <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full ">
            <tr className="">
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
