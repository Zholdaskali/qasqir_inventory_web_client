import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_CREATE_WAREHOUSE } from "../../api/API"; // Подставьте ваш API

const WarehouseSaveModal = ({ authToken, setIsWarehouseSaveModalOpen, onClose}) => {
    const [warehouseName, setWarehouseName] = useState("");
    const [warehouseLocation, setWarehouseLocation] = useState("");
    const [isFormError, setIsFormError] = useState(false);

    const saveWarehouse = async (e) => {
        e.preventDefault();
        if (!warehouseName.trim() || !warehouseLocation.trim()) {
            setIsFormError(true);
            toast.error("Заполните все поля");
            return;
        }
        try {
            const response = await axios.post(
                API_CREATE_WAREHOUSE,
                { name: warehouseName, location: warehouseLocation },
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
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-main-dull-blue">Название склада</label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${isFormError && !warehouseName.trim() ? 'border-red-500' : 'border-main-dull-blue'}`}
                            value={warehouseName}
                            onChange={(e) => {
                                setWarehouseName(e.target.value);
                                setIsFormError(false); // Сброс ошибки, когда пользователь начинает вводить
                            }}
                            placeholder="Введите название склада"
                        />
                        {isFormError && !warehouseName.trim() && <p className="text-red-500 text-sm">Это поле обязательно</p>}
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-left mb-2 text-main-dull-blue">Локация</label>
                        <input
                            id="location"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${isFormError && !warehouseLocation.trim() ? 'border-red-500' : 'border-main-dull-blue'}`}
                            value={warehouseLocation}
                            onChange={(e) => {
                                setWarehouseLocation(e.target.value);
                                setIsFormError(false); // Сброс ошибки, когда пользователь начинает вводить
                            }}
                            placeholder="Введите локацию склада"
                        />
                        {isFormError && !warehouseLocation.trim() && <p className="text-red-500 text-sm">Это поле обязательно</p>}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsWarehouseSaveModalOpen(false)}
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
