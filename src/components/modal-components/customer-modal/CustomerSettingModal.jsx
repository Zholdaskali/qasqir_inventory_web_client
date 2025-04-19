import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Notification from "../../notification/Notification";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";
import { API_UPDATE_CUSTOMER, API_DELETE_CUSTOMER } from "../../../api/API";

const CustomerSettingModal = ({ customer, onClose, fetchCustomerList }) => {
  const authToken = useSelector((state) => state.token.token);

  const [name, setName] = useState(customer?.name || "");
  const [contactInfo, setContactInfo] = useState(customer?.contactInfo || "");

  // Проверка на наличие customer и customer.id
  if (!customer || !customer.id) {
    console.warn("Customer or customer.id is undefined in CustomerSettingModal", { customer });
    toast.error("Невозможно открыть настройки: данные клиента отсутствуют");
    return null;
  }

  const handleUpdate = async () => {
    try {
      const url = API_UPDATE_CUSTOMER.replace("{customerId}", customer.id);
      const requestBody = { name, contactInfo };
      const requestHeaders = { "Auth-token": authToken };

      // Отладочный вывод: что отправляется в бэкенд
      console.log("Sending PUT request to backend:");
      console.log("URL:", url);
      console.log("Body:", requestBody);
      console.log("Headers:", requestHeaders);

      await axios.put(url, requestBody, {
        headers: requestHeaders,
      });
      toast.success("Клиент успешно обновлен");
      onClose();
      fetchCustomerList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при обновлении клиента");
      console.error("Update error:", error.response?.data);
    }
  };

  const handleDelete = async () => {
    try {
        const url = API_DELETE_CUSTOMER.replace("{customerId}", customer.id);
      const requestHeaders = { "Auth-token": authToken };

      // Отладочный вывод для DELETE запроса
      console.log("Sending DELETE request to backend:");
      console.log("URL:", url);
      console.log("Headers:", requestHeaders);

      await axios.delete(url, {
        headers: requestHeaders,
      });
      toast.success("Клиент успешно удален");
      onClose();
      fetchCustomerList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при удалении клиента");
      console.error("Delete error:", error.response?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl mb-4">Редактировать клиента</h2>
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