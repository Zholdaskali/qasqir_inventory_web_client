/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import { saveExceptionLogs } from "../../../store/slices/logSlices/exceptionSlice";
import { API_GET_EXCEPTION_LOGS } from "../../../api/API";
import Notification from "../../../components/notification/Notification";
import LogDashboard from "../../../components/ui/LogDashboard";
import TableHeader from "../../../components/ui/Header";

const ExceptionLogs = () => {
  const date = new Date();
  const currentDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const exceptionLogs = useSelector((state) => state.exceptionLogs || []);
  const authToken = useSelector((state) => state.token.token);

  const fetchExceptionLogs = useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("Пожалуйста, выберите обе даты.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_GET_EXCEPTION_LOGS, {
        params: { startDate, endDate },
        headers: { "Auth-token": authToken },
      });
      const data = response.data.body || [];
      const sortedData =
        data.length > 0
          ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          : [];
      dispatch(saveExceptionLogs(sortedData));
      toast.success("Логи ошибок успешно загружены", { toastId: "fetchSuccess" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ошибка загрузки логов ошибок";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [authToken, dispatch, startDate, endDate]);

  useEffect(() => {
    if (authToken) {
      fetchExceptionLogs();
    }
  }, [authToken, fetchExceptionLogs]);

  const handleCreateException = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const filteredLogs = useMemo(() => {
    return Array.isArray(exceptionLogs)
      ? exceptionLogs.filter((log) =>
          [log.cause, log.message, log.timestamp].some((field) =>
            field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : [];
  }, [exceptionLogs, searchQuery]);

  const columns = useMemo(() => [
    { header: "Причина", accessor: "cause", className: "px-2 text-sm",
      render: (log) => log.cause || "N/A",
    },
    { header: "Сообщение", accessor: "message", className: "px-2 text-sm",
      render: (log) => log.message || "N/A",
    },
    { header: "Дата", accessor: "timestamp", className: "px-2 text-sm",
      render: (log) =>
        log.timestamp && !isNaN(new Date(log.timestamp).getTime())
          ? new Date(log.timestamp).toLocaleString()
          : "N/A",
    },
  ], []);

  const processData = (logs) => {
    const validLogs = logs.filter(
      (log) => log.timestamp && !isNaN(new Date(log.timestamp).getTime())
    );
    const totalLogs = logs.length;
    const uniqueCauses = [...new Set(logs.map((log) => log.cause))].length;
    const mostCommonCause = logs.length > 0
      ? Object.entries(
          logs.reduce((acc, log) => {
            acc[log.cause] = (acc[log.cause] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
      : "N/A";

    const exceptionsPerDay = validLogs.reduce((acc, log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const lineChartData = {
      labels: Object.keys(exceptionsPerDay).sort(),
      datasets: [
        {
          label: "Ошибки по дням",
          data: Object.keys(exceptionsPerDay).sort().map((date) => exceptionsPerDay[date]),
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const causeCounts = logs.reduce((acc, log) => {
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

    return {
      metrics: [
        { label: "Всего ошибок", value: totalLogs },
        { label: "Уникальные причины", value: uniqueCauses },
        { label: "Частая причина", value: mostCommonCause },
      ],
      charts: [
        {
          type: "line",
          data: lineChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: "Количество ошибок" } },
              x: { title: { display: true, text: "Дата" } },
            },
          },
        },
        {
          type: "pie",
          data: pieChartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
          },
        },
      ],
    };
  };

  const handleExport = () => {
    if (!filteredLogs.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = columns.map((col) => col.header);
    const rows = filteredLogs.map((log) => ({
      Причина: log.cause || "N/A",
      Сообщение: log.message || "N/A",
      Дата: log.timestamp && !isNaN(new Date(log.timestamp).getTime())
        ? new Date(log.timestamp).toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Логи ошибок");
    XLSX.writeFile(workbook, `exception_logs_from_${startDate}_to_${endDate}.xlsx`);
    toast.success("Логи ошибок успешно экспортированы в Excel");
  };

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
      <TableHeader
        title="Ошибки"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={handleExport}
        exportDisabled={!filteredLogs.length || loading}
        searchPlaceholder="Поиск по причине, сообщению или дате..."
        onAction={fetchExceptionLogs}
        actionLabel={loading ? "Загрузка..." : "Вывести"}
        actionDisabled={loading || !startDate || !endDate}
      />

      <div className="flex gap-4 mt-3 w-full sm:w-auto">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Начало
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Конец
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
      </div>

      <div className="flex-1 mt-3">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-lg text-red-500">Ошибка: {error}</div>
        ) : (
          <LogDashboard
            data={filteredLogs}
            columns={columns}
            processData={processData}
            exportFilename={`exception_logs_from_${startDate}_to_${endDate}`}
          />
        )}
      </div>

      <Notification />
    </div>
  );
};

export default ExceptionLogs;