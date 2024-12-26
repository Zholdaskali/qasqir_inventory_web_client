import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ZoneCard from '../warehouse-pages/ZoneCard';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import { HiArrowSmDown, HiRefresh } from "react-icons/hi";

const WarehouseZoneList = () => {
    const location = useLocation();
    const { warehouse } = location.state || {}; // Извлечение объекта warehouse

    if (!warehouse) {
        return <p>Склад не выбран. Выберите склад, чтобы увидеть зоны.</p>;
    }

    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна
    const [error, setError] = useState(null); // Состояние для ошибок
    const [openChildZones, setOpenChildZones] = useState({}); // Состояние для контроля открытых дочерних зон

    const authToken = useSelector((state) => state.token.token);
    const user = useSelector((state) => state.user);

    // Обработка роли пользователя
    const hasRole = (role) => {
        return user?.userRoles && Array.isArray(user.userRoles) && user.userRoles.includes(role);
    };

    const handleCreateZone = () => {
        setIsModalOpen(true);  // Открытие модального окна
    };

    const fetchZones = async () => {
        setLoading(true); // Устанавливаем состояние загрузки
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/employee/warehouses/${warehouse.id}/zones`,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            setZones(response.data.body);
        } catch (error) {
            console.error("Error loading zones:", error);
            setError('Ошибка загрузки зон');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (warehouse?.id) {
            fetchZones();
        }
    }, [warehouse?.id]);

    // Строим иерархию зон
    const buildZoneTree = (zones) => {
        const zoneMap = new Map();
        const rootZones = [];

        zones.forEach(zone => {
            zoneMap.set(zone.id, { ...zone, children: [] });
        });

        zones.forEach(zone => {
            if (zone.parentId) {
                const parent = zoneMap.get(zone.parentId);
                if (parent) {
                    parent.children.push(zoneMap.get(zone.id));
                }
            } else {
                rootZones.push(zoneMap.get(zone.id));
            }
        });

        return rootZones;
    };

    const rootZones = buildZoneTree(zones);

    if (loading) {
        return <p>Загружаем зоны...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    // Функция для переключения состояния открытых дочерних зон
    const toggleChildZones = (zoneId) => {
        setOpenChildZones(prevState => ({
            ...prevState,
            [zoneId]: !prevState[zoneId],  // Переключаем состояние для конкретной зоны
        }));
    };

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex flex-col gap-y-5">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <h2 className="text-2xl w-full">Зоны склада: {warehouse?.name}</h2>
                    <div className="flex items-center gap-5">
                        <p className="text-xl text-gray-500">{zones.length} зон</p>
                        <button
                            onClick={fetchZones}
                            className="flex items-center justify-center bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                            title="Обновить"
                        >
                            <HiRefresh className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Контейнер для родительских зон с ограниченной высотой и прокруткой */}
                <div className="flex flex-wrap gap-20 justify-center overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {rootZones.map((zone) => (
                        <div key={zone.id} className="w-80 flex flex-col bg-white shadow-md rounded-lg p-4 mb-6"> {/* Родительская зона */}
                            <ZoneCard zone={zone} warehouse={warehouse} />

                            {/* Кнопка для открытия/закрытия дочерних зон */}
                            {zone.children.length > 0 && (
                                <button
                                    className="text-blue-800 mt-2 mb-4"
                                    onClick={() => toggleChildZones(zone.id)}
                                >
                                    {openChildZones[zone.id] ? 'Скрыть дочерние зоны' : <HiArrowSmDown />}
                                </button>
                            )}

                            {/* Дочерние зоны внутри родительской зоны */}
                            {openChildZones[zone.id] && zone.children.length > 0 && (
                                <div className="mt-4 flex flex-col gap-4 pl-4 border-l-2 border-gray-300">
                                    {zone.children.map((childZone) => (
                                        <ZoneCard key={childZone.id} zone={childZone} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Кнопка для добавления зоны */}
            {hasRole("warehouse_manager") && (
                <button
                    className="bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white"
                    onClick={handleCreateZone}
                >
                    +
                </button>
            )}

            {/* Модальное окно */}
            {isModalOpen && (
                <WarehouseZoneSaveModal
                    setIsWarehouseSaveModalOpen={setIsModalOpen}  // Функция для закрытия модального окна
                    warehouseId={warehouse.id}  // Идентификатор склада
                    parentId={null}  // Устанавливаем parentId как null для родительской зоны
                />
            )}
        </div>
    );
};

export default WarehouseZoneList;
