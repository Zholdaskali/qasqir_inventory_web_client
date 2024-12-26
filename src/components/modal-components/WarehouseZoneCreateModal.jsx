import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const WarehouseZoneCreateModal = ({ setIsWarehouseSaveModalOpen, warehouseId, parentId }) => {
    const [warehouseZoneName, setWarehouseZoneName] = useState("");  // Состояние для названия зоны
    const [isFormError, setIsFormError] = useState(false);  // Состояние ошибки формы
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId); // Предполагаем, что userId хранится в Redux store



    const saveWarehouseZone = async (e) => {
        e.preventDefault();

        // Проверка на пустое название зоны
        if (!warehouseZoneName.trim()) {
            setIsFormError(true);
            toast.error("Заполните все поля");
            return;
        }

        try {
            console.log("Attempting to send request...");
            const response = await axios.post(
                `http://localhost:8081/api/v1/warehouse-manager/warehouses/${warehouseId}/zones?userId=${userId}`,
                { 
                    name: warehouseZoneName, 
                    parentId: parentId 
                },
                { 
                    headers: { "Auth-token": authToken } 
                }
            );
            console.log("Request successful:", response.data);
            console.log(warehouseZoneName, parentId); // Печать данных после успешного запроса
            toast.success(response.data.message || "Зона успешно добавлена");
            setIsWarehouseSaveModalOpen(false);  // Закрытие модального окна
        } catch (error) {
            console.log("Error occurred:", error); // Логирование ошибки
            toast.error(error.response?.data?.message || "Ошибка при создании зоны");
        }
        

    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Добавить зону склада</h2>
                <form onSubmit={saveWarehouseZone} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-main-dull-blue">Название зоны</label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${isFormError && !warehouseZoneName.trim() ? 'border-red-500' : 'border-main-dull-blue'}`}
                            value={warehouseZoneName}
                            onChange={(e) => {
                                setWarehouseZoneName(e.target.value);
                                setIsFormError(false);  // Сброс ошибки, когда пользователь начинает вводить
                            }}
                            placeholder="Введите название Подзоны"
                        />
                        {isFormError && !warehouseZoneName.trim() && <p className="text-red-500 text-sm">Это поле обязательно</p>}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsWarehouseSaveModalOpen(false)}  // Закрытие модального окна
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark transition"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseZoneCreateModal;
