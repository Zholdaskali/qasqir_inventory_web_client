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
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Загружаем список категорий при загрузке компонента
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
                { name, article, code, type, tnved_code, measurement_unit, categoryId },
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
        if (!window.confirm("Вы уверены, что хотите удалить номенклатуру?")) return;
        setLoading(true);
        try {
            await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/${nomenclature.id}/nomenclatures`,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Номенклатура удалена");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при удалении");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 transition-transform transform scale-95 animate-fadeIn">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                    {nomenclature ? "Редактирование номенклатуры" : "Создание номенклатуры"}
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block mb-1">Имя</label>
                        <input className="w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block mb-1">Артикль</label>
                        <input className="w-full border px-3 py-2 rounded" value={article} onChange={(e) => setArticle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Код</label>
                        <input className="w-full border px-3 py-2 rounded" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Тип</label>
                        <input className="w-full border px-3 py-2 rounded" value={type} onChange={(e) => setType(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">tnved code</label>
                        <input className="w-full border px-3 py-2 rounded" value={tnved_code} onChange={(e) => setTnvedCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Единица измерения</label>
                        <input className="w-full border px-3 py-2 rounded" value={measurement_unit} onChange={(e) => setMeasurementUnit(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Категория</label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Выберите категорию</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                            Отмена
                        </button>
                        {nomenclature && (
                            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Удалить
                            </button>
                        )}
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
                            {loading ? "Сохранение..." : nomenclature ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NomenclatureSettingsModal;
