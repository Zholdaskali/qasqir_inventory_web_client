import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_CREATE_WAREHOUSE } from "../../../api/API"; // Подставьте ваш API

const WarehouseSaveModal = ({ authToken, onClose }) => {
    const [warehouseName, setWarehouseName] = useState("");
    const [warehouseLocation, setWarehouseLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [isFormError, setIsFormError] = useState(false);

    // Валидация координат
    const validateCoordinates = (lat, lng) => {
        const latNumber = parseFloat(lat);
        const lngNumber = parseFloat(lng);
        return (
            !isNaN(latNumber) &&
            !isNaN(lngNumber) &&
            latNumber >= -90 &&
            latNumber <= 90 &&
            lngNumber >= -180 &&
            lngNumber <= 180
        );
    };

    const saveWarehouse = async (e) => {
        e.preventDefault();

        // Проверка заполнения всех полей
        if (!warehouseName.trim() || !warehouseLocation.trim() || !latitude.trim() || !longitude.trim()) {
            setIsFormError(true);
            toast.error("Заполните все поля");
            return;
        }

        // Проверка корректности координат
        if (!validateCoordinates(latitude, longitude)) {
            setIsFormError(true);
            toast.error("Некорректные координаты. Широта должна быть от -90 до 90, долгота от -180 до 180.");
            return;
        }

        try {
            const response = await axios.post(
                API_CREATE_WAREHOUSE,
                {
                    name: warehouseName,
                    location: warehouseLocation,
                    latitude: parseFloat(latitude), // Преобразуем в число
                    longitude: parseFloat(longitude), // Преобразуем в число
                },
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response.data.message || "Склад успешно добавлен");
            onClose(); // Закрываем модалку и обновляем список складов
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка создания склада");
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Добавить склад</h2>
                <form onSubmit={saveWarehouse} className="space-y-6">
                    {/* Поле для названия склада */}
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-main-dull-blue">
                            Название склада
                        </label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${
                                isFormError && !warehouseName.trim() ? "border-red-500" : "border-main-dull-blue"
                            }`}
                            value={warehouseName}
                            onChange={(e) => {
                                setWarehouseName(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите название склада"
                        />
                        {isFormError && !warehouseName.trim() && (
                            <p className="text-red-500 text-sm">Это поле обязательно</p>
                        )}
                    </div>

                    {/* Поле для локации */}
                    <div>
                        <label htmlFor="location" className="block text-left mb-2 text-main-dull-blue">
                            Локация
                        </label>
                        <input
                            id="location"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${
                                isFormError && !warehouseLocation.trim() ? "border-red-500" : "border-main-dull-blue"
                            }`}
                            value={warehouseLocation}
                            onChange={(e) => {
                                setWarehouseLocation(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите локацию склада"
                        />
                        {isFormError && !warehouseLocation.trim() && (
                            <p className="text-red-500 text-sm">Это поле обязательно</p>
                        )}
                    </div>

                    {/* Поле для широты */}
                    <div>
                        <label htmlFor="latitude" className="block text-left mb-2 text-main-dull-blue">
                            Широта
                        </label>
                        <input
                            id="latitude"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${
                                isFormError && !latitude.trim() ? "border-red-500" : "border-main-dull-blue"
                            }`}
                            value={latitude}
                            onChange={(e) => {
                                setLatitude(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите широту (от -90 до 90)"
                        />
                        {isFormError && !latitude.trim() && (
                            <p className="text-red-500 text-sm">Это поле обязательно</p>
                        )}
                    </div>

                    {/* Поле для долготы */}
                    <div>
                        <label htmlFor="longitude" className="block text-left mb-2 text-main-dull-blue">
                            Долгота
                        </label>
                        <input
                            id="longitude"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${
                                isFormError && !longitude.trim() ? "border-red-500" : "border-main-dull-blue"
                            }`}
                            value={longitude}
                            onChange={(e) => {
                                setLongitude(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите долготу (от -180 до 180)"
                        />
                        {isFormError && !longitude.trim() && (
                            <p className="text-red-500 text-sm">Это поле обязательно</p>
                        )}
                        {/* Подсказка для пользователей */}
                        <p className="text-sm text-gray-600 mt-2">
                            Не знаете координаты? Используйте{" "}
                            <a
                                href="https://snipp.ru/tools/address-coord"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                эту ссылку
                            </a>{" "}
                            для получения широты и долготы по адресу склада.
                        </p>
                    </div>

                    {/* Кнопки */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
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

export default WarehouseSaveModal;