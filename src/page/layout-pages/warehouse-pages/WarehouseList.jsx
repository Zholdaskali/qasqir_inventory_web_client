import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import { API_GET_WAREHOUSE_LIST } from "../../../api/API";
import { saveWarehouseList } from "../../../store/slices/warehouseSlice/warehouseListSlice";
import WarehouseDetailPanel from "./WarehouseDetailPanel";
import WarehouseSaveModal from "../../../components/modal-components/warehouse-modal/WarehouseSaveModal";

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isWarehouseSaveModalOpen, setIsWarehouseSaveModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();

    const fetchWarehouseList = async () => {
        try {
            const response = await axios.get(API_GET_WAREHOUSE_LIST, {
                headers: { "Auth-token": authToken },
            });
            if (response.data && Array.isArray(response.data.body)) {
                const validatedData = response.data.body.map((warehouse) => ({
                    ...warehouse,
                    warehouseCapacity: parseFloat(warehouse.warehouseCapacity) || 0,
                    latitude: warehouse.latitude || null,
                    longitude: warehouse.longitude || null,
                }));
                setWarehouses(validatedData);
                dispatch(saveWarehouseList(validatedData));
            } else {
                toast.error("Некорректные данные от сервера");
            }
        } catch (error) {
            toast.error("Ошибка загрузки складов: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        if (authToken) fetchWarehouseList();
    }, [authToken]);

    const handleModalClose = () => {
        setIsWarehouseSaveModalOpen(false);
        fetchWarehouseList();
    };

    const handleWarehouseClick = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        fetchWarehouseList();
        setTimeout(() => setSelectedWarehouse(null), 300);
    };

    const exportToCSV = () => {
        const headers = ["Название", "Заполненность", "Местоположение", "Координаты", "Дата создания", "Зоны"];
        const rows = warehouses.map((warehouse) => [
            warehouse.name,
            warehouse.warehouseCapacity.toFixed(1),
            warehouse.location || "—",
            warehouse.latitude && warehouse.longitude 
                ? `"${warehouse.latitude.toFixed(4)}, ${warehouse.longitude.toFixed(4)}"` // Оборачиваем в кавычки
                : "—",
            warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "—",
            warehouse.zonesCount || 0,
        ]);
    
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((row) => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "warehouses_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredWarehouses = warehouses.filter((warehouse) =>
        warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full min-h-screen p-4 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col max-w-7xl mx-auto space-y-4">
                {/* Заголовок с кнопкой экспорта */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl shadow-md">
                    <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-1.5">
                        <IoIosNotificationsOutline size={22} className="text-blue-600" />
                        <span>Склады ({filteredWarehouses.length})</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Найти склад..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 shadow-sm transition-all duration-200 hover:shadow-md placeholder-gray-400"
                        />
                        <button
                            onClick={exportToCSV}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Экспорт в CSV
                        </button>
                    </div>
                </div>

                {/* Сетка складов */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredWarehouses.length > 0 ? (
                        filteredWarehouses.map((warehouse) => {
                            const capacity = warehouse.warehouseCapacity || 0;
                            const hasCoordinates = warehouse.latitude !== null && warehouse.longitude !== null;
                            return (
                                <div
                                    key={warehouse.id}
                                    className="bg-white shadow-md rounded-lg p-4 border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                                    onClick={() => handleWarehouseClick(warehouse)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-base font-semibold text-gray-900 truncate max-w-[70%] leading-tight">
                                            {warehouse.name}
                                        </h2>
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                                                capacity < 50
                                                    ? "bg-red-100 text-red-600"
                                                    : capacity < 80
                                                    ? "bg-orange-100 text-orange-600"
                                                    : "bg-green-100 text-green-600"
                                            }`}
                                        >
                                            {capacity.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(capacity, 100)}%`,
                                                backgroundColor:
                                                    capacity < 50 ? "#f87171" : capacity < 80 ? "#fb923c" : "#34d399",
                                            }}
                                        />
                                    </div>
                                    <ul className="space-y-1 text-xs text-gray-700">
                                        <li className="flex items-center gap-1 truncate">
                                            <FaMapMarkerAlt size={10} className="text-gray-500 flex-shrink-0" />
                                            <span>{warehouse.location || "—"}</span>
                                        </li>
                                        {hasCoordinates && (
                                            <li className="flex items-center gap-1 truncate">
                                                <FaMapMarkerAlt size={10} className="text-blue-500 flex-shrink-0" />
                                                <span>
                                                    {warehouse.latitude.toFixed(4)}, {warehouse.longitude.toFixed(4)}
                                                </span>
                                            </li>
                                        )}
                                        <li className="truncate">
                                            <span className="font-medium">Создан:</span>{" "}
                                            {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "—"}
                                        </li>
                                        <li>
                                            <span className="font-medium">Зон:</span> {warehouse.zonesCount || 0}
                                        </li>
                                    </ul>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full bg-white rounded-lg shadow-sm p-4 text-center">
                            <p className="text-gray-600 text-base">Склады не найдены</p>
                            <p className="text-gray-500 text-xs mt-1">Попробуйте изменить запрос</p>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="fixed bottom-6 right-6 w-10 h-10 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center "
                onClick={() => setIsWarehouseSaveModalOpen(true)}
                title="Добавить склад"
            >
                +
            </button>

            {isWarehouseSaveModalOpen && (
                <WarehouseSaveModal
                    authToken={authToken}
                    setIsWarehouseSaveModalOpen={setIsWarehouseSaveModalOpen}
                    onClose={handleModalClose}
                />
            )}

            <WarehouseDetailPanel
                warehouse={selectedWarehouse}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </div>
    );
};

export default WarehouseList;