import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_SAVE_WAREHOUSE_CONTAINER, API_DELETE_WAREHOUSE_CONTAINER } from "../../../api/API";

const WarehouseContainerSettingModal = ({ setIsContainerSettingModalOpen, container, onClose }) => {
    const isExisting = !!container?.id; // Проверяем, редактируем ли существующий контейнер
    const [serialNumber, setSerialNumber] = useState(container?.serialNumber || "");
    const [length, setLength] = useState(container?.length || 0.1); // Минимальное значение для новых контейнеров
    const [height, setHeight] = useState(container?.height || 0.1);
    const [width, setWidth] = useState(container?.width || 0.1);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);

    // Валидация полей
    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case "serialNumber":
                return value.trim() ? "" : "Серийный номер обязателен";
            case "length":
            case "height":
            case "width":
                const numValue = parseFloat(value);
                return numValue >= 0.1 ? "" : "Размер должен быть не менее 0.1 м";
            default:
                return "";
        }
    };

    const handleInputChange = (setter, fieldName) => (e) => {
        const value = e.target.value;
        setter(value);
        setFormErrors((prev) => ({
            ...prev,
            [fieldName]: validateField(fieldName, value),
        }));
    };

    const handleSubmit = async () => {
        const errors = {
            serialNumber: validateField("serialNumber", serialNumber),
        };
        if (!isExisting) {
            // Валидация размеров только для новых контейнеров
            errors.length = validateField("length", length);
            errors.height = validateField("height", height);
            errors.width = validateField("width", width);
        }

        setFormErrors(errors);
        if (Object.values(errors).some((error) => error)) {
            toast.error("Проверьте правильность заполнения полей");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                serialNumber,
            };

            // Добавляем размеры только для новых контейнеров
            if (!isExisting) {
                payload.length = parseFloat(length);
                payload.height = parseFloat(height);
                payload.width = parseFloat(width);
            }

            const response = await axios.put(
                `${API_SAVE_WAREHOUSE_CONTAINER}/${container.id}`,
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            toast.success(response?.data?.message || "Контейнер успешно обновлен");
            if (onClose) {
                onClose(true); // Закрываем и сигнализируем об успешном обновлении
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении контейнера");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const deleteUrl = API_DELETE_WAREHOUSE_CONTAINER.replace("{warehouseContainerId}", container.id);
            const response = await axios.delete(deleteUrl, {
                headers: { "Auth-token": authToken },
            });

            toast.success(response?.data?.message || "Контейнер успешно удален");
            if (onClose) {
                onClose(true); // Закрываем и сигнализируем об успешном удалении
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при удалении контейнера");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsContainerSettingModalOpen(false);
        if (onClose) onClose(false); // Закрываем без обновления
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                    {isExisting ? "Настройка контейнера" : "Создание контейнера"}
                </h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Серийный номер</label>
                        <input
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${formErrors.serialNumber ? "border-red-500" : "border-gray-300"}`}
                            value={serialNumber}
                            onChange={handleInputChange(setSerialNumber, "serialNumber")}
                            placeholder="Введите серийный номер"
                            disabled={loading}
                            required
                        />
                        {formErrors.serialNumber && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.serialNumber}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Длина (м)</label>
                        <input
                            type="number"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${formErrors.length ? "border-red-500" : "border-gray-300"}`}
                            value={length}
                            onChange={handleInputChange(setLength, "length")}
                            placeholder="Введите длину"
                            min="0.1"
                            step="0.1"
                            readOnly={isExisting}
                            disabled={loading || isExisting}
                            required={!isExisting}
                        />
                        {formErrors.length && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.length}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Высота (м)</label>
                        <input
                            type="number"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${formErrors.height ? "border-red-500" : "border-gray-300"}`}
                            value={height}
                            onChange={handleInputChange(setHeight, "height")}
                            placeholder="Введите высоту"
                            min="0.1"
                            step="0.1"
                            readOnly={isExisting}
                            disabled={loading || isExisting}
                            required={!isExisting}
                        />
                        {formErrors.height && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.height}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ширина (м)</label>
                        <input
                            type="number"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${formErrors.width ? "border-red-500" : "border-gray-300"}`}
                            value={width}
                            onChange={handleInputChange(setWidth, "width")}
                            placeholder="Введите ширину"
                            min="0.1"
                            step="0.1"
                            readOnly={isExisting}
                            disabled={loading || isExisting}
                            required={!isExisting}
                        />
                        {formErrors.width && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.width}</p>
                        )}
                        {isExisting && (
                            <p className="text-xs text-gray-500 mt-1">
                                Размеры нельзя изменить для существующего контейнера
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        {isExisting && (
                            <ConfirmationWrapper
                                title="Подтверждение удаления"
                                message="Вы уверены, что хотите удалить этот контейнер?"
                                onConfirm={handleDelete}
                            >
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? "Удаление..." : "Удалить"}
                                </button>
                            </ConfirmationWrapper>
                        )}
                        <ConfirmationWrapper
                            title="Подтверждение сохранения"
                            message="Вы уверены, что хотите сохранить изменения для этого контейнера?"
                            onConfirm={handleSubmit}
                        >
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Сохранение..." : "Сохранить"}
                            </button>
                        </ConfirmationWrapper>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WarehouseContainerSettingModal;