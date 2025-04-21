import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_GET_CATEGORIES, API_UPDATE_NOMENCLATURE, API_DELETE_NOMENCLATURE } from "../../../api/API";

const NomenclatureSettingsModal = ({ nomenclature, onClose }) => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const isExisting = !!nomenclature?.id; // Проверяем, редактируем ли существующую номенклатуру
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
    const [sizeType, setSizeType] = useState(nomenclature?.volume ? "volume" : "dimensions");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_GET_CATEGORIES, {
                    headers: { "Auth-token": authToken },
                });
                setCategories(Array.isArray(response.data.body) ? response.data.body : []);
            } catch (error) {
                setCategories([]);
                toast.error("Ошибка загрузки категорий");
            }
        };
        fetchCategories();
    }, [authToken]);

    // Валидация полей
    const validateField = (name, value) => {
        switch (name) {
            case "name":
                return value.trim() ? "" : "Имя обязательно";
            case "categoryId":
                return value ? "" : "Категория обязательна";
            case "height":
            case "length":
            case "width":
            case "volume":
                return parseFloat(value) >= 0 ? "" : "Значение должно быть неотрицательным";
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
            categoryId: validateField("categoryId", categoryId),
        };
        if (!isExisting) {
            // Валидация размеров только для новых записей
            if (sizeType === "volume") {
                errors.volume = validateField("volume", volume);
            } else {
                errors.height = validateField("height", height);
                errors.length = validateField("length", length);
                errors.width = validateField("width", width);
            }
        }

        setFormErrors(errors);
        if (Object.values(errors).some((error) => error)) {
            toast.error("Проверьте правильность заполнения полей");
            return;
        }

        setLoading(true);
        try {
            const url = API_UPDATE_NOMENCLATURE.replace("{nomenclatureId}", nomenclature.id);
            const data = {
                name,
                article,
                code,
                type,
                updated_by: userId,
                tnved_code,
                measurement_unit,
                categoryId,
            };

            // Добавляем размеры только для новых записей
            if (!isExisting) {
                if (sizeType === "volume") {
                    data.volume = parseFloat(volume);
                } else {
                    data.width = parseFloat(width);
                    data.height = parseFloat(height);
                    data.length = parseFloat(length);
                }
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
            const url = API_DELETE_NOMENCLATURE.replace("{nomenclatureId}", nomenclature.id);
            await axios.delete(
                url, 
                {
                headers: { "Auth-token": authToken },
                });
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
                    {isExisting ? "Редактирование" : "Создание"}
                </h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                    <div>
                        <label className="block text-sm text-main-dull-blue">Имя</label>
                        <input
                            className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                            value={name}
                            onChange={handleInputChange(setName, "name")}
                            required
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue">Артикул</label>
                        <input
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue"
                            value={article}
                            onChange={(e) => setArticle(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue">Код</label>
                            <input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue">Тип</label>
                            <input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue">TNVED</label>
                            <input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue"
                                value={tnved_code}
                                onChange={(e) => setTnvedCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue">Ед. изм.</label>
                            <input
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue"
                                value={measurement_unit}
                                onChange={(e) => setMeasurementUnit(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue">Категория</label>
                        <select
                            className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue ${formErrors.categoryId ? "border-red-500" : "border-gray-300"}`}
                            value={categoryId}
                            onChange={handleInputChange(setCategoryId, "categoryId")}
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
                        {formErrors.categoryId && <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>}
                    </div>
                    {/* Переключатель типа размера */}
                    <div>
                        <label className="block text-sm text-main-dull-blue">Тип размера</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="volume"
                                    checked={sizeType === "volume"}
                                    onChange={() => setSizeType("volume")}
                                    disabled={isExisting}
                                />
                                Объем
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="dimensions"
                                    checked={sizeType === "dimensions"}
                                    onChange={() => setSizeType("dimensions")}
                                    disabled={isExisting}
                                />
                                Размеры
                            </label>
                        </div>
                        {isExisting && (
                            <p className="text-xs text-gray-500 mt-1">
                                Размеры нельзя изменить для существующей номенклатуры
                            </p>
                        )}
                    </div>
                    {/* Условное отображение полей размеров */}
                    {sizeType === "volume" ? (
                        <div>
                            <label className="block text-sm text-main-dull-blue">Объем (м³)</label>
                            <input
                                type="number"
                                className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue ${formErrors.volume ? "border-red-500" : "border-gray-300"}`}
                                value={volume}
                                onChange={handleInputChange((val) => setVolume(parseFloat(val) || 0), "volume")}
                                min="0"
                                step="0.1"
                                readOnly={isExisting}
                            />
                            {formErrors.volume && <p className="text-red-500 text-xs mt-1">{formErrors.volume}</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm text-main-dull-blue">Высота (м)</label>
                                <input
                                    type="number"
                                    className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue ${formErrors.height ? "border-red-500" : "border-gray-300"}`}
                                    value={height}
                                    onChange={handleInputChange((val) => setHeight(parseFloat(val) || 0), "height")}
                                    min="0"
                                    step="0.1"
                                    readOnly={isExisting}
                                />
                                {formErrors.height && <p className="text-red-500 text-xs mt-1">{formErrors.height}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-main-dull-blue">Длина (м)</label>
                                <input
                                    type="number"
                                    className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue ${formErrors.length ? "border-red-500" : "border-gray-300"}`}
                                    value={length}
                                    onChange={handleInputChange((val) => setLength(parseFloat(val) || 0), "length")}
                                    min="0"
                                    step="0.1"
                                    readOnly={isExisting}
                                />
                                {formErrors.length && <p className="text-red-500 text-xs mt-1">{formErrors.length}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-main-dull-blue">Ширина (м)</label>
                                <input
                                    type="number"
                                    className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-main-blue ${formErrors.width ? "border-red-500" : "border-gray-300"}`}
                                    value={width}
                                    onChange={handleInputChange((val) => setWidth(parseFloat(val) || 0), "width")}
                                    min="0"
                                    step="0.1"
                                    readOnly={isExisting}
                                />
                                {formErrors.width && <p className="text-red-500 text-xs mt-1">{formErrors.width}</p>}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm disabled:opacity-50"
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        {isExisting && (
                            <ConfirmationWrapper
                                title="Подтверждение удаления"
                                message="Вы уверены, что хотите удалить эту номенклатуру?"
                                onConfirm={handleDelete}
                            >
                                <button
                                    type="button"
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Удалить
                                </button>
                            </ConfirmationWrapper>
                        )}
                        <ConfirmationWrapper
                            title="Подтверждение сохранения"
                            message="Вы уверены, что хотите сохранить изменения для этой номенклатуры?"
                            onConfirm={handleSave}
                        >
                            <button
                                type="button"
                                className="px-3 py-1 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark text-sm disabled:opacity-50"
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