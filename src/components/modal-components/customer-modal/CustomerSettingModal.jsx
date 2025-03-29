import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Notification from "../../notification/Notification";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";

const CustomerSettingModal = ({ customer, onClose, fetchCustomerList }) => { 
    const authToken = useSelector((state) => state.token.token);

    const [name, setName] = useState(customer.name);
    const [contactInfo, setContactInfo] = useState(customer.contactInfo);

    const handleUpdate = async () => {
        try {
            await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/customers/${customer.id}`,
                { name, contactInfo },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success("Клиент успешно обновлен"); // Исправил ошибку с error.response и текст
            onClose(); // Закрываем модальное окно
            fetchCustomerList(); // Обновляем список клиентов
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении клиента");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/customers/${customer.id}`,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success("Клиент успешно удален"); // Исправил текст
            onClose(); // Закрываем модальное окно
            fetchCustomerList(); // Обновляем список клиентов
        } catch (error) {
            toast.error("Ошибка при удалении клиента");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl mb-4">Редактировать клиента</h2> {/* Исправил текст */}
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
                        message="Вы уверены, что хотите удалить этого клиента?"
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
                        message="Вы уверены, что хотите сохранить изменения для этого клиента?"
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

export default CustomerSettingModal;