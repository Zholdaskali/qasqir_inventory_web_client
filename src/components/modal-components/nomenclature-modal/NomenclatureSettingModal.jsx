import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_GET_CATEGORIES, API_UPDATE_NOMENCLATURE, API_DELETE_NOMENCLATURE } from "../../../api/API";

const NomenclatureSettingsModal = ({ nomenclature, onClose }) => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [name, setName] = useState(nomenclature?.name || "");
    const [article, setArticle] = useState(nomenclature?.article || "");
    const [code, setCode] = useState(nomenclature?.code || "");
    const [type, setType] = useState(nomenclature?.type || "");
    const [tnved_code, setTnvedCode] = useState(nomenclature?.tnved_code || "");
    const [measurement_unit, setMeasurementUnit] = useState(nomenclature?.measurement_unit || "");
    const [categoryId, setCategoryId] = useState(nomenclature?.categoryId || "");
    const [height, setHeight] = useState(nomenclature?.height || 0);
    const [length, setLength] = useState(nomenclature?.length || 0);
    const [width, setWidth] = useState(nomenclature?.width || 0);
    const [volume, setVolume] = useState(nomenclature?.volume || 0);
    const [sizeType, setSizeType] = useState(nomenclature?.volume ? "volume" : "dimensions"); // Новый переключатель
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_GET_CATEGORIES, {
                    headers: { "Auth-token": authToken },
                });
                console.log("API response.data:", response.data);
                setCategories(Array.isArray(response.data.body) ? response.data.body : []);
            } catch (error) {
                console.error("Ошибка при загрузке категорий:", error);
                setCategories([]);
                toast.error("Ошибка загрузки категорий");
            }
        };
        fetchCategories();
    }, [authToken]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const url = API_UPDATE_NOMENCLATURE.replace("{nomenclatureId}", nomenclature.id);
            const updated_by = userId;
            // Формируем объект данных в зависимости от sizeType
            const data = {
                name,
                article,
                code,
                type,
                updated_by,
                tnved_code,
                measurement_unit,
                categoryId,
            };
            if (sizeType === "volume") {
                data.volume = volume;
            } else {
                data.width = width;
                data.height = height;
                data.length = length;
            }

            await axios.put(url, data, { headers: { "Auth-token": authToken } });
            toast.success("Номенклатура сохранена");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при сохранении");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `${API_DELETE_NOMENCLATURE}/${nomenclature.id}/nomenclatures`,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Номенклатура удалена");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при удалении");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow p-5 w-full max-w-md">
                <h2 className="text-xl font-semibold text-main-dull-gray mb-4 text-center">
                    {nomenclature ? "Редактирование" : "Создание"}
                </h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                    <div>
                        <label className="block text-sm text-main-dull-blue">Имя</label>
                        <input
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue">Артикль</label>
                        <input
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={article}
                            onChange={(e) => setArticle(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue">Код</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue">Тип</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue">TNVED</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={tnved_code}
                                onChange={(e) => setTnvedCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue">Ед. изм.</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={measurement_unit}
                                onChange={(e) => setMeasurementUnit(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue">Категория</label>
                        <select
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Выберите</option>
                            {Array.isArray(categories) && categories.length > 0 ? (
                                categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Категории не загружены</option>
                            )}
                        </select>
                    </div>
                    {/* Переключатель для выбора типа размера */}
                    <div>
                        <label className="block text-sm text-main-dull-blue">Тип размера</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="volume"
                                    checked={sizeType === "volume"}
                                    onChange={() => setSizeType("volume")}
                                />
                                Объем
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="dimensions"
                                    checked={sizeType === "dimensions"}
                                    onChange={() => setSizeType("dimensions")}
                                />
                                Размеры
                            </label>
                        </div>
                    </div>
                    {/* Условное отображение полей */}
                    {sizeType === "volume" ? (
                        <div>
                            <label className="block text-sm text-main-dull-blue">Объем (м³)</label>
                            <input
                                type="number"
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                min="0"
                                step="0.1"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm text-main-dull-blue">Высота (м)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    value={height}
                                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-main-dull-blue">Длина (м)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    value={length}
                                    onChange={(e) => setLength(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-main-dull-blue">Ширина (м)</label>
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    value={width}
                                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                        >
                            Отмена
                        </button>
                        <ConfirmationWrapper
                            title="Подтверждение удаления"
                            message="Вы уверены, что хотите удалить эту номенклатуру?"
                            onConfirm={handleDelete}
                        >
                            <button
                                type="button"
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                                Удалить
                            </button>
                        </ConfirmationWrapper>
                        <ConfirmationWrapper
                            title="Подтверждение сохранения"
                            message="Вы уверены, что хотите сохранить изменения для этой номенклатуры?"
                            onConfirm={handleSave}
                        >
                            <button
                                type="button"
                                className="px-3 py-1 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark text-sm"
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

export default NomenclatureSettingsModal;