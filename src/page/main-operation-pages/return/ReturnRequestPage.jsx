import { useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";
import {
  API_GET_ALL_WAREHOUSES,
  API_GET_INVENTORY_ITEMS_BY_WAREHOUSE,
  API_PROCESS_RETURN,
} from "../../../api/API";
import { 
  setWarehouses, 
  setInventoryItems 
} from '../../../store/slices/main-operation-slice/return/returnCacheSlice';
import { 
  setReturnField, 
  resetReturnForm,
  setLoading 
} from '../../../store/slices/main-operation-slice/return/returnSlice';

const ReturnRequestPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);
  const {
    warehouses = [],
    inventoryItems = {}
  } = useSelector((state) => state.returnCache || {});
  const {
    selectedWarehouseId = "",
    selectedInventoryId = "",
    returnType = "DEFECTIVE",
    documentNumber = `RET-${Date.now()}`,
    quantity = "",
    reason = "",
    loading = false
  } = useSelector((state) => state.returnForm || {});
  const dispatch = useDispatch();

  // Проверка валидности формы
  const isFormValid = useCallback(() => {
    return (
      selectedWarehouseId &&
      selectedInventoryId &&
      quantity > 0 &&
      reason.trim()
    );
  }, [selectedWarehouseId, selectedInventoryId, quantity, reason]);

  // Загрузка складов
  const fetchWarehouses = useCallback(async () => {
    if (!authToken || warehouses.length > 0) return;
    try {
      dispatch(setLoading(true));
      const response = await axios.get(API_GET_ALL_WAREHOUSES, {
        headers: { "Auth-token": authToken },
      });
      dispatch(setWarehouses(response.data.body || []));
    } catch (error) {
      toast.error("Ошибка загрузки складов");
    } finally {
      dispatch(setLoading(false));
    }
  }, [authToken, warehouses.length, dispatch]);

  // Загрузка инвентаря
  const fetchInventory = useCallback(async () => {
    if (!authToken || !selectedWarehouseId) return;
    try {
      dispatch(setLoading(true));
      const response = await axios.get(
        API_GET_INVENTORY_ITEMS_BY_WAREHOUSE.replace("{warehouseId}", selectedWarehouseId),
        { headers: { "Auth-token": authToken } }
      );
      dispatch(setInventoryItems({
        warehouseId: selectedWarehouseId,
        items: response.data.body?.inventory || []
      }));
    } catch (error) {
      toast.error("Ошибка загрузки инвентаря");
    } finally {
      dispatch(setLoading(false));
    }
  }, [authToken, selectedWarehouseId, dispatch]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    if (selectedWarehouseId) fetchInventory();
  }, [fetchInventory, selectedWarehouseId]);

  // Обработчик изменения полей формы
  const handleFieldChange = (field, value) => {
    dispatch(setReturnField({ field, value }));
  };

  // Обработчик отправки возврата
  const handleCreateReturn = useCallback(async () => {
    if (!isFormValid()) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const items = inventoryItems[selectedWarehouseId] || [];
    const selectedItem = items.find(item => item.id === parseInt(selectedInventoryId));
    
    if (!selectedItem || parseInt(quantity) <= 0 || parseInt(quantity) > selectedItem.quantity) {
      toast.error("Указано некорректное количество");
      return;
    }

    try {
      dispatch(setLoading(true));
      const payload = {
        returnType,
        documentNumber,
        inventoryId: parseInt(selectedInventoryId),
        nomenclatureId: selectedItem.nomenclatureId,
        quantity: parseInt(quantity),
        reason,
        createdBy: userId,
      };
      
      await axios.post(API_PROCESS_RETURN, payload, {
        headers: { "Auth-token": authToken, "Content-Type": "application/json" },
      });
      
      toast.success("Возврат успешно создан");
      dispatch(resetReturnForm());
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при создании возврата");
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    authToken, userId, returnType, documentNumber, 
    selectedInventoryId, quantity, reason, 
    inventoryItems, selectedWarehouseId, isFormValid, dispatch
  ]);

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Возврат товара</h1>
        <p className="text-sm text-gray-600 mt-1">Создайте заявку на возврат товара</p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Настройки возврата</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Склад *</label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => handleFieldChange("selectedWarehouseId", e.target.value)}
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
                onChange={(e) => handleFieldChange("selectedInventoryId", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading || !selectedWarehouseId}
              >
                <option value="">Выберите товар</option>
                {(inventoryItems[selectedWarehouseId] || []).map((item) => (
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
                onChange={(e) => handleFieldChange("returnType", e.target.value)}
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
                onChange={(e) => handleFieldChange("documentNumber", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Количество *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleFieldChange("quantity", e.target.value)}
                min="1"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Введите количество"
                disabled={loading || !selectedInventoryId}
              />
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Причина возврата</h2>
          <textarea
            value={reason}
            onChange={(e) => handleFieldChange("reason", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
            rows="4"
            placeholder="Укажите причину возврата (обязательно)"
            disabled={loading}
          />
        </section>

        <section className="flex justify-end">
          <ConfirmationWrapper
            title="Подтверждение создания возврата"
            message="Вы уверены, что хотите создать эту заявку на возврат?"
            onConfirm={handleCreateReturn}
          >
            <button
              className="w-full sm:w-48 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Создание..." : "Создать возврат"}
            </button>
          </ConfirmationWrapper>
        </section>
      </div>
    </div>
  );
};

export default ReturnRequestPage;