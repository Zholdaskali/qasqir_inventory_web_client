import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { IoIosNotificationsOutline } from "react-icons/io";
import { API_GET_WAREHOUSE_LIST } from "../../api/API";
import { saveWarehouseList } from "../../store/slices/warehouseSlice/warehouseListSlice";
import WarehouseDetailPanel from "../../page/warehouse-pages/WarehouseDetailPanel";
import WarehouseSaveModal from "../../components/modal-components/warehouse-modal/WarehouseSaveModal";

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
                }));
                setWarehouses(validatedData);
                dispatch(saveWarehouseList(validatedData));
            } else {
                toast.error("Некорректные данные от сервера");
            }
        } catch (error) {
            toast.error("Ошибка загрузки складов");
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

    const filteredWarehouses = warehouses.filter((warehouse) =>
        warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-screen p-4 overflow-auto bg-gray-50">
            <div className="flex flex-col max-w-7xl mx-auto">
                {/* Заголовок и поиск */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-800">Склады</h1>
                    <input
                        type="text"
                        placeholder="Поиск склада..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>

                {/* Сетка складов */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredWarehouses.length > 0 ? (
                        filteredWarehouses.map((warehouse) => {
                            const capacity = warehouse.warehouseCapacity || 0;
                            return (
                                <div
                                    key={warehouse.id}
                                    className="bg-white shadow-md rounded-lg p-4 border border-gray-100 cursor-pointer hover:shadow-lg transition duration-200"
                                    onClick={() => handleWarehouseClick(warehouse)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h2 className="text-lg font-semibold text-gray-800 truncate max-w-[70%]">
                                            {warehouse.name}
                                        </h2>
                                        <span className="text-xs text-gray-600">{capacity.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 rounded-full mb-2">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.min(capacity, 100)}%`,
                                                backgroundColor:
                                                    capacity < 50 ? "red" : capacity < 80 ? "orange" : "green",
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">
                                        Локация: {warehouse.location || "—"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Создан: {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "—"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Обновлен: {warehouse.updatedAt ? new Date(warehouse.updatedAt).toLocaleDateString() : "—"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Зон: {warehouse.zonesCount || 0}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-600 col-span-full text-center py-4">Склады не найдены</p>
                    )}
                </div>
            </div>

            {/* Кнопка добавления */}
            <button
                className="fixed bottom-6 right-6 w-10 h-10 bg-blue-600 rounded-full shadow-xl text-white text-xl flex items-center justify-center hover:bg-blue-700 transition"
                onClick={() => setIsWarehouseSaveModalOpen(true)}
            >
                +
            </button>

            {/* Модальное окно */}
            {isWarehouseSaveModalOpen && (
                <WarehouseSaveModal
                    authToken={authToken}
                    setIsWarehouseSaveModalOpen={setIsWarehouseSaveModalOpen}
                    onClose={handleModalClose}
                />
            )}

            {/* Панель деталей */}
            <WarehouseDetailPanel
                warehouse={selectedWarehouse}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </div>
    );
};

export default WarehouseList;