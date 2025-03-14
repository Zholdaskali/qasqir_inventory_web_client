import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

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
                console.log(response.data.message || "Результаты инвентаризации успешно загружены");
            } catch (error) {
                console.error("Ошибка загрузки результатов инвентаризации");
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
                    unit: "шт", // Предполагаем, что единица измерения "шт" (можно изменить)
                };
            }
            acc[key].expectedQuantity += result.expectedQuantity;
            acc[key].actualQuantity += result.actualQuantity;
            return acc;
        }, {});

        // Преобразуем объект в массив
        return Object.values(grouped);
    };

    const exportToExcel = () => {
        // Группируем данные по номенклатуре
        const groupedData = groupByNomenclature(results);

        // Подготовка данных для таблицы
        const tableData = groupedData.map((item, index) => ({
            "№": index + 1,
            "Артикул": item.nomenclatureId,
            "Товар": item.nomenclatureName,
            "Кол-во по учету": item.expectedQuantity,
            "Факт": item.actualQuantity,
            "Ед.": item.unit,
        }));

        // Подсчет итогов
        const totalExpected = groupedData.reduce((sum, item) => sum + item.expectedQuantity, 0);
        const totalActual = groupedData.reduce((sum, item) => sum + item.actualQuantity, 0);

        // Создание листа с заголовками и данными
        const worksheet = XLSX.utils.json_to_sheet([]);

        // Добавление заголовков, как на изображении
        XLSX.utils.sheet_add_aoa(worksheet, [
            ["ИНВЕНТАРИЗАЦИЯ ТОВАРОВ НА СКЛАДЕ № 1 ОТ 15 МАР 2024 г."],
            ["ОТВЕТСТВЕННОСТЬ: Табакова 161 с отличием ответственностью «Alloth»"],
            [],
            ["№", "Артикул", "Товар", "Кол-во по учету", "Факт", "Ед."],
        ], { origin: "A1" });

        // Добавление данных таблицы
        XLSX.utils.sheet_add_json(worksheet, tableData, { skipHeader: true, origin: "A5" });

        // Добавление итоговой строки
        const lastRow = groupedData.length + 5; // Учитываем заголовки
        XLSX.utils.sheet_add_aoa(worksheet, [
            [],
            ["Итого:", "", "", totalExpected, totalActual],
        ], { origin: `A${lastRow}` });

        // Создание книги и сохранение файла
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Инвентаризация");
        XLSX.writeFile(workbook, `Inventory_Results_${auditId}.xlsx`);
    };

    // Группируем данные для отображения в таблице на странице
    const groupedResults = groupByNomenclature(results);

    // Обработчик для кнопки "Назад"
    const handleGoBack = () => {
        window.history.back(); // Возвращает на предыдущую страницу
        // Альтернатива: если используете React Router, замените на:
        // import { useNavigate } from "react-router-dom";
        // const navigate = useNavigate();
        // navigate(-1);
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
                            onClick={exportToExcel}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Экспорт в Excel
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