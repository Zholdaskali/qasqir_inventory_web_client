import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { IoIosNotificationsOutline } from "react-icons/io";
import filterIcon from "../../assets/icons/filter.svg";
import { API_GET_WAREHOUSE_LIST } from "../../api/API";
import { saveWarehouseList } from "../../store/slices/warehouseSlice/warehouseListSlice";
import WarehouseDetailPanel from "../../page/warehouse-pages/WarehouseDetailPanel";
import WarehouseSaveModal from "../../components/modal-components/warehouse-modal/WarehouseSaveModal";

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isWarehouseButtonDisabled, setWarehouseButtonDisabled] = useState(false);
    const [isWarehouseSaveModalOpen, setIsWarehouseSaveModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // Состояние для поискового запроса

    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();

    const fetchWarehouseList = async () => {
        try {
            const response = await axios.get(API_GET_WAREHOUSE_LIST, {
                headers: { "Auth-token": authToken },
            });

            // Проверяем, что данные пришли и являются массивом
            if (response.data && Array.isArray(response.data.body)) {
                // Преобразуем warehouseCapacity в число для каждого склада
                const validatedData = response.data.body.map((warehouse) => ({
                    ...warehouse,
                    warehouseCapacity: parseFloat(warehouse.warehouseCapacity) || 0, // Если не число, используем 0
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
        if (authToken) {
            fetchWarehouseList();
        }
    }, [authToken]);

    const handleModalClose = () => {
        setIsWarehouseSaveModalOpen(false);
        fetchWarehouseList(); // Обновляем список складов после добавления
    };

    const handleWarehouseClick = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        fetchWarehouseList(); // Обновляем список складов после закрытия панели
        setTimeout(() => setSelectedWarehouse(null), 300);
    };

    const handleCreateWarehouse = () => {
        setIsWarehouseSaveModalOpen(true);
    };

    // Функция для фильтрации складов на основе поискового запроса
    const filteredWarehouses = warehouses.filter((warehouse) =>
        warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl overflow-auto">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl w-full">Склады</h1>
                    </div>
                    {/* Поле ввода для поиска */}
                    <input
                        type="text"
                        placeholder="Поиск склада..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 item-center">
                    {filteredWarehouses.length > 0 ? (
                        filteredWarehouses.map((warehouse) => {
                            const capacity = warehouse.warehouseCapacity || 0; // Убедимся, что capacity — число
                            return (
                                <div
                                    key={warehouse.id}
                                    className="bg-white shadow-xl rounded-lg p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition duration-300"
                                    onClick={() => handleWarehouseClick(warehouse)}
                                >
                                    <div className="flex justify-between items-center gap-4">
                                        <h2 className="text-2xl font-bold text-gray-1000 mb-2">
                                            {warehouse.name}
                                        </h2>
                                        <div className="flex items-center gap-2 w-1/3">
                                            <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${capacity.toFixed(4)}%`,
                                                        backgroundColor:
                                                            capacity < 50
                                                                ? "red"
                                                                : capacity < 80
                                                                ? "orange"
                                                                : "green",
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-2">
                                                {capacity.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">
                                        Локация: {warehouse.location || "Не указано"}
                                    </p>
                                    <p className="text-gray-600">
                                        Дата создания:{" "}
                                        {warehouse.createdAt
                                            ? new Date(warehouse.createdAt).toLocaleDateString()
                                            : "Не указано"}
                                    </p>
                                    <p className="text-gray-600">
                                        Дата обновления:{" "}
                                        {warehouse.updatedAt
                                            ? new Date(warehouse.updatedAt).toLocaleDateString()
                                            : "Не указано"}
                                    </p>
                                    <p className="text-gray-600">
                                        Зон на складе: {warehouse.zonesCount || "0"}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-600">Склады не найдены</p>
                    )}
                </div>
            </div>

            <button
                className={`bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white ${
                    isWarehouseButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleCreateWarehouse}
                disabled={isWarehouseButtonDisabled}
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