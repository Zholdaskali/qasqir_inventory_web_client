import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Notification from "../../notification/Notification";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_UPDATE_SUPPLIER, API_DELETE_SUPPLIER } from "../../../api/API";

const SupplierSettingModal = ({ supplier, onClose, fetchSupplierList }) => {
    const authToken = useSelector((state) => state.token.token);

    const [name, setName] = useState(supplier.name);
    const [contactInfo, setContactInfo] = useState(supplier.contactInfo);

    const handleUpdate = async () => {
        try {
            const url = API_UPDATE_SUPPLIER.replace("{supplierId}", supplier.id);
            await axios.put(
                url, 
                { name, contactInfo },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success("Поставщик успешно обновлен");
            onClose(); // Закрываем модальное окно
            fetchSupplierList(); // Обновляем список поставщиков
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении поставщика");
        }
    };

    const handleDelete = async () => {
        try {
            const url = API_DELETE_SUPPLIER.replace("{supplierId}", supplier.id);
            await axios.delete(
                url, 
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success("Поставщик успешно удален");
            onClose(); // Закрываем модальное окно
            fetchSupplierList(); // Обновляем список поставщиков
        } catch (error) {
            toast.error("Ошибка при удалении поставщика");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl mb-4">Редактировать поставщика</h2>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Контактная информация"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <ConfirmationWrapper
                        title="Подтверждение удаления"
                        message="Вы уверены, что хотите удалить этого поставщика?"
                        onConfirm={handleDelete}
                    >
                        <button
                            type="button"
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Удалить
                        </button>
                    </ConfirmationWrapper>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Отмена
                    </button>
                    <ConfirmationWrapper
                        title="Подтверждение обновления"
                        message="Вы уверены, что хотите сохранить изменения для этого поставщика?"
                        onConfirm={handleUpdate}
                    >
                        <button
                            type="button"
                            className="bg-main-dull-blue text-white px-4 py-2 rounded"
                        >
                            Обновить
                        </button>
                    </ConfirmationWrapper>
                </div>
            </div>
            <Notification />
        </div>
    );
};

export default SupplierSettingModal;