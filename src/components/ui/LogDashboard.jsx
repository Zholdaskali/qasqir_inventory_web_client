import { Line, Pie } from "react-chartjs-2";
import BaseTable from "./BaseTable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const LogDashboard = ({ data = [], columns = [], processData, exportFilename }) => {
  const { metrics, charts } = processData ? processData(data) : { metrics: [], charts: [] };

  const exportToExcel = () => {
    if (!data.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = columns.map((col) => col.header);
    const excelData = [
      headers,
      ...data.map((row) =>
        columns.map((col) => (row[col.accessor] !== undefined && row[col.accessor] !== null ? row[col.accessor] : "N/A"))
      ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Лог");
    XLSX.writeFile(workbook, `${exportFilename || "log"}_${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast.success("Данные экспортированы в Excel");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Метрики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics.map(({ label, value }, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center"
          >
            <h4 className="text-sm font-semibold text-gray-600">{label}</h4>
            <p
              className={`text-3xl font-bold ${
                label === "Частое действие"
                  ? "text-purple-600 truncate text-lg"
                  : "text-blue-600"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map(({ type, data, options }, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">
              {type === "line" ? "Действия по дням" : "Распределение действий"}
            </h3>
            <div className="h-64">
              {type === "line" && <Line data={data} options={options} />}
              {type === "pie" && <Pie data={data} options={options} />}
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка экспорта */}
      <div className="flex justify-end mb-2">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          disabled={!data.length}
          title="Экспорт таблицы в Excel"
        >
          Экспорт в Excel
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl shadow-lg">
        {data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Нет данных для отображения</div>
        ) : (
          <BaseTable
            columns={columns.map((col) => ({
              title: col.header,
              field: col.accessor, // Align with BaseTable's expected 'field' property
              className: "text-left",
            }))}
            data={data}
            onRowClick={(row) => console.log("Row clicked:", row)} // Optional: Add row click handler
            onSettingsClick={(row) => console.log("Settings clicked:", row)} // Optional: Add settings click handler
          />
        )}
      </div>
    </div>
  );
};

export default LogDashboard;