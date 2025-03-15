import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from 'react-toastify';

const WarehouseContainerSaveModal = ({ setIsContainerSaveModalOpen, warehouseZoneId, onClose }) => {
    const [serialNumber, setSerialNumber] = useState("");
    const [length, setLength] = useState("");
    const [height, setHeight] = useState("");
    const [width, setWidth] = useState("");
    const authToken = useSelector((state) => state.token.token);
    const modalRef = useRef(null);

    // Закрытие модального окна при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsContainerSaveModalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setIsContainerSaveModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Логирование входных данных для отладки
        console.log("Input values:", { serialNumber, length, height, width, warehouseZoneId, authToken });

        // Проверка на заполненность и корректность данных
        if (!serialNumber || !length || !height || !width) {
            toast.error("Заполните все поля");
            return;
        }

        const parsedLength = parseFloat(length);
        const parsedHeight = parseFloat(height);
        const parsedWidth = parseFloat(width);

        if (isNaN(parsedLength) || isNaN(parsedHeight) || isNaN(parsedWidth) || parsedLength <= 0 || parsedHeight <= 0 || parsedWidth <= 0) {
            toast.error("Размеры должны быть положительными числами");
            return;
        }

        // Рассчитываем capacity как произведение размеров
        const capacity = parsedLength * parsedHeight * parsedWidth;

        try {
            const payload = {
                warehouseZoneId,
                serialNumber,
                capacity,
                length: parsedLength,
                height: parsedHeight,
                width: parsedWidth,
            };

            console.log("Отправляемый payload:", payload); // Логируем данные перед отправкой

            const response = await axios.post(
                "http://localhost:8081/api/v1/warehouse-manager/warehouse/container",
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            console.log("Response from server:", response.data); // Логируем ответ сервера
            toast.success(response?.data?.message || "Контейнер успешно создан");
            setIsContainerSaveModalOpen(false);
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error("Ошибка при создании контейнера:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            toast.error(error.response?.data?.message || "Ошибка при создании контейнера");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div ref={modalRef} className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-semibold text-main-dull-gray text-center mb-6">Создание контейнера</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-main-dull-blue font-medium mb-2">Серийный номер</label>
                        <input
                            type="text"
                            className="w-full border border-main-dull-blue rounded-lg px-4 py-2 focus:border-main-blue focus:ring-2 focus:ring-main-blue transition-colors duration-200"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-main-dull-blue font-medium mb-2">Длина (м)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full border border-main-dull-blue rounded-lg px-4 py-2 focus:border-main-blue focus:ring-2 focus:ring-main-blue transition-colors duration-200"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-main-dull-blue font-medium mb-2">Высота (м)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full border border-main-dull-blue rounded-lg px-4 py-2 focus:border-main-blue focus:ring-2 focus:ring-main-blue transition-colors duration-200"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-main-dull-blue font-medium mb-2">Ширина (м)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full border border-main-dull-blue rounded-lg px-4 py-2 focus:border-main-blue focus:ring-2 focus:ring-main-blue transition-colors duration-200"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsContainerSaveModalOpen(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                        >
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseContainerSaveModal;