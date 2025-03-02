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

    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();

    const fetchWarehouseList = async () => {
        try {
            const response = await axios.get(API_GET_WAREHOUSE_LIST, {
                headers: { "Auth-token": authToken },
            });
            setWarehouses(response.data.body);
            dispatch(saveWarehouseList(response.data.body));
        } catch (error) {
            toast.error("Ошибка загрузки складов");
        }
    };

    useEffect(() => {
        fetchWarehouseList();
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

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl overflow-auto">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl w-full">Склады</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 item-center">
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
                                                    width: `${(warehouse.warehouseCapacity || 0).toFixed(4)}%`,
                                                    backgroundColor:
                                                        warehouse.warehouseCapacity < 50
                                                            ? "red"
                                                            : warehouse.warehouseCapacity < 80
                                                            ? "orange"
                                                            : "green",
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-2">
                                            {(warehouse.warehouseCapacity || 0).toFixed(2)}%
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