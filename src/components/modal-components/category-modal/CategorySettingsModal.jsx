import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_UPDATE_CATEGORY, API_DELETE_CATEGORY } from "../../../api/API";


const CategorySettingsModal = ({ category, onClose }) => {
    const [categoryName, setCategoryName] = useState(category?.name || "");
    const [isFormError, setIsFormError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.id);

    useEffect(() => {
        setCategoryName(category?.name || "");
    }, [category]);

    const handleSaveCategory = async () => { 
        if (!categoryName.trim()) {
            setIsFormError(true);
            toast.error("Заполните все поля");
            return;
        }

        setIsLoading(true);
        try {
            const url = API_UPDATE_CATEGORY.replace("{categoryId}", category.id);

            const response = await axios.put(
                url,
                { name: categoryName, updateBy: userId },
                { headers: { "Auth-token": authToken } }
            );

            toast.success(response.data.message || "Категория успешно обновлена");
            onClose();
        } catch (error) {
            console.error("Ошибка при обновлении категории:", error);
            toast.error(error.response?.data?.message || "Ошибка при обновлении категории");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        setIsLoading(true);
        try {
            const url = API_DELETE_CATEGORY.replace("{categoryId}", category.id);
            await axios.delete(
                url,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Категория успешно удалена");
            onClose();
        } catch (error) {
            console.error("Ошибка при удалении категории:", error);
            toast.error(error.response?.data?.message || "Ошибка при удалении категории");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 relative">
                <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Настройки категории</h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6"> {/* Предотвращаем отправку формы */}
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-main-dull-blue">Название категории</label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-2 ${isFormError && !categoryName.trim() ? "border-red-500" : "border-main-dull-blue"}`}
                            value={categoryName}
                            onChange={(e) => {
                                setCategoryName(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите название категории"
                        />
                        {isFormError && !categoryName.trim() && (
                            <p className="text-red-500 text-sm mt-1">Это поле обязательно</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                        >
                            Отмена
                        </button>
                        <ConfirmationWrapper
                            title="Подтверждение удаления"
                            message="Вы уверены, что хотите удалить эту категорию?"
                            onConfirm={handleDeleteCategory}
                        >
                            <button
                                type="button"
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-red-400"
                                disabled={isLoading}
                            >
                                {isLoading ? "Удаление..." : "Удалить"}
                            </button>
                        </ConfirmationWrapper>
                        <ConfirmationWrapper
                            title="Подтверждение сохранения"
                            message="Вы уверены, что хотите сохранить изменения для этой категории?"
                            onConfirm={handleSaveCategory}
                        >
                            <button
                                type="button"
                                className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition disabled:bg-main-dull-gray"
                                disabled={isLoading}
                            >
                                {isLoading ? "Сохранение..." : "Сохранить"}
                            </button>
                        </ConfirmationWrapper>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategorySettingsModal;