import React from "react";
import { FiSettings } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";

const BaseTable = ({
  columns,
  data,
  maxHeight = "500px",
  onRowClick,
  onSettingsClick,
}) => {
  // Универсальный рендер ячейки
  const renderCell = (row, column) => {
    const { field, isSettings, isLink, isStatus, className, render } = column;
    let content = row[field];

    // Если есть кастомный рендер
    if (render) {
      return render(row);
    }

    // Если поле — кнопка настроек
    if (isSettings) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick && onSettingsClick(row);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FiSettings className="w-5 h-5 text-gray-600" />
        </button>
      );
    }

    // Если поле — ссылка
    if (isLink) {
      return (
        <div className="flex items-center gap-2">
          {content || "Без названия"}
          <HiOutlineArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    }

    // Если поле — статус (true/false)
    if (isStatus || typeof content === "boolean") {
      return (
        <div
          className={`${
            content ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"
          } inline-flex items-center px-2 py-1 rounded-full text-xs`}
        >
          <div
            className={`${
              content ? "bg-[#11B066]" : "bg-[#E84D43]"
            } h-2 w-2 rounded-full mr-1`}
          />
          <span
            className={`${
              content ? "text-[#11B066]" : "text-[#E84D43]"
            }`}
          >
            {content ? "ПОДТВЕРЖДЕН" : "НЕ ПОДТВЕРЖДЕН"}
          </span>
        </div>
      );
    }

    // Форматирование дат
    if (field && ["createdAt", "updatedAt"].includes(field)) {
      content = content ? new Date(content).toLocaleDateString() : "-";
    }

    // Обработка пустых значений
    if (content === null || content === undefined || content === "") {
      content = "-";
    }

    return content;
  };

  // Универсальный рендер строки
  const renderRow = (row, idx) => (
    <tr
      key={row.id || idx}
      className={`cursor-pointer group ${row.className || "hover:bg-gray-50"}`}
      onClick={() => onRowClick && onRowClick(row)}
    >
      {columns.map((column, colIdx) => (
        <td
          key={column.field || column.title || colIdx}
          className={`px-2 py-2 whitespace-nowrap ${column.className || ""}`}
        >
          {renderCell(row, column)}
        </td>
      ))}
    </tr>
  );

  return (
    <div
      className="overflow-x-auto overflow-y-auto rounded-xl bg-white shadow-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      style={{ maxHeight }}
    >
      <table className="table-auto w-full border-collapse">
        <thead className="text-gray-500 bg-gray-50 sticky top-0 z-10">
          <tr className="h-10">
            {columns.map(({ title, className }, idx) => (
              <th
                key={idx}
                className={`text-start px-2 whitespace-nowrap ${className || ""}`}
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map(renderRow) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BaseTable;