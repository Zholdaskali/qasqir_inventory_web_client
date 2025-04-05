// ZoneSettingModal.jsx
import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_UPDATE_WAREHOUSE_ZONE } from "../../../api/API";

const ZoneSettingModal = ({ setIsSettingModalOpen, zone, onClose, warehouseId, onSave }) => {
    const [name, setName] = useState(zone?.name || "");
    const [width, setWidth] = useState(zone?.width || 10);
    const [height, setHeight] = useState(zone?.height || 5);
    const [length, setLength] = useState(zone?.length || 10);
    const [canStoreItems, setCanStoreItems] = useState(zone?.canStoreItems ?? true);
    const [id] = useState(zone?.id || "");
    const [parentId] = useState(zone?.parentId || null);
    const [loading, setLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const handleSave = async () => {
        setLoading(true);
        const updatedZone = {
            id,
            name,
            width: Number(width),
            height: Number(height),
            length: Number(length),
            canStoreItems,
            parentId,
        };

        try {
            const response = await axios.put(
                `${API_UPDATE_WAREHOUSE_ZONE}/${warehouseId}/zones?userId=${userId}`,
                updatedZone,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Зона успешно отредактирована");
            onSave(updatedZone); // Передаем обновленные данные в родительский компонент
            setIsSettingModalOpen(false);
        } catch (error) {
            toast.error("Ошибка при сохранении");
            console.error("Ошибка при сохранении:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Настройки зоны</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Название</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:ring-2 focus:ring-main-dull-blue"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название зоны"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Ширина</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:ring-2 focus:ring-main-dull-blue"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            placeholder="Ширина зоны"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Высота</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:ring-2 focus:ring-main-dull-blue"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="Высота зоны"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Длина</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:ring-2 focus:ring-main-dull-blue"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            placeholder="Длина зоны"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Может хранить предметы</label>
                        <select
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:ring-2 focus:ring-main-dull-blue"
                            value={canStoreItems ? "true" : "false"}
                            onChange={(e) => setCanStoreItems(e.target.value === "true")}
                        >
                            <option value="true">Да</option>
                            <option value="false">Нет</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                        Отмена
                    </button>
                    <ConfirmationWrapper
                        title="Подтверждение редактирования"
                        message="Вы уверены, что хотите сохранить изменения для этой зоны?"
                        onConfirm={handleSave}
                    >
                        <button
                            type="button"
                            className="px-4 py-2 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark transition"
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

export default ZoneSettingModal;