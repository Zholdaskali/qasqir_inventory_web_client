import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_UPDATE_WAREHOUSE_ZONE } from "../../../api/API";

const ZoneSettingModal = ({ setIsSettingModalOpen, zone, onClose, warehouseId, onSave }) => {
    const isExisting = !!zone?.id; // Проверяем, редактируем ли существующую зону
    const [name, setName] = useState(zone?.name || "");
    const [width, setWidth] = useState(zone?.width || 1); // Минимальное значение 1 для новых зон
    const [height, setHeight] = useState(zone?.height || 1);
    const [length, setLength] = useState(zone?.length || 1);
    const [canStoreItems, setCanStoreItems] = useState(zone?.canStoreItems ?? true);
    const [id] = useState(zone?.id || "");
    const [parentId] = useState(zone?.parentId || null);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    // Валидация полей
    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case "name":
                return value.trim() ? "" : "Название обязательно";
            case "width":
            case "height":
            case "length":
                const numValue = parseFloat(value);
                return numValue >= 1 ? "" : "Размер должен быть не менее 1 м";
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

    const handleSave = async () => {
        const errors = {
            name: validateField("name", name),
        };
        if (!isExisting) {
            // Валидация размеров только для новых зон
            errors.width = validateField("width", width);
            errors.height = validateField("height", height);
            errors.length = validateField("length", length);
        }

        setFormErrors(errors);
        if (Object.values(errors).some((error) => error)) {
            toast.error("Проверьте правильность заполнения полей");
            return;
        }

        setLoading(true);
        const updatedZone = {
            id,
            name,
            canStoreItems,
            parentId,
        };

        // Добавляем размеры только для новых зон
        if (!isExisting) {
            updatedZone.width = parseFloat(width);
            updatedZone.height = parseFloat(height);
            updatedZone.length = parseFloat(length);
        }

        try {
            const api = API_UPDATE_WAREHOUSE_ZONE.replace("{warehouseId}", warehouseId);
            const response = await axios.put(
                `${api}?userId=${userId}`,
                updatedZone,
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response.data.body || response.data.message || "Зона успешно обновлена");
            if (onSave) {
                onSave(updatedZone);
            }
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при сохранении");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">
                    {isExisting ? "Настройки зоны" : "Создание зоны"}
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Название</label>
                        <input
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-dull-blue transition ${formErrors.name ? "border-red-500" : "border-main-dull-blue"}`}
                            value={name}
                            onChange={handleInputChange(setName, "name")}
                            placeholder="Введите название зоны"
                            disabled={loading}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Ширина (м)</label>
                        <input
                            type="number"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-dull-blue transition ${formErrors.width ? "border-red-500" : "border-main-dull-blue"}`}
                            value={width}
                            onChange={handleInputChange(setWidth, "width")}
                            placeholder="Ширина зоны"
                            min="1"
                            step="0.1"
                            readOnly={isExisting}
                            disabled={loading || isExisting}
                        />
                        {formErrors.width && <p className="text-red-500 text-sm mt-1">{formErrors.width}</p>}
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Высота (м)</label>
                        <input
                            type="number"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-dull-blue transition ${formErrors.height ? "border-red-500" : "border-main-dull-blue"}`}
                            value={height}
                            onChange={handleInputChange(setHeight, "height")}
                            placeholder="Высота зоны"
                            min="1"
                            step="0.1"
                            readOnly={isExisting}
                            disabled={loading || isExisting}
                        />
                        {formErrors.height && <p className="text-red-500 text-sm mt-1">{formErrors.height}</p>}
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Длина (м)</label>
                        <input
                            type="number"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-dull-blue transition ${formErrors.length ? "border-red-500" : "border-main-dull-blue"}`}
                            value={length}
                            onChange={handleInputChange(setLength, "length")}
                            placeholder="Длина зоны"
                            min="1"
                            step="0.1"
                            readOnly={isExisting}
                            disabled={loading || isExisting}
                        />
                        {formErrors.length && <p className="text-red-500 text-sm mt-1">{formErrors.length}</p>}
                        {isExisting && (
                            <p className="text-xs text-gray-500 mt-1">
                                Размеры нельзя изменить для существующей зоны
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Может хранить предметы</label>
                        <select
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue focus:ring-2 focus:ring-main-dull-blue transition"
                            value={canStoreItems ? "true" : "false"}
                            onChange={(e) => setCanStoreItems(e.target.value === "true")}
                            disabled={loading}
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
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition disabled:opacity-50"
                        disabled={loading}
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
                            className="px-4 py-2 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark transition disabled:opacity-50"
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