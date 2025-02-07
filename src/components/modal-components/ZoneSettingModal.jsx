import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Notification from "../../components/notification/Notification";



const ZoneSettingModal = ({ setIsSettingModalOpen, zone, onClose, warehouseId }) => {
    const [name, setName] = useState(zone?.name || "");
    const [id, setId] = useState(zone?.id || "");
    const [parentId, setParentId] = useState(zone?.parentId || "");
    const [loading, setLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);


    const handleSave = async () => {
    setLoading(true);

    try {
        const response = await axios.put(
            `http://localhost:8081/api/v1/warehouse-manager/warehouses/${warehouseId}/zones?userId=${userId}`,
            {id, name, parentId},
            {
                headers: {"Auth-token": authToken}
            }            
        );
        toast.success("Зона успешно отредактирована");
        setIsSettingModalOpen(false)
    } catch (error) {
        console.error("Ошибка при сохранении:", error)
    } finally {
        setLoading(false)
    }
    };
    return (
        <>
            {/* Оверлей */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} />

            {/* Модальное окно */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                    <h2 className="text-xl font-semibold mb-4">Настройки зоны</h2>

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
                <Notification />
            </div>
        </>
    );
};
export default ZoneSettingModal;