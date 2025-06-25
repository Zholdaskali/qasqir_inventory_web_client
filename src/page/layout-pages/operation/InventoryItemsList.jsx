import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { Search, MapPin, Info, X, Download } from "lucide-react";
import * as XLSX from "xlsx"; // Импортируем библиотеку xlsx

// Define the API endpoint constant
const API_GET_INVENTORY_ITEMS_BY_CODE = "http://localhost:8081/api/v1/employee/warehouse/items/{code}";

const InventoryItemsList = () => {
    const authToken = useSelector((state) => state.token.token);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [selectedItem, setSelectedItem] = useState(null);
    const modalRef = useRef(null); // Ref для модального окна

    // Получаем параметр code из URL
    const { code: urlCode } = useParams();

    // Debounced fetch function
    const fetchInventoryItems = useCallback(
        debounce(async (nomenclatureCode) => {
            if (!nomenclatureCode.trim()) {
                setItems([]);
                setError(null);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    API_GET_INVENTORY_ITEMS_BY_CODE.replace("{code}", encodeURIComponent(nomenclatureCode)),
                    {
                        headers: { "Auth-token": authToken },
                    }
                );
                const fetchedItems = Array.isArray(response.data.body) ? response.data.body : [];
                setItems(fetchedItems);
                toast.success(response.data.message || "Элементы инвентаризации загружены");
            } catch (error) {
                setItems([]);
                setError(error.response?.data?.message || "Ошибка загрузки данных");
                toast.error(error.response?.data?.message || "Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        }, 500),
        [authToken]
    );

    // Устанавливаем код из URL при загрузке компонента
    useEffect(() => {
        if (urlCode) {
            setCode(urlCode);
        }
    }, [urlCode]);

    // Trigger fetch when code changes
    useEffect(() => {
        fetchInventoryItems(code);
    }, [code, fetchInventoryItems]);

    // Format location for display
    const getLocationString = (item) => {
        const warehouse = item.warehouseZone?.warehouseName || "Не указан склад";
        const zone = item.warehouseZone?.name || "Не указана зона";
        const container = item.warehouseContainer?.serialNumber || "Не указан контейнер";
        return `${warehouse} > ${zone} > ${container}`;
    };

    // Sorting function
    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Sorted items
    const sortedItems = [...items].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue, bValue;
        if (sortConfig.key === "location") {
            aValue = getLocationString(a).toLowerCase();
            bValue = getLocationString(b).toLowerCase();
        } else {
            aValue = a[sortConfig.key] ?? "";
            bValue = b[sortConfig.key] ?? "";
        }

        if (sortConfig.key === "quantity") {
            return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInventoryItems(code);
    };

    // Open/close modal
    const openDetails = (item) => {
        setSelectedItem(item);
    };

    const closeDetails = () => {
        setSelectedItem(null);
    };

    // Export to Excel
    const exportToExcel = () => {
        try {
            // Формируем данные для экспорта
            const data = sortedItems.map((item) => ({
                ID: item.id,
                Номенклатура: `${item.nomenclatureName || "-"} (ID: ${item.nomenclatureId})`,
                Количество: item.quantity || 0,
                "Ед. измерения": item.measurementUnit || "-",
                Код: item.code || "-",
                Местоположение: getLocationString(item),
                "Склад": item.warehouseZone?.warehouseName || "Не указан",
                "Зона": item.warehouseZone?.name || "Не указана",
                "Контейнер": item.warehouseContainer?.serialNumber || "Не указан",
            }));

            // Создаём новый лист Excel
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Инвентаризация");

            // Настраиваем ширину столбцов (опционально)
            worksheet["!cols"] = [
                { wch: 10 }, // ID
                { wch: 30 }, // Номенклатура
                { wch: 15 }, // Количество
                { wch: 15 }, // Ед. измерения
                { wch: 15 }, // Код
                { wch: 40 }, // Местоположение
                { wch: 20 }, // Склад
                { wch: 20 }, // Зона
                { wch: 20 }, // Контейнер
            ];

            // Экспортируем файл
            XLSX.writeFile(workbook, `inventory_items_${code || "all"}.xlsx`);
            toast.success("Данные экспортированы в Excel");
        } catch (error) {
            toast.error("Ошибка экспорта в Excel");
            console.error("Export to Excel failed:", error);
        }
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
            <div className="flex flex-col gap-y-5 overflow-auto">
                {/* Header and Search */}
                <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Элементы инвентаризации</h1>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Введите код номенклатуры"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="pl-8 pr-2 py-2 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="p-2 bg-blue-500 text-white rounded-md text-sm flex items-center gap-1 hover:bg-blue-600 disabled:bg-blue-300"
                                disabled={loading}
                            >
                                {loading ? "Загрузка..." : "Поиск"}
                            </button>
                        </form>
                        <button
                            onClick={exportToExcel}
                            className="p-2 bg-green-500 text-white rounded-md text-sm flex items-center gap-1 hover:bg-green-600"
                            disabled={sortedItems.length === 0}
                        >
                            <Download size={16} /> Excel
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="text-center text-lg text-gray-500">Загрузка...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-2 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12 rounded-lg">
                                <tr className="text-sm">
                                    <th className="text-left px-4 py-2 cursor-pointer" onClick={() => requestSort("id")}>
                                        ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-left px-4 py-2 cursor-pointer" onClick={() => requestSort("nomenclatureName")}>
                                        Номенклатура {sortConfig.key === "nomenclatureName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-left px-4 py-2 cursor-pointer" onClick={() => requestSort("quantity")}>
                                        Количество {sortConfig.key === "quantity" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-left px-4 py-2 cursor-pointer" onClick={() => requestSort("measurementUnit")}>
                                        Ед. измерения {sortConfig.key === "measurementUnit" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-left px-4 py-2 cursor-pointer" onClick={() => requestSort("code")}>
                                        Код {sortConfig.key === "code" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-left px-4 py-2 cursor-pointer" onClick={() => requestSort("location")}>
                                        Местоположение {sortConfig.key === "location" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    </th>
                                    <th className="text-left px-4 py-2">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedItems.length > 0 ? (
                                    sortedItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="bg-white border-b cursor-pointer hover:bg-gray-100 rounded-lg shadow-sm"
                                        >
                                            <td className="py-3 px-4">{item.id}</td>
                                            <td className="py-3 px-4">
                                                {item.nomenclatureName || "-"} (ID: {item.nomenclatureId})
                                            </td>
                                            <td className="py-3 px-4">{item.quantity || 0}</td>
                                            <td className="py-3 px-4">{item.measurementUnit || "-"}</td>
                                            <td className="py-3 px-4">{item.code || "-"}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-blue-500" />
                                                    <span title={getLocationString(item)}>
                                                        {getLocationString(item)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 flex gap-2">
                                                <button
                                                    onClick={() => openDetails(item)}
                                                    className="p-1 bg-blue-500 text-white rounded-md text-xs flex items-center gap-1 hover:bg-blue-600"
                                                >
                                                    <Info size={16} /> Подробно
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-500">
                                            {code ? "Данные не найдены" : "Введите код для поиска"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Detailed Location */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Детали местоположения</h2>
                            <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">Номенклатура</h3>
                                <p className="text-lg">{selectedItem.nomenclatureName || "-"} (ID: {selectedItem.nomenclatureId})</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">Код</h3>
                                <p className="text-lg">{selectedItem.code || "-"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">Количество</h3>
                                <p className="text-lg">{selectedItem.quantity || 0} {selectedItem.measurementUnit || ""}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">Местоположение</h3>
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Склад: {selectedItem.warehouseZone?.warehouseName || "Не указан"}</p>
                                            <p className="text-sm text-gray-600">ID: {selectedItem.warehouseZone?.warehouseId || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Зона: {selectedItem.warehouseZone?.name || "Не указана"}</p>
                                            <p className="text-sm text-gray-600">
                                                Размеры: {selectedItem.warehouseZone?.length || 0} × {selectedItem.warehouseZone?.width || 0} × {selectedItem.warehouseZone?.height || 0} м
                                            </p>
                                            <p className="text-sm text-gray-600">Вместимость: {selectedItem.warehouseZone?.capacity || 0} м³</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Контейнер: {selectedItem.warehouseContainer?.serialNumber || "Не указан"}</p>
                                            <p className="text-sm text-gray-600">ID: {selectedItem.warehouseContainer?.id || "-"}</p>
                                            <p className="text-sm text-gray-600">
                                                Размеры: {selectedItem.warehouseContainer?.length || 0} × {selectedItem.warehouseContainer?.width || 0} × {selectedItem.warehouseContainer?.height || 0} м
                                            </p>
                                            <p className="text-sm text-gray-600">Вместимость: {selectedItem.warehouseContainer?.capacity || 0} м³</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={closeDetails}
                            className="mt-6 w-full p-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryItemsList;