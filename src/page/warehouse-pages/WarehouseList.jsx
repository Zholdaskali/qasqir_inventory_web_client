import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { IoIosNotificationsOutline } from "react-icons/io";
import filterIcon from "../../assets/icons/filter.svg";
import { API_GET_WAREHOUSE_LIST } from "../../api/API";
import { saveWarehouseList } from "../../store/slices/warehouseListSlice";
import WarehouseDetailPanel from "../../page/warehouse-pages/WarehouseDetailPanel"; // Добавляем импорт

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null); // Добавляем состояние
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Добавляем состояние
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState(false);

    const fetchWarehouseList = async () => {
        try {
            const response = await axios.get(API_GET_WAREHOUSE_LIST, {
                headers: { "Auth-token": authToken },
            });
            setWarehouses(response.data.body);
            dispatch(saveWarehouseList(response.data.body));
            toast.success("Склады успешно загружены");
        } catch (error) {
            toast.error("Ошибка загрузки складов");
        }
    };

    useEffect(() => {
        fetchWarehouseList();
    }, []);

    const handleWarehouseClick = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        // Опционально: сбрасываем выбранный склад после завершения анимации
        setTimeout(() => setSelectedWarehouse(null), 300);
    };


    const handleCreateWarehouse = () => {
        setCreateWarehouseModal(true)
    };

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <h1 onClick={fetchWarehouseList} className="text-2xl w-full">
                        Склады
                    </h1>
                    <div className="flex items-center w-2/5 gap-x-5">
                        <input
                            type="search"
                            className="shadow-inner w-full px-6 py-2 rounded-lg border"
                            placeholder="Поиск"
                        />
                        <img
                            src={filterIcon}
                            alt="filter"
                            className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
                        />
                        <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
                        <IoIosNotificationsOutline size={50} />
                    </div>
                </div>

                {/* Карточки складов */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {warehouses.length > 0 ? (
                        warehouses.map((warehouse) => (
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
                                                    width: `${(warehouse.usagePercent = 90)}%`,
                                                    backgroundColor:
                                                        warehouse.usagePercent < 50
                                                            ? "green"
                                                            : warehouse.usagePercent < 80
                                                                ? "orange"
                                                                : "red",
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-2">
                                            {warehouse.usagePercent || 0}%
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-600">
                                    Локация: {warehouse.location || "Не указано"}
                                </p>
                                <p className="text-gray-600">
                                    Дата создания:{" "}
                                    {new Date(warehouse.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                    Дата обновления:{" "}
                                    {new Date(warehouse.updatedAt).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                    Зон на складе: {warehouse.zonesCount || "0"}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">Загрузка складов...</p>
                    )}
                </div>
            </div>

            {/* Кнопка добавления */}
            <button
                className="bg-main-dull-blue absolute bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white"
            >
                +
            </button>

            {/* Панель деталей склада */}
            <WarehouseDetailPanel
                warehouse={selectedWarehouse}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </div>
    );
};

export default WarehouseList;