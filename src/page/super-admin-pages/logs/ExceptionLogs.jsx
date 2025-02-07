/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { saveExceptionLogs } from "../../../store/slices/logSlices/exceptionSlice";
import { API_GET_EXCEPTION_LOGS } from "../../../api/API";

import filterIcon from '../../../assets/icons/filter.svg'
import { IoIosNotificationsOutline } from "react-icons/io"; //notification none
import { CiCalendarDate } from "react-icons/ci";
import Notification from "../../../components/notification/Notification";

const ExceptionLogs = () => {

    const date = new Date();
    const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    const [startDate, setStartDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(currentDate);
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const exceptionLogs = useSelector((state) => state.exceptionLogs);
    const authToken = useSelector((state) => state.token.token);

    console.log(startDate, endDate)

    const [fields, setFields] = useState([]);
    const fetchExceptionLogs = async () => {
        setError(null);
        if (!startDate || !endDate) {
            setError("Пожалуйста, выберите обе даты.");
            toast.error("Пожалуйста, выберите обе даты.");
            return;
        }
        try {
            const response = await axios.get(API_GET_EXCEPTION_LOGS, {
                params: { startDate, endDate },
                headers: { "Auth-token": authToken },
            });

            const data = response.data.body;

            if (data?.length > 0) {
                const fieldNames = Object.keys(data[0]);
                setFields(fieldNames);

                // Сортировка логов по убыванию даты
                const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                dispatch(saveExceptionLogs(sortedData));
            } else {
                dispatch(saveExceptionLogs([]));
            }

            toast.success("Успешно", { toastId: "fetchSuccess" });
        } catch (error) {
            setError(error.response?.data?.message || "Не удалось загрузить логи");
            toast.error(error.message || "Произошла ошибка");
        }
    };


    const downloadLogsAsTxt = () => {
        const columnHeaders = "ID | Причина | Сообщение | Дата";
        const logsContent = [
            columnHeaders,
            ...exceptionLogs.map(
                (log) =>
                    `${log.exceptionId} | ${log.cause} | ${log.message} | ${log.timestamp}`
            ),
        ].join("\n");

        const blob = new Blob([logsContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `exception_logs_from_${startDate}_to_${endDate}.txt`;
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-[90vh] flex flex-col w-full justify-center items-center">
            <div className="flex w-full justify-between items-center border-b py-5">
                <h1 className="text-2xl w-1/4">Ошибки</h1>
                <div className="flex flex-row items-center justify-between gap-x-5 3/4">
                    <div className="flex gap-x-2 mt-2 flex-row items-center">
                        <button
                            onClick={fetchExceptionLogs}
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
                </div>
            </div>
            <div className="overflow-auto h-[70vh] w-full mt-7 p-5 rounded-xl">
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full ">
                        <tr>
                            <th className="px-2 py-1 text-start">Причина</th>
                            <th className="px-2 py-1 text-start">Сообщение</th>
                            <th className="px-2 py-1 text-start">Дата</th>
                        </tr>
                    </thead>
                    <tbody className="text-center bg-white border-b border-full ">
                        {exceptionLogs.map((log) => (
                            <tr key={log.exceptionId} className="hover:bg-gray-50 ">
                                <td className=" py-4 px-2 ">{log.cause}</td>
                                <td className=" py-4 px-2 ">{log.message}</td>
                                <td className=" py-4 px-2 ">{log.timestamp}</td>
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
