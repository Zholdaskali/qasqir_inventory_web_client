import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const InventoryResultPage = () => {
    const { auditId } = useParams();
    const authToken = useSelector((state) => state.token.token);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventoryResults = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8081/api/v1/storekeeper/inventory-check/result/${auditId}`,
                    {
                        headers: { "Auth-token": authToken },
                    }
                );
                setResults(response.data.body);
                toast.success("Результаты инвентаризации успешно загружены", { toastId: "fetchSuccess" });
            } catch (error) {
                toast.error("Ошибка загрузки результатов инвентаризации");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventoryResults();
    }, [auditId, authToken]);

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
                    unit: "шт", // Предполагаем, что единица измерения "шт"
                };
            }
            acc[key].expectedQuantity += result.expectedQuantity;
            acc[key].actualQuantity += result.actualQuantity;
            return acc;
        }, {});

        // Преобразуем объект в массив
        return Object.values(grouped);
    };

    // Экспорт в CSV
    const exportToCSV = () => {
        if (!results.length) {
            toast.error("Нет данных для экспорта");
            return;
        }

        // Группируем данные по номенклатуре
        const groupedData = groupByNomenclature(results);

        // Заголовки CSV
        const headers = ["№", "Номенклатура", "Артикул", "Ожидаемое кол-во", "Фактическое кол-во", "Ед."];

        // Данные для CSV
        const rows = groupedData.map((item, index) => [
            index + 1,
            `"${item.nomenclatureName}"`,
            `"${item.nomenclatureId}"`,
            item.expectedQuantity,
            item.actualQuantity,
            `"${item.unit}"`,
        ]);

        // Подсчет итогов
        const totalExpected = groupedData.reduce((sum, item) => sum + item.expectedQuantity, 0);
        const totalActual = groupedData.reduce((sum, item) => sum + item.actualQuantity, 0);

        // Добавляем итоговую строку
        rows.push(["Итого:", "", "", totalExpected, totalActual]);

        // Создаем CSV-контент
        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers, ...rows].map(row => row.join(",")).join("\n");

        // Создаем ссылку для скачивания
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Inventory_Results_${auditId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Данные экспортированы в CSV");
    };

    // Группируем данные для отображения в таблице на странице
    const groupedResults = groupByNomenclature(results);

    // Обработчик для кнопки "Назад"
    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">
                Результаты инвентаризации #{auditId}
            </h2>

            {loading ? (
                <div className="text-center text-lg">Загрузка...</div>
            ) : (
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
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">№</th>
                                    <th className="text-left px-2">Номенклатура</th>
                                    <th className="text-left px-2">Артикул</th>
                                    <th className="text-left px-2">Ожидаемое кол-во</th>
                                    <th className="text-left px-2">Фактическое кол-во</th>
                                    <th className="text-left px-2">Ед.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedResults.map((result, index) => (
                                    <tr
                                        key={index}
                                        className="bg-white border-b cursor-pointer hover:bg-gray-200"
                                    >
                                        <td className="py-3 px-2">{index + 1}</td>
                                        <td className="py-3 px-2">{result.nomenclatureName}</td>
                                        <td className="py-3 px-2">{result.nomenclatureId}</td>
                                        <td className="py-3 px-2">{result.expectedQuantity}</td>
                                        <td className="py-3 px-2">{result.actualQuantity}</td>
                                        <td className="py-3 px-2">{result.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center text-lg">Нет данных о результатах</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryResultPage;