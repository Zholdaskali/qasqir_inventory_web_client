import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const NomenclatureSettingsModal = ({ nomenclature, onClose, categoryId }) => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);


    const [name, setName] = useState("");
    const [article, setArticle] = useState("");
    const [code, setCode] = useState("");
    const [type, setType] = useState("");
    const [tnvedCode, setTnvedCode] = useState("");
    const [measurement, setMeasurement] = useState("");

    useEffect(() => {
        if (nomenclature) {
            setName(nomenclature.name);
            setArticle(nomenclature.article);
            setCode(nomenclature.code);
            setType(nomenclature.type);
            setTnvedCode(nomenclature.tnved_code);
            setMeasurement(nomenclature.measurement_unit);
        } else {
            setName("");
            setArticle("");
            setCode("");
            setType("");
            setTnvedCode("");
            setMeasurement("");
        }
    }, [nomenclature]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!categoryId) {
            toast.error("Ошибка: Категория с ID не найден!");
            return;
        }

        const data = { name, article, code, type, tnved_code: tnvedCode, measurement_unit: measurement, updated_by: userId };

        try {
            const response = await axios.post(
                `http://localhost:8081/api/v1/warehouse-manager/${categoryId}/nomenclatures`,
                data,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Номенклатура успешно создана");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при сохранении");
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
                        <input className="w-full border px-3 py-2 rounded" value={tnvedCode} onChange={(e) => setTnvedCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-1">Единица измерения</label>
                        <input className="w-full border px-3 py-2 rounded" value={measurement} onChange={(e) => setMeasurement(e.target.value)} />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {nomenclature ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NomenclatureSettingsModal;
