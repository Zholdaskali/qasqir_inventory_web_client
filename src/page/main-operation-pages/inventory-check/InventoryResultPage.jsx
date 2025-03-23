import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const InventoryResultPage = () => {
    const { auditId } = useParams();
    const { state } = useLocation(); // Получаем данные из navigate
    const inventory = state?.inventory || {};
    const [results] = useState(inventory.result || []);

    // Функция для группировки данных по номенклатуре
    const groupByNomenclature = (data) => {
        const grouped = data.reduce((acc, result) => {
            const key = result.nomenclatureName;
            if (!acc[key]) {
                acc[key] = {
                    nomenclatureName: key,
                    nomenclatureId: result.nomenclatureId || "",
                    expectedQuantity: 0,
                    actualQuantity: 0,
                    unit: "шт", // Установите значение по умолчанию, если unit отсутствует
                };
            }
            acc[key].expectedQuantity += result.expectedQuantity || 0;
            acc[key].actualQuantity += result.actualQuantity || 0;
            return acc;
        }, {});
        return Object.values(grouped);
    };

    // Экспорт в CSV (без изменений, только используем results)
    const exportToCSV = () => {
        if (!results.length) {
            toast.error("Нет данных для экспорта");
            return;
        }

        const groupedData = groupByNomenclature(results);
        const headers = ["№", "Артикул", "Товар", "Кол-во", "Кол-во по учету", "Ед."];
        const rows = groupedData.map((item, index) => [
            index + 1,
            `"${item.nomenclatureId}"`,
            `"${item.nomenclatureName}"`,
            item.actualQuantity,
            item.expectedQuantity,
            `"${item.unit}"`,
        ]);

        const metaData = [
            `"Инвентаризация товаров на складе № ${inventory.warehouseId} от ${inventory.auditDate}"`,
            `"Организация:","Товарищество с ограниченной ответственностью «Alioth»"`,
            `"Склад:","${inventory.warehouseName}"`,
            `"Валюта:","KZT"`,
            "",
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + [...metaData, headers.join(","), ...rows.map(row => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inventory_Results_${auditId}_${inventory.auditDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Данные экспортированы в CSV");
    };

    const groupedResults = groupByNomenclature(results);
    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">
                Результаты инвентаризации #{auditId}
            </h2>

            {/* Вывод информации о складе */}
            <div className="text-center text-lg mt-2">
                Склад: {inventory.warehouseName} (ID: {inventory.warehouseId})<br />
                Дата аудита: {inventory.auditDate}<br />
                Создатель: {inventory.createdBy}<br />
                Дата создания: {new Date(inventory.createdAt).toLocaleString()}
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleGoBack}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                    >
                        ← Назад
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="bg-green-600 px-5 py-2 text-sm text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200"
                    >
                        Экспорт в CSV
                    </button>
                </div>
                {groupedResults.length > 0 ? (
                    <table className="w-full border border-gray-300">
                        <thead className="bg-gray-200 text-gray-700 text-sm">
                            <tr>
                                <th className="border border-gray-300 px-2 py-1 text-left">№</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Артикул</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Товар</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Кол-во</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Кол-во по учету</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">Ед.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedResults.map((result, index) => (
                                <tr key={index} className="bg-white hover:bg-gray-100">
                                    <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                                    <td className="border border-gray-300 px-2 py-1">{result.nomenclatureId}</td>
                                    <td className="border border-gray-300 px-2 py-1">{result.nomenclatureName}</td>
                                    <td className="border border-gray-300 px-2 py-1">{result.actualQuantity}</td>
                                    <td className="border border-gray-300 px-2 py-1">{result.expectedQuantity}</td>
                                    <td className="border border-gray-300 px-2 py-1">{result.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center text-lg">Нет данных о результатах</div>
                )}
            </div>
        </div>
    );
};

export default InventoryResultPage;