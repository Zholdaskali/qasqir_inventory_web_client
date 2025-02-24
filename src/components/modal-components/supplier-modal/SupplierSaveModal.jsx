import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const SupplierSaveModal = ({ onClose, fetchSupplierList }) => {
    const authToken = useSelector((state) => state.token.token);

  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSave = async () => {
    try {
      await axios.post(
        "http://localhost:8081/api/v1/warehouse-manager/suppliers",
        { name, contactInfo },
        {
          headers: { "Auth-token": authToken },
        }
      );
      toast.success("Поставщик успешно создан");
      fetchSupplierList(); // Обновляем список поставщиков
      onClose(); // Закрываем модальное окно
    } catch (error) {
      toast.error("Ошибка при создании поставщика");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl mb-4">Создать поставщика</h2>
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
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="bg-main-dull-blue text-white px-4 py-2 rounded"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierSaveModal;