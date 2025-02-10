import React, { useState, useEffect, useRef } from 'react';
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useSelector } from "react-redux";
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import ZoneSettingModal from '../../components/modal-components/warehouse-modal/ZoneSettingModal'
import axios from "axios";

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

    const menuRef = useRef(null);

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
        setIsSettingModalOpen(true)
    };

    const handleSettingModalClose = () => {
        setIsSettingModalOpen(false)
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



    return (
        <div className={`p-4 rounded-lg ${isChild ? 'bg-red-50' : 'bg-blue-50'} mb-4`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="font-medium">{zone.name || "ZONE NAME"}</h3>
                    <p className="text-sm text-gray-600">ZONEID #{zone.id}</p>
                </div>
                <div className="flex gap-2 relative" ref={menuRef}>
                    {/* Кнопка "+" отображается только для родительских зон */}
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
                        <BiDotsVerticalRounded /> {/* Кнопка для открытия меню */}
                    </button>

                    {/* Всплывающее меню */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    console.log('Настройки зоны');
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
                        </div>
                    )}
                </div>
            </div>

            {/* Устанавливаем фиксированную высоту и скроллинг для информации о зоне */}
            <div className="text-sm text-gray-500 mt-4" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <p>Дата создания: {zone.createAt ? new Date(zone.createAt).toLocaleDateString() : "Неизвестно"}</p>
                <p>Последнее изменение: {zone.updateAt ? new Date(zone.updateAt).toLocaleDateString() : "Неизвестно"}</p>
            </div>
            <div className="text-sm text-gray-500 mt-4" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <p>Высота: {zone.height ? zone.height : "Не указано"}</p>
                <p>Длина: {zone.length ? zone.length : "Не указано"}</p>
                <p>Ширина: {zone.width ? zone.width : "Не указано"}</p>
            </div>

            {/* Модальное окно */}
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
                    onClose={() => setIsSettingModalOpen(false)} // Добавляем onClose
                    warehouseId={warehouse.id}
                />
            )}

        </div>
    );
};

export default ZoneCard;
