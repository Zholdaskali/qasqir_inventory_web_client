import React, { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const NomenclatureSaveModal = ({ onClose, categoryId }) => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [formData, setFormData] = useState({
        name: "",
        article: "",
        code: "",
        type: "",
        tnvedCode: "",
        measurement: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = useCallback(
        async (e) => {
            e.preventDefault();

            if (!categoryId) {
                toast.error("Ошибка: Категория с ID не найдена!");
                return;
            }

            if (!formData.name.trim()) {
                toast.error("Ошибка: Поле 'Имя' обязательно для заполнения!");
                return;
            }

            const data = {
                ...formData,
                tnved_code: formData.tnvedCode,
                measurement_unit: formData.measurement,
                created_by: userId,
            };

            try {
                await axios.post(
                    `http://localhost:8081/api/v1/warehouse-manager/${categoryId}/nomenclatures`,
                    data,
                    { headers: { "Auth-token": authToken } }
                );
                toast.success("Номенклатура успешно создана");
                onClose();
            } catch (error) {
                toast.error(error.response?.data?.message || "Ошибка при сохранении");
            }
        },
        [formData, categoryId, userId, authToken, onClose]
    );

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">
                    Создание номенклатуры
                </h2>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Имя *</label>
                        <input
                            className="w-full border rounded-lg px-4 py-2"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Введите имя"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Артикль</label>
                        <textarea
                            className="w-full border rounded-lg px-4 py-2"
                            name="article"
                            value={formData.article}
                            onChange={handleChange}
                            placeholder="Введите артикль"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Код</label>
                        <input
                            className="w-full border rounded-lg px-4 py-2"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Введите код"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Тип</label>
                        <input
                            className="w-full border rounded-lg px-4 py-2"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            placeholder="Введите тип"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">TNVED Code</label>
                        <input
                            className="w-full border rounded-lg px-4 py-2"
                            name="tnvedCode"
                            value={formData.tnvedCode}
                            onChange={handleChange}
                            placeholder="Введите код TNVED"
                        />
                    </div>
                    <div>
                        <label className="block text-left mb-2 text-main-dull-blue">Единица измерения</label>
                        <input
                            className="w-full border rounded-lg px-4 py-2"
                            name="measurement"
                            value={formData.measurement}
                            onChange={handleChange}
                            placeholder="Введите единицу измерения"
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
                            type="submit"
                            className="px-4 py-2 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark transition"
                        >
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NomenclatureSaveModal;
    