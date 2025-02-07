import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";



const WarehouseSettingsModal = ({ warehouse, onClose, onUpdate }) => {
    const [name, setName] = useState(warehouse?.name || "");
    const [location, setLocation] = useState(warehouse?.location || "");
    const [loading, setLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();

    const handleSave = async () => {
        setLoading(true);
        try {
            // Отправка реального запроса на сервер
            const response = await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/warehouses/${warehouse.id}`, // Путь к вашему API
                { name, location }, // Данные, которые нужно обновить
                {
                    headers: { "Auth-token": authToken },
                }
            );

            // Если запрос прошел успешно
            console.log("Данные склада обновлены:", response.data);
            
            // Обновляем данные склада в родительском компоненте
            const updatedWarehouse = { ...warehouse, name, location };
            onUpdate(updatedWarehouse);  // Передаем обновленные данные в родительский компонент

            onClose(); // Закрываем модальное окно
        } catch (error) {
            console.error("Ошибка при сохранении:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Оверлей */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} />

            {/* Модальное окно */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                    <h2 className="text-xl font-semibold mb-4">Настройки склада</h2>

                    {/* Поля ввода */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Название</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Локация</label>
                            <input 
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Отмена</button>
                        <button 
                            onClick={handleSave} 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                            disabled={loading}
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WarehouseSettingsModal;
