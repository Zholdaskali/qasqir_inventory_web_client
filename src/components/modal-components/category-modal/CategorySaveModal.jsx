import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { API_CREATE_CATEGORY } from "../../../api/API";

const CategorySaveModal = ({ onClose, parentId }) => {
    const [categoryName, setCategoryName] = useState("");
    const [isFormError, setIsFormError] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const saveCategory = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            setIsFormError(true);
            toast.error("Заполните все поля");
            return;
        }

        try {
            const response = await axios.post(
                `${API_CREATE_CATEGORY}?userId=${userId}`,
                { name: categoryName, parentId: parentId },
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response.data.message || "Категория успешно добавлена");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании категории");
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Добавить категорию</h2>
                <form onSubmit={saveCategory} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-main-dull-blue">Название категории</label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${isFormError && !categoryName.trim() ? 'border-red-500' : 'border-main-dull-blue'}`}
                            value={categoryName}
                            onChange={(e) => {
                                setCategoryName(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите название категории"
                        />
                        {isFormError && !categoryName.trim() && <p className="text-red-500 text-sm">Это поле обязательно</p>}
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
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategorySaveModal;
