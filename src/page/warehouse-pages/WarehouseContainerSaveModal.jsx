import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from "react-redux";


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

        if (!serialNumber || !length || !height || !width) {
            toast.error("Заполните все поля");
            return;
        }

        try {
            const payload = {
                warehouseZoneId,
                serialNumber,
                length: parseFloat(length),
                height: parseFloat(height),
                width: parseFloat(width),
            };

            const response = await axios.post(
                "http://localhost:8081/api/v1/warehouse-manager/warehouse/container",
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            toast.success(response?.data?.message || "Контейнер успешно создан");
            if (onClose) {
                onClose(true);
            }
        } catch (error) {
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