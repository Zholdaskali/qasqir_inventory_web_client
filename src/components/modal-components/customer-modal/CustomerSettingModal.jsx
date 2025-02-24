import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Notification from "../../notification/Notification";

const CustomerSettingModal = ({ supplier, onClose, fetchSupplierList }) => {
    const authToken = useSelector((state) => state.token.token);

    const [name, setName] = useState(supplier.name);
    const [contactInfo, setContactInfo] = useState(supplier.contactInfo);

    const handleUpdate = async () => {
        try {
            await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/customers/${supplier.id}`,
                { name, contactInfo },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(error.response?.data?.message || "Поставщик успешно обновлен");
            onClose(); // Закрываем модальное окно
            fetchSupplierList(); // Обновляем список поставщиков
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении поставщика");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/customers/${supplier.id}`,
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
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Удалить
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="bg-main-dull-blue text-white px-4 py-2 rounded"
                    >
                        Обновить
                    </button>
                </div>
            </div>
            <Notification />
        </div>
    );
};

export default CustomerSettingModal;