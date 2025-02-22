import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const NomenclatureSettingsModal = ({ nomenclature, onClose }) => {
    const authToken = useSelector((state) => state.token.token);

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
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/categories", {
                    headers: { "Auth-token": authToken },
                });
                setCategories(response.data);
            } catch (error) {
                toast.error("Ошибка загрузки категорий");
            }
        };
        fetchCategories();
    }, [authToken]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/${nomenclature.id}/nomenclatures`,
                { 
                    name, 
                    article, 
                    code, 
                    type, 
                    tnved_code, 
                    measurement_unit, 
                    categoryId,
                    height,
                    length,
                    width
                },
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Номенклатура успешно сохранена");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при сохранении");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Вы уверены, что хотите удалить эту номенклатуру?");
        if (!confirmDelete) return;

        try {
            await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/${nomenclature.id}/nomenclatures`,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Номенклатура успешно удалена");
            onClose(); // Закрыть модальное окно после удаления
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при удалении номенклатуры");
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">
                    {nomenclature ? "Редактирование номенклатуры" : "Создание номенклатуры"}
                </h2>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Имя</label>
                        <input className="w-full border rounded-lg px-4 py-2 border-main-dull-blue" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Артикль</label>
                        <input className="w-full border rounded-lg px-4 py-2 border-main-dull-blue" value={article} onChange={(e) => setArticle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Код</label>
                        <input className="w-full border rounded-lg px-4 py-2 border-main-dull-blue" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Тип</label>
                        <input className="w-full border rounded-lg px-4 py-2 border-main-dull-blue" value={type} onChange={(e) => setType(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">TNVED Code</label>
                        <input className="w-full border rounded-lg px-4 py-2 border-main-dull-blue" value={tnved_code} onChange={(e) => setTnvedCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Единица измерения</label>
                        <input className="w-full border rounded-lg px-4 py-2 border-main-dull-blue" value={measurement_unit} onChange={(e) => setMeasurementUnit(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Категория</label>
                        <select
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Выберите категорию</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Высота (м)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue"
                            value={height}
                            onChange={(e) => setHeight(parseFloat(e.target.value))}
                            placeholder="Введите высоту"
                            min="0"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Длина (м)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue"
                            value={length}
                            onChange={(e) => setLength(parseFloat(e.target.value))}
                            placeholder="Введите длину"
                            min="0"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Ширина (м)</label>
                        <input
                            type="number"
                            className="w-full border rounded-lg px-4 py-2 border-main-dull-blue"
                            value={width}
                            onChange={(e) => setWidth(parseFloat(e.target.value))}
                            placeholder="Введите ширину"
                            min="0"
                            step="0.1"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Удалить
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark transition"
                            disabled={loading}
                        >
                            {loading ? "Сохранение..." : nomenclature ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NomenclatureSettingsModal;