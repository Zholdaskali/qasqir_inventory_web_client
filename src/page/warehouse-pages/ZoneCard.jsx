import React, { useState } from 'react';
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useSelector } from "react-redux";
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import axios from "axios";

const ZoneCard = ({ zone, warehouse, onClose }) => {
    const isChild = Boolean(zone.parentId);
    const user = useSelector((state) => state.user);
    const authToken = useSelector((state) => state.token.token); // Получаем токен из состояния

    // Проверка роли пользователя
    const hasRole = (role) => {
        return user?.userRoles && Array.isArray(user.userRoles) && user.userRoles.includes(role);
    };

    // Состояние для управления видимостью модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Открытие модального окна
    const handleCreateZone = () => {
        setIsModalOpen(true);
    };

    // Закрытие модального окна
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // Асинхронная функция для удаления зоны
    const handleDeleteZone = async () => {
        try {
            const response = await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/warehouses/${warehouse.id}/zones/${zone.id}`,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            console.log(response.data.message);
            if (onClose) {
                onClose(true);  // Вызываем onClose после удаления (если передана эта функция)
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
                <div className="flex gap-2">
                    {/* Кнопка "+" отображается только для родительских зон */}
                    {!isChild && hasRole("warehouse_manager") && (
                        <>
                            <button 
                                className="hover:bg-gray-100 rounded"
                                onClick={handleCreateZone}  // Открытие модального окна
                            >
                                <span className="text-xl">+</span>
                            </button>
                            <button 
                                className="hover:bg-gray-100 rounded"
                                onClick={handleDeleteZone}  // Удаление зоны
                            >
                               <BiDotsVerticalRounded /> {/* Кнопка для удаления */}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Устанавливаем фиксированную высоту и скроллинг для информации о зоне */}
            <div className="text-sm text-gray-500 mt-4" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <p>Дата создания: {zone.createAt ? new Date(zone.createAt).toLocaleDateString() : "Неизвестно"}</p>
                <p>Последнее изменение: {zone.updateAt ? new Date(zone.updateAt).toLocaleDateString() : "Неизвестно"}</p>
            </div>

            {/* Модальное окно */}
            {isModalOpen && (
                <WarehouseZoneSaveModal
                    setIsWarehouseSaveModalOpen={setIsModalOpen}  // Функция для закрытия модального окна
                    warehouseId={warehouse.id}  // Идентификатор склада
                    parentId={zone.id}  // Идентификатор родительской зоны
                />
            )}
        </div>
    );
};

export default ZoneCard;
