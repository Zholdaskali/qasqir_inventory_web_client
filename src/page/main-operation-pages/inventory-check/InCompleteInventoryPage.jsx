import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CiCalendarDate } from "react-icons/ci";

const InCompleteInventoryPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const [completedInventories, setCompletedInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        const fetchCompletedInventories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    "http://localhost:8081/api/v1/storekeeper/inventory-check/completed",
                    {
                        headers: { "Auth-token": authToken },
                        params: { startDate, endDate },
                    }
                );
                setCompletedInventories(response.data.body || []);
                console.log(response.data.message || "Список завершенных инвентаризаций успешно загружен");
            } catch (error) {
                console.error("Ошибка загрузки списка завершенных инвентаризаций", error);
                toast.error("Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        };
        fetchCompletedInventories();
    }, [authToken, startDate, endDate]);

    const exportToCSV = (inventory) => {
        const results = inventory.result || [];
        if (!results.length) {
            toast.error("Нет данных для экспорта");
            return;
        }

        const headers = [
            "№",
            "ID записи",
            "ID номенклатуры",
            "Название номенклатуры",
            "ID зоны",
            "Название зоны",
            "Ожидаемое количество",
            "Фактическое количество",
            "Расхождение",
            "Дата создания записи",
        ];

        const rows = results.map((item, index) => [
            index + 1,
            item.id,
            item.nomenclatureId,
            `"${item.nomenclatureName}"`,
            item.zoneId,
            `"${item.zoneName}"`,
            item.expectedQuantity,
            item.actualQuantity,
            item.discrepancy,
            `"${new Date(item.createdAt).toLocaleString()}"`,
        ]);

        const metaData = [
            `"Инвентаризация товаров на складе № ${inventory.warehouseId} от ${inventory.auditDate}"`,
            `"Организация:","Товарищество с ограниченной ответственностью «Alioth»"`,
            `"Склад:","${inventory.warehouseName}"`,
            `"Валюта:","KZT"`,
            "",
        ];

        const csvContent = "data:text/csv;charset=utf-8," + [...metaData, headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inventory_Results_${inventory.inventoryId}_${inventory.auditDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Данные экспортированы в CSV");
    };

    const toggleCard = (inventoryId) => {
        setExpandedCard(expandedCard === inventoryId ? null : inventoryId);
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            {/* Заголовок и фильтры */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
                <h1 className="text-xl font-semibold text-main-dull-gray">Завершенные инвентаризации</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="flex gap-2 sm:w-auto">
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

            {loading ? (
                <div className="text-center text-lg mt-4">Загрузка...</div>
            ) : completedInventories.length > 0 ? (
                <div className="space-y-6 mt-4">
                    {completedInventories.map((inventory) => {
                        const results = inventory.result || [];
                        const isExpanded = expandedCard === inventory.inventoryId;

                        return (
                            <div
                                key={inventory.inventoryId}
                                className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                            >
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => toggleCard(inventory.inventoryId)}
                                >
                                    <h3 className="text-lg font-semibold text-main-dull-gray">
                                        Инвентаризация #{inventory.inventoryId}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {isExpanded ? "Свернуть" : "Развернуть"}
                                    </span>
                                </div>

                                <div className="mt-2 text-sm text-gray-700">
                                    <p>Склад: {inventory.warehouseName} (ID: {inventory.warehouseId})</p>
                                    <p>Дата аудита: {inventory.auditDate}</p>
                                    <p>Статус: {inventory.status}</p>
                                    <p>Создатель: {inventory.createdBy}</p>
                                    <p>Дата создания: {new Date(inventory.createdAt).toLocaleString()}</p>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4">
                                        {results.length > 0 ? (
                                            <>
                                                <table className="w-full border border-gray-300 text-sm">
                                                    <thead className="bg-gray-100 text-gray-700">
                                                        <tr>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">№</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">ID записи</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">ID номенклатуры</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Название номенклатуры</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">ID зоны</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Название зоны</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Ожидаемое кол-во</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Фактическое кол-во</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Расхождение</th>
                                                            <th className="border border-gray-300 px-2 py-1 text-left">Дата создания</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {results.map((result, index) => (
                                                            <tr key={result.id} className="hover:bg-gray-50">
                                                                <td className="border border-gray-300 px-2 py-1">{index + 1}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.id}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.nomenclatureId}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.nomenclatureName}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.zoneId}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.zoneName}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.expectedQuantity}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.actualQuantity}</td>
                                                                <td className="border border-gray-300 px-2 py-1">{result.discrepancy}</td>
                                                                <td className="border border-gray-300 px-2 py-1">
                                                                    {new Date(result.createdAt).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <button
                                                    onClick={() => exportToCSV(inventory)}
                                                    className="mt-4 bg-green-600 px-4 py-2 text-sm text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200"
                                                >
                                                    Экспорт в CSV
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center text-gray-500">Нет данных о результатах</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center text-lg mt-4">Нет завершенных инвентаризаций</div>
            )}
        </div>
    );
};

export default InCompleteInventoryPage;