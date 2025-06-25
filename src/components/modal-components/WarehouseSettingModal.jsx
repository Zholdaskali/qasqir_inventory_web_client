import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import ConfirmationWrapper from "../ui/ConfirmationWrapper";
import { API_UPDATE_WAREHOUSE } from "../../api/API";

const WarehouseSettingsModal = ({ warehouse, onClose, onUpdate }) => {
    const [name, setName] = useState(warehouse?.name || "");
    const [location, setLocation] = useState(warehouse?.location || "");
    const [loading, setLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();

    const handleSave = async () => {
        setLoading(true);
        try {
            const deleteUrl = API_UPDATE_WAREHOUSE.replace("{warehouseId}", warehouse.id)
            const response = await axios.put(
                deleteUrl, // Замена на константу
                { name, location },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            console.log("Данные склада обновлены:", response.data);
            const updatedWarehouse = { ...warehouse, name, location };
            onUpdate(updatedWarehouse);
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Настройки склада</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Название</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:outline-none focus:ring-2 focus:ring-main-purp-dark"
                            placeholder="Введите название склада"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Локация</label>
                        <input 
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:outline-none focus:ring-2 focus:ring-main-purp-dark"
                            placeholder="Введите локацию склада"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    >
                        Отмена
                    </button>
                    <ConfirmationWrapper
                        title="Подтверждение сохранения"
                        message="Вы уверены, что хотите сохранить изменения для этого склада?"
                        onConfirm={handleSave}
                    >
                        <button
                            type="button" // Предотвращение отправки формы
                            className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition flex items-center"
                            disabled={loading}
                        >
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                    </ConfirmationWrapper>
                </div>
            </div>
        </div>
    );
};

export default WarehouseSettingsModal;