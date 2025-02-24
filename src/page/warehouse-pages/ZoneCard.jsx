import React, { useState, useEffect, useRef } from 'react';
import { BiDotsVerticalRounded } from "react-icons/bi";
import { HiArrowSmDown } from "react-icons/hi"; // Импортируем иконку стрелки
import { useSelector } from "react-redux";
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import ZoneSettingModal from '../../components/modal-components/warehouse-modal/ZoneSettingModal';
import axios from "axios";
import ContainerOrSubzoneCard from './ContainerOrSubzoneCard';
import WarehouseContainerSaveModal from './WarehouseContainerSaveModal';

const ZoneCard = ({ zone, warehouse, onClose }) => {
    const isChild = Boolean(zone.parentId);
    const user = useSelector((state) => state.user);
    const authToken = useSelector((state) => state.token.token);

    const hasRole = (role) => {
        return user?.userRoles && Array.isArray(user.userRoles) && user.userRoles.includes(role);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [containers, setContainers] = useState([]);
    const [isContainersLoading, setIsContainersLoading] = useState(false);
    const [openContainers, setOpenContainers] = useState(false); // Состояние для открытия/закрытия контейнеров
    const menuRef = useRef(null);
    const [isContainerSaveModalOpen, setIsContainerSaveModalOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleCreateZone = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleSettingModalOpen = () => {
        setIsSettingModalOpen(true);
    };

    const handleSettingModalClose = () => {
        setIsSettingModalOpen(false);
    };

    const handleDeleteZone = async () => {
        try {
            const response = await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/warehouses/${zone.id}/zones`,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            console.log(response.data.message);
            if (onClose) {
                onClose(true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Ошибка при удалении зоны";
            console.log(errorMessage);
        }
    };

    const fetchContainers = async () => {
        setIsContainersLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/warehouse-manager/warehouse/container/${zone.id}`,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            setContainers(response.data.body);
        } catch (error) {
            console.error("Ошибка при загрузке контейнеров:", error);
        } finally {
            setIsContainersLoading(false);
        }
    };

    const handleDeleteContainer = async (containerId) => {
        try {
            const response = await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/warehouse/container/${containerId}`,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            console.log(response.data.message);
            setContainers(containers.filter(container => container.id !== containerId));
        } catch (error) {
            console.error("Ошибка при удалении контейнера:", error);
        }
    };

    const toggleContainers = async () => {
        if (!openContainers && containers.length === 0) {
            await fetchContainers(); // Загружаем контейнеры, если они ещё не загружены
        }
        setOpenContainers(!openContainers); // Переключаем состояние видимости
    };

    const maxLength = zone.height + 5;
    const maxWidth = zone.width + 5;
    const maxHeight = zone.height + 5;
    const maxCapacity = zone.capacity + 5;

    return (
        <div className={`p-4 rounded-lg ${isChild ? 'bg-red-50' : 'bg-blue-50'} mb-4`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="font-medium">{zone.name || "ZONE NAME"}</h3>
                    <p className="text-sm text-gray-600">ZONEID #{zone.id}</p>
                </div>
                <div className="flex gap-2 relative" ref={menuRef}>
                    {!isChild && hasRole("warehouse_manager") && (
                        <>
                            <button
                                className="hover:bg-gray-100 rounded"
                                onClick={handleCreateZone}
                            >
                                <span className="text-xl">+</span>
                            </button>
                        </>
                    )}
                    <button
                        className="hover:bg-gray-100 rounded"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <BiDotsVerticalRounded />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleSettingModalOpen();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Настройки
                            </button>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleDeleteZone();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Удалить
                            </button>
                            <button
                                onClick={() => setIsContainerSaveModalOpen(true)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Добавить контейнер
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-sm text-gray-500 mt-4" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <p>Дата создания: {zone.createAt ? new Date(zone.createAt).toLocaleDateString() : "Неизвестно"}</p>
                <p>Последнее изменение: {zone.updateAt ? new Date(zone.updateAt).toLocaleDateString() : "Неизвестно"}</p>
            </div>

            <div className="text-sm text-gray-500 mt-4">
                <div className="mb-2">
                    <p>Длина: {zone.length ? `${zone.length} м` : "Не указано"}</p>
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div
                            className="bg-blue-500 h-2 rounded"
                            style={{ width: `${(zone.length / maxLength) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mb-2">
                    <p>Ширина: {zone.width ? `${zone.width} м` : "Не указано"}</p>
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div
                            className="bg-green-500 h-2 rounded"
                            style={{ width: `${(zone.width / maxWidth) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mb-2">
                    <p>Высота: {zone.height ? `${zone.height} м` : "Не указано"}</p>
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div
                            className="bg-yellow-500 h-2 rounded"
                            style={{ width: `${(zone.height / maxHeight) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mb-2">
                    <p>Остаток емкости: {zone.capacity ? `${zone.capacity} м` : "Не указано"}</p>
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div
                            className="bg-yellow-500 h-2 rounded"
                            style={{ width: `${(zone.capacity / maxCapacity) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Кнопка для открытия/закрытия контейнеров */}
            <button
                className="w-full mt-4 py-2 px-4 text-blue-600 bg-blue-50 rounded-lg
                         hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                onClick={toggleContainers}
            >
                {openContainers ? (
                    <>
                        <span>Скрыть контейнеры</span>
                        <HiArrowSmDown className="w-5 h-5 transform rotate-180 transition-transform" />
                    </>
                ) : (
                    <>
                        <span>Показать контейнеры</span>
                        <HiArrowSmDown className="w-5 h-5" />
                    </>
                )}
            </button>

            {/* Отображение контейнеров */}
            {openContainers && containers.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-medium">Контейнеры:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-1">
                        {containers.map((container) => (
                            <ContainerOrSubzoneCard
                                key={container.id}
                                item={container}
                                type="контейнер"
                                onDelete={handleDeleteContainer}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isModalOpen && (
                <WarehouseZoneSaveModal
                    setIsWarehouseSaveModalOpen={setIsModalOpen}
                    warehouseId={warehouse.id}
                    parentId={zone.id}
                />
            )}
            {isSettingModalOpen && (
                <ZoneSettingModal
                    setIsSettingModalOpen={setIsSettingModalOpen}
                    zone={zone}
                    onClose={() => setIsSettingModalOpen(false)}
                    warehouseId={warehouse.id}
                />
            )}
            {/* Модальное окно создания контейнера */}
            {isContainerSaveModalOpen && (
                <WarehouseContainerSaveModal
                    setIsContainerSaveModalOpen={setIsContainerSaveModalOpen}
                    warehouseZoneId={zone.id}
                    onClose={() => {
                        setIsContainerSaveModalOpen(false);
                        onClose(true); // Обновить данные после создания
                    }}
                />
            )}
        </div>
    );
};

export default ZoneCard;    