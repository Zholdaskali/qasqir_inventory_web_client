import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReturnRequestPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);

  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [returnType, setReturnType] = useState("DEFECTIVE");
  const [documentNumber, setDocumentNumber] = useState(`RET-${Date.now()}`);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  // Загрузка складов
  const fetchWarehouses = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/api/v1/employee/warehouses", {
        headers: { "Auth-token": authToken },
      });
      setWarehouses(Array.isArray(response.data.body) ? response.data.body : []);
    } catch (error) {
      toast.error("Ошибка загрузки складов");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Загрузка инвентаря
  const fetchInventory = useCallback(async () => {
    if (!authToken || !selectedWarehouseId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/v1/user/warehouse/items/${selectedWarehouseId}`,
        { headers: { "Auth-token": authToken } }
      );
      setInventoryItems(Array.isArray(response.data.body.inventory) ? response.data.body.inventory : []);
    } catch (error) {
      toast.error("Ошибка загрузки инвентаря");
    } finally {
      setLoading(false);
    }
  }, [authToken, selectedWarehouseId]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    if (selectedWarehouseId) fetchInventory();
  }, [fetchInventory, selectedWarehouseId]);

  // Обработчик отправки возврата
  const handleCreateReturn = useCallback(async () => {
    if (!selectedWarehouseId || !selectedInventoryId || !quantity || !reason) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const selectedItem = inventoryItems.find((item) => item.id === parseInt(selectedInventoryId));
    if (!selectedItem || parseInt(quantity) <= 0 || parseInt(quantity) > selectedItem.quantity) {
      toast.error("Указано некорректное количество");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        returnType,
        documentNumber,
        inventoryId: parseInt(selectedInventoryId),
        nomenclatureId: selectedItem.nomenclatureId,
        quantity: parseInt(quantity),
        reason,
        createdBy: userId,
      };
      await axios.post("http://localhost:8081/api/v1/storekeeper/return", payload, {
        headers: { "Auth-token": authToken, "Content-Type": "application/json" },
      });
      toast.success("Возврат успешно создан");
      setSelectedInventoryId("");
      setQuantity("");
      setReason("");
      setDocumentNumber(`RET-${Date.now()}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при создании возврата");
    } finally {
      setLoading(false);
    }
  }, [authToken, userId, returnType, documentNumber, selectedInventoryId, quantity, reason, inventoryItems]);

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Возврат товара</h1>
        <p className="text-sm text-gray-600 mt-1">Создайте заявку на возврат товара</p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Настройки возврата */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Настройки возврата</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Склад *</label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading}
              >
                <option value="">Выберите склад</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Товар *</label>
              <select
                value={selectedInventoryId}
                onChange={(e) => setSelectedInventoryId(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading || !selectedWarehouseId}
              >
                <option value="">Выберите товар</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nomenclatureName} ({item.quantity} {item.measurementUnit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Тип возврата *</label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading}
              >
                <option value="DEFECTIVE">Бракованный</option>
                <option value="EXCESS">Избыток</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Номер документа</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Количество *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Введите количество"
                disabled={loading || !selectedInventoryId}
              />
            </div>
          </div>
        </section>

        {/* Причина возврата */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Причина возврата</h2>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
            rows="4"
            placeholder="Укажите причину возврата (обязательно)"
            disabled={loading}
          />
        </section>

        {/* Кнопка */}
        <section className="flex justify-end">
          <button
            onClick={handleCreateReturn}
            className="w-full sm:w-48 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать возврат"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default ReturnRequestPage;