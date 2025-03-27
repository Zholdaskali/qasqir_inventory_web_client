import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux'; // Добавлен импорт
import ConfirmationWrapper from "../../ui/ConfirmationWrapper"; // Добавлен импорт ConfirmationWrapper

const WarehouseContainerSettingModal = ({ setIsContainerSettingModalOpen, container, onClose }) => {
    const [serialNumber, setSerialNumber] = useState(container.serialNumber);
    const [length, setLength] = useState(container.length);
    const [height, setHeight] = useState(container.height);
    const [width, setWidth] = useState(container.width);
    const authToken = useSelector((state) => state.token.token);

    const handleSubmit = async () => { // Убрал e.preventDefault(), так как вызывается через ConfirmationWrapper
        if (!serialNumber || !length || !height || !width) {
            toast.error("Заполните все поля");
            return;
        }

        try {
            const payload = {
                serialNumber,
                length: parseFloat(length),
                height: parseFloat(height),
                width: parseFloat(width),
            };

            const response = await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/warehouse/container/${container.id}`,
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            toast.success(response?.data?.message || "Контейнер успешно обновлен");
            if (onClose) {
                onClose(true); // Закрыть модальное окно и обновить данные
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении контейнера");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Настройка контейнера</h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4"> {/* Предотвращаем отправку формы */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Серийный номер</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Длина (м)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Высота (м)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ширина (м)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsContainerSettingModalOpen(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Отмена
                        </button>
                        <ConfirmationWrapper
                            title="Подтверждение сохранения"
                            message="Вы уверены, что хотите сохранить изменения для этого контейнера?"
                            onConfirm={handleSubmit}
                        >
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Сохранить
                            </button>
                        </ConfirmationWrapper>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseContainerSettingModal;