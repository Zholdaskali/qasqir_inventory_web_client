import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_CREATE_WAREHOUSE } from "../../api/API"; // Подставьте ваш API

const WarehouseSaveModal = ({ authToken, setIsWarehouseSaveModalOpen }) => {
    const [warehouseName, setWarehouseName] = useState("");
    const [warehouseLocation, setWarehouseLocation] = useState("");


    
    const saveWarehouse = async (e) => {
        e.preventDefault();

        if (!warehouseName.trim() || !warehouseLocation.trim()) {
            toast.error("Заполните все поля");
            return;
        }

        try {
            const response = await axios.post(
                API_CREATE_WAREHOUSE,
                {
                    name: warehouseName,
                    location: warehouseLocation,
                },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message || "Склад успешно добавлен");
            setIsWarehouseSaveModalOpen(false); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка создания склада");
        }

    };

    return (
        <div className="flex absolute top-0 left-0 z-30 items-center justify-center w-full h-screen bg-gray-800 bg-opacity-50">
            <div className="bg-white rounded-xl z-20 py-16 px-12 shadow-md w-1/2">
                <form
                    onSubmit={saveWarehouse}
                    className="flex flex-col items-center gap-y-10 p-5 text-center"
                >
                    <h1 className="text-2xl self-start text-main-dull-gray">
                        Добавить склад
                    </h1>
                    <div className="w-full flex flex-row gap-x-5">
                        <div className="flex flex-col items-start w-1/2 gap-y-3">
                            <label htmlFor="warehouseName" className="ml-5">
                                Название склада
                            </label>
                            <input
                                type="text"
                                id="warehouseName"
                                className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                                placeholder="Введите название склада"
                                required
                                value={warehouseName}
                                onChange={(e) => setWarehouseName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col items-start w-1/2 gap-y-3">
                            <label htmlFor="location" className="ml-5">
                                Локация
                            </label>
                            <input
                                type="text"
                                id="location"
                                className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                                placeholder="Введите локацию склада"
                                required
                                value={warehouseLocation}
                                onChange={(e) => setWarehouseLocation(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-5">
                        <button
                            type="submit"
                            className="bg-main-dull-blue text-white px-5 py-3 rounded-xl"
                        >
                            Сохранить
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsWarehouseSaveModalOpen(false)} // Закрытие модалки при нажатии на "Отмена"
                            className="bg-gray-500 text-white px-5 py-3 rounded-xl"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
            <div
                className="w-full h-screen absolute z-10 backdrop-blur-md"
                onClick={() => setIsWarehouseSaveModalOpen(false)} // Закрытие модалки по клику вне окна
            ></div>
        </div>
    );
};

export default WarehouseSaveModal;
