import { useEffect, useState } from "react";
import { API_DELETE_WAREHOUSE } from "../../../api/API";
import { useSelector } from "react-redux";
import axios from "axios";
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";
import Notification from "../../../components/notification/Notification";
import { NavLink } from "react-router-dom";
import WarehouseZoneList from "./warehouse-structure/WarehouseZoneList";
import WarehouseSettingsModal from "../../../components/modal-components/WarehouseSettingModal";

const WarehouseDetailPanel = ({ warehouse, isOpen, onClose }) => {
    const [mapState, setMapState] = useState({
        center: [43.238949, 76.889709], // Начальные координаты (по умолчанию)
        zoom: 15,
    });
    const [loading, setLoading] = useState(true);
    const [showZoneSettings, setShowZoneSettings] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [address, setAddress] = useState("");

    const setWarehouse = (updatedWarehouse) => {
        console.log('Updated warehouse:', updatedWarehouse);
    };

    useEffect(() => {
        if (warehouse?.latitude && warehouse?.longitude) {
            setMapState({
                center: [warehouse.latitude, warehouse.longitude],
                zoom: 15,
            });
            setLoading(false);
            fetchAddress(warehouse.latitude, warehouse.longitude);
        } else {
            setLoading(false); // Если warehouse нет, отключаем загрузку
        }
    }, [warehouse]);

    const fetchAddress = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress("Адрес не найден");
            }
        } catch (error) {
            console.error("Ошибка при получении адреса:", error);
            setAddress("Ошибка при получении адреса");
        }
    };

    const authToken = useSelector((state) => state.token.token);

    const handleDeleteWarehouse = async () => {
        try {
            const response = await axios.delete(
                `${API_DELETE_WAREHOUSE}${warehouse?.id}`,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            console.log(response.data.message);
            onClose(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Ошибка при удалении склада";
            console.log(errorMessage);
        }
    };

    const user = useSelector((state) => state.user);
    const hasRole = (role) => user?.userRoles?.includes(role);

    // Если warehouse нет, показываем сообщение
    if (!warehouse) {
        return (
            <div
                className={`fixed inset-y-0 right-0 w-1/3 bg-white shadow-xl transform transition-all duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="h-full flex flex-col justify-center items-center p-6">
                    <p className="text-gray-600 text-lg">Данные о складе отсутствуют</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? "opacity-30" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            <div
                className={`fixed inset-y-0 right-0 w-1/3 bg-white shadow-xl transform transition-all duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-2xl font-bold">{warehouse.name}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 text-2xl transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    <div
                        className={`flex-1 overflow-y-auto p-6 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                    >
                        {showZoneSettings ? (
                            <WarehouseZoneList warehouse={warehouse} />
                        ) : (
                            <>
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Свободное пространство склада</span>
                                        <span className="font-bold">{warehouse.warehouseCapacity || 0}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${warehouse.warehouseCapacity || 0}%`,
                                                backgroundColor:
                                                    (warehouse.warehouseCapacity || 0) < 50
                                                        ? "red"
                                                        : (warehouse.warehouseCapacity || 0) < 80
                                                        ? "orange"
                                                        : "green",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Информация о складе</h3>
                                        <div className="space-y-2 text-gray-600">
                                            <p>Локация: {address || "Не указано"}</p>
                                            <p>Зон на складе: {warehouse.zonesCount || 0}</p>
                                            <p>
                                                Дата создания:{" "}
                                                {warehouse.createdAt
                                                    ? new Date(warehouse.createdAt).toLocaleDateString()
                                                    : "Не указано"}
                                            </p>
                                            <p>
                                                Последнее обновление:{" "}
                                                {warehouse.updatedAt
                                                    ? new Date(warehouse.updatedAt).toLocaleDateString()
                                                    : "Не указано"}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Расположение</h3>
                                        <div className="h-96 rounded-lg overflow-hidden relative">
                                            {loading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                                    <p className="text-gray-600">Загрузка карты...</p>
                                                </div>
                                            )}
                                            {!loading && warehouse.latitude && warehouse.longitude && (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${warehouse.longitude - 0.01}%2C${warehouse.latitude - 0.01}%2C${warehouse.longitude + 0.01}%2C${warehouse.latitude + 0.01}&layer=mapnik&marker=${warehouse.latitude}%2C${warehouse.longitude}`}
                                                    allowFullScreen
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div
                        className={`p-6 border-t flex gap-x-5 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                    >
                        <NavLink
                            to="/warehouse-structure"
                            state={{ warehouse }}
                            className={({ isActive }) =>
                                `flex-1 px-4 py-2 rounded-lg transition-colors duration-200 text-center ${isActive
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`
                            }
                        >
                            Зоны склада
                        </NavLink>

                        <NavLink
                            to={`/warehouse-items/${warehouse.id}`}
                            state={{ warehouse }}
                            className={({ isActive }) =>
                                `flex-1 px-4 py-2 rounded-lg transition-colors duration-200 text-center ${isActive
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`
                            }
                        >
                            Товары склада
                        </NavLink>

                        {hasRole("warehouse_manager") && (
                            <>
                                <button
                                    onClick={() => setShowSettingsModal(true)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-center"
                                >
                                    Настройки
                                </button>
                                <ConfirmationWrapper
                                    title="Все данные пользователя будут удалены !!!"
                                    onConfirm={handleDeleteWarehouse}
                                >
                                    <button className="bg-[#FFF2EA] hover:bg-red-300 text-center text-[#E84D43] px-4 py-2 rounded-lg">
                                        Удалить склад
                                    </button>
                                </ConfirmationWrapper>
                            </>
                        )}
                    </div>
                </div>

                <div className="fixed top-0 right-0 z-20 p-4">
                    <Notification />
                </div>
            </div>
            {showSettingsModal && (
                <WarehouseSettingsModal
                    warehouse={warehouse}
                    onClose={() => setShowSettingsModal(false)}
                    onUpdate={setWarehouse}
                />
            )}
        </>
    );
};

export default WarehouseDetailPanel;