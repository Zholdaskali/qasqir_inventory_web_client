import React, { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { API_CREATE_NOMENCLATURE } from "../../../api/API";

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
        height: 0,
        length: 0,
        width: 0,
        volume: 0,
        isLargeItem: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = useCallback(
        async (e) => {
            e.preventDefault();
            if (!categoryId) {
                toast.error("Ошибка: Категория с ID не найдена!");
                return;
            }
            if (!formData.name.trim()) {
                toast.error("Ошибка: Поле 'Имя' обязательно!");
                return;
            }

            const data = {
                ...formData,
                tnved_code: formData.tnvedCode,
                measurement_unit: formData.measurement,
                created_by: userId,
                updated_by: userId,
                height: formData.isLargeItem ? parseFloat(formData.height) || null : null,
                length: formData.isLargeItem ? parseFloat(formData.length) || null : null,
                width: formData.isLargeItem ? parseFloat(formData.width) || null : null,
                volume: !formData.isLargeItem ? parseFloat(formData.volume) || null : null,
            };

            try {
                const url = API_CREATE_NOMENCLATURE.replace("{categoryId}", categoryId);
                await axios.post(
                    url,
                    data,
                    { headers: { "Auth-token": authToken } }
                );
                toast.success("Номенклатура создана");
                onClose();
            } catch (error) {
                toast.error(error.response?.data?.message || "Ошибка при сохранении");
            }
        },
        [formData, categoryId, userId, authToken, onClose]
    );

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow p-5 w-full max-w-md">
                <h2 className="text-xl font-semibold text-main-dull-gray mb-4 text-center">
                    Новая номенклатура
                </h2>
                <form onSubmit={handleSave} className="space-y-3">
                    <div>
                        <label className="block text-sm text-main-dull-blue">Имя *</label>
                        <input
                            className="w-full border rounded px-2 py-1 text-sm"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue">Артикль</label>
                        <textarea
                            className="w-full border rounded px-2 py-1 text-sm"
                            name="article"
                            value={formData.article}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue">Код</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue">Тип</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue">TNVED</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                name="tnvedCode"
                                value={formData.tnvedCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue">Ед. изм.</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                name="measurement"
                                value={formData.measurement}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue">Тип товара</label>
                        <div className="flex gap-4 text-sm">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="isLargeItem"
                                    checked={!formData.isLargeItem}
                                    onChange={() => setFormData({ ...formData, isLargeItem: false })}
                                />
                                <span className="ml-1">Маленький (объем)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="isLargeItem"
                                    checked={formData.isLargeItem}
                                    onChange={() => setFormData({ ...formData, isLargeItem: true })}
                                />
                                <span className="ml-1">Большой (габариты)</span>
                            </label>
                        </div>
                    </div>
                    {formData.isLargeItem ? (
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm text-main-dull-blue">Высота (м)</label>
                                <input
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    name="height"
                                    type="number"
                                    value={formData.height}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-main-dull-blue">Длина (м)</label>
                                <input
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    name="length"
                                    type="number"
                                    value={formData.length}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-main-dull-blue">Ширина (м)</label>
                                <input
                                    className="w-full border rounded px-2 py-1 text-sm"
                                    name="width"
                                    type="number"
                                    value={formData.width}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm text-main-dull-blue">Объем (м³)</label>
                            <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                name="volume"
                                type="number"
                                value={formData.volume}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                            />
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
                        <button
                            type="submit"
                            className="px-3 py-1 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark text-sm"
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