import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";

import {
  API_GET_ALL_WAREHOUSES,
  API_GET_WAREHOUSE_ZONES_BY_ID,
  API_GET_INVENTORY_ITEMS_BY_ZONE,
  API_PROCESS_TRANSFER,
} from "../../../api/API";

const TransferRequestPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);

  const [state, setState] = useState({
    loading: false,
    warehouses: [],
    fromWarehouse: "",
    toWarehouse: "",
    fromZones: [],
    toZones: [],
    selectedFromZones: new Set(),
    availableItems: new Map(),
    transferItems: new Map(),
    dropdowns: {
      fromWarehouse: false,
      toWarehouse: false,
    },
  });

  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await axios.get(API_GET_ALL_WAREHOUSES, {
        headers: { "Auth-token": authToken },
      });
      setState((prev) => ({ ...prev, warehouses: response.data.body || [] }));
    } catch (error) {
      toast.error("Ошибка загрузки складов");
      setState((prev) => ({ ...prev, warehouses: [] }));
    }
  }, [authToken]);

  const fetchZones = useCallback(async (warehouseId, type) => {
    try {
      const response = await axios.get(
        `${API_GET_WAREHOUSE_ZONES_BY_ID.replace("{warehouseId}", warehouseId)}`,
        { headers: { "Auth-token": authToken } }
      );
      setState((prev) => ({
        ...prev,
        [type === "from" ? "fromZones" : "toZones"]: response.data.body || [],
      }));
    } catch (error) {
      toast.error(`Ошибка загрузки зон ${type === "from" ? "источника" : "назначения"}`);
      setState((prev) => ({
        ...prev,
        [type === "from" ? "fromZones" : "toZones"]: [],
      }));
    }
  }, [authToken]);

  const fetchItemsForZone = useCallback(async (zoneId) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await axios.get(
        `${API_GET_INVENTORY_ITEMS_BY_ZONE.replace("{warehouseZoneId}", zoneId)}`,
        { headers: { "Auth-token": authToken } }
      );

      const items = (response.data.body || []).map((item) => ({
        ...item,
        id: `${item.nomenclatureId}-${zoneId}`,
        fromWarehouseZoneId: parseInt(zoneId, 10),
        toWarehouseZoneId: null,
        availableQuantity: item.quantity,
        transferQuantity: 0,
      }));

      setState((prev) => {
        const newItems = new Map(prev.availableItems);
        items.forEach((item) => newItems.set(item.id, item));
        return { ...prev, availableItems: newItems, loading: false };
      });
      toast.success(`Товары из зоны ${zoneId} загружены`);
    } catch (error) {
      toast.error(`Ошибка загрузки товаров для зоны ${zoneId}`);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [authToken]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleWarehouseSelect = useCallback(
    async (warehouseId, type) => {
      const isFrom = type === "from";
      setState((prev) => ({
        ...prev,
        [isFrom ? "fromWarehouse" : "toWarehouse"]: warehouseId,
        dropdowns: { ...prev.dropdowns, [type + "Warehouse"]: false },
        ...(isFrom
          ? { selectedFromZones: new Set(), availableItems: new Map(), transferItems: new Map() }
          : {}),
      }));
      if (warehouseId) await fetchZones(warehouseId, type);
    },
    [fetchZones]
  );

  const handleZoneToggle = useCallback(
    (zoneId) => {
      setState((prev) => {
        const newZones = new Set(prev.selectedFromZones);
        const newAvailableItems = new Map(prev.availableItems);
        if (newZones.has(zoneId)) {
          newZones.delete(zoneId);
          Array.from(newAvailableItems.entries())
            .filter(([_, item]) => item.fromWarehouseZoneId === zoneId)
            .forEach(([id]) => {
              newAvailableItems.delete(id);
              prev.transferItems.delete(id);
            });
        } else {
          newZones.add(zoneId);
          fetchItemsForZone(zoneId);
        }
        return {
          ...prev,
          selectedFromZones: newZones,
          availableItems: newAvailableItems,
          transferItems: new Map(prev.transferItems),
        };
      });
    },
    [fetchItemsForZone]
  );

  const handleItemToggle = useCallback((itemId) => {
    setState((prev) => {
      const newTransferItems = new Map(prev.transferItems);
      if (newTransferItems.has(itemId)) {
        newTransferItems.delete(itemId);
      } else {
        const item = prev.availableItems.get(itemId);
        if (item) newTransferItems.set(itemId, { ...item });
      }
      return { ...prev, transferItems: newTransferItems };
    });
  }, []);

  const handleItemUpdate = useCallback((itemId, field, value) => {
    setState((prev) => {
      const newItems = new Map(prev.transferItems);
      const item = newItems.get(itemId);
      if (!item) return prev;
      if (field === "transferQuantity") {
        const numValue = Math.min(parseFloat(value) || 0, item.availableQuantity);
        newItems.set(itemId, { ...item, transferQuantity: numValue });
      } else if (field === "toWarehouseZoneId") {
        newItems.set(itemId, { ...item, toWarehouseZoneId: parseInt(value, 10) || null });
      }
      return { ...prev, transferItems: newItems };
    });
  }, []);

  const validateTransfer = useCallback(() => {
    const items = Array.from(state.transferItems.values());
    if (!state.fromWarehouse) {
      toast.error("Выберите склад-источник");
      return false;
    }
    if (!state.toWarehouse) {
      toast.error("Выберите склад-назначение");
      return false;
    }
    if (items.length === 0) {
      toast.error("Выберите товары для перемещения");
      return false;
    }
    if (items.some((item) => !item.toWarehouseZoneId)) {
      toast.error("Укажите зоны назначения для всех товаров");
      return false;
    }
    if (items.some((item) => item.transferQuantity <= 0)) {
      toast.error("Укажите корректное количество для всех товаров");
      return false;
    }
    if (state.fromWarehouse === state.toWarehouse) {
      if (items.some((item) => item.fromWarehouseZoneId === item.toWarehouseZoneId)) {
        toast.error("Зоны источник и назначение не могут совпадать при перемещении внутри склада");
        return false;
      }
    }
    return true;
  }, [state.fromWarehouse, state.toWarehouse, state.transferItems]);

  const handleSubmitTransfer = useCallback(async () => {
    if (!validateTransfer()) return;
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const items = Array.from(state.transferItems.values());
      const isInternalTransfer = state.fromWarehouse === state.toWarehouse;
      const payload = {
        documentType: isInternalTransfer ? "INTERNAL_TRANSFER" : "TRANSFER",
        documentNumber: `${isInternalTransfer ? "IT" : "TR"}-${Date.now()}`,
        documentDate: new Date().toISOString(),
        fromWarehouseId: parseInt(state.fromWarehouse, 10),
        toWarehouseId: parseInt(state.toWarehouse, 10),
        items: items.map((item) => ({
          nomenclatureId: item.nomenclatureId,
          quantity: item.transferQuantity,
          fromWarehouseZoneId: item.fromWarehouseZoneId,
          toWarehouseZoneId: item.toWarehouseZoneId,
          containerId: item.containerId || null,
        })),
        createdBy: userId,
        status: "PENDING",
      }; // Добавлена точка с запятой
  
      const response = await axios.post(API_PROCESS_TRANSFER, payload, {
        headers: { "Auth-token": authToken },
      });
  
      toast.success(response.data.message || "Перемещение успешно создано");
      setState((prev) => ({
        ...prev,
        fromWarehouse: "",
        toWarehouse: "",
        selectedFromZones: new Set(),
        availableItems: new Map(),
        transferItems: new Map(),
        fromZones: [],
        toZones: [],
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при создании перемещения");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [authToken, userId, state.fromWarehouse, state.toWarehouse, state.transferItems, validateTransfer]);

  const toggleDropdown = (type) => {
    setState((prev) => ({
      ...prev,
      dropdowns: { ...prev.dropdowns, [type]: !prev.dropdowns[type] },
    }));
  };

  const availableToZones =
    state.fromWarehouse === state.toWarehouse
      ? state.fromZones.filter((zone) => !state.selectedFromZones.has(zone.id))
      : state.toZones;

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Перемещение товаров</h1>
        <p className="text-sm text-gray-600 mt-1">Создайте заявку на перемещение товаров между складами или зонами</p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Warehouse Selection */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Выбор складов</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["from", "to"].map((type) => (
              <div key={type}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {type === "from" ? "Склад-источник *" : "Склад-назначение *"}
                </label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(type + "Warehouse")}
                    disabled={state.loading}
                    className="w-full p-2 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-left"
                  >
                    {state[type + "Warehouse"]
                      ? state.warehouses.find((w) => w.id === parseInt(state[type + "Warehouse"]))?.name
                      : "Выберите склад"}
                  </button>
                  {state.dropdowns[type + "Warehouse"] && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-sm max-h-40 overflow-y-auto">
                      {state.warehouses.map((warehouse) => (
                        <li
                          key={warehouse.id}
                          onClick={() => handleWarehouseSelect(warehouse.id, type)}
                          className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                        >
                          {warehouse.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Zone Selection */}
        {state.fromWarehouse && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Зоны склада-источника</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {state.fromZones.map((zone) => (
                <div key={zone.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    id={`zone-${zone.id}`}
                    checked={state.selectedFromZones.has(zone.id)}
                    onChange={() => handleZoneToggle(zone.id)}
                    disabled={state.loading}
                    className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-400"
                  />
                  <label htmlFor={`zone-${zone.id}`} className="ml-2 text-sm text-gray-700">
                    {zone.name}
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available Items Selection */}
        {state.availableItems.size > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Доступные товары</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600">
                    <th className="p-2 text-left">Выбрать</th>
                    <th className="p-2 text-left">Номенклатура</th>
                    <th className="p-2 text-left">Ед.изм.</th>
                    <th className="p-2 text-left">Код</th>
                    <th className="p-2 text-left">Зона</th>
                    <th className="p-2 text-left">Доступно</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(state.availableItems.values()).map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={state.transferItems.has(item.id)}
                          onChange={() => handleItemToggle(item.id)}
                          disabled={state.loading}
                          className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                      <td className="p-2">{item.nomenclatureName}</td>
                      <td className="p-2">{item.measurementUnit}</td>
                      <td className="p-2">{item.code}</td>
                      <td className="p-2">
                        {state.fromZones.find((z) => z.id === item.fromWarehouseZoneId)?.name}
                      </td>
                      <td className="p-2">{item.availableQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Transfer Items Configuration */}
        {state.transferItems.size > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Товары для перемещения</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600">
                    <th className="p-2 text-left">Номенклатура</th>
                    <th className="p-2 text-left">Ед.изм.</th>
                    <th className="p-2 text-left">Код</th>
                    <th className="p-2 text-left">Из зоны</th>
                    <th className="p-2 text-left">В зону</th>
                    <th className="p-2 text-left">Доступно</th>
                    <th className="p-2 text-left">К перемещению</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(state.transferItems.values()).map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{item.nomenclatureName}</td>
                      <td className="p-2">{item.measurementUnit}</td>
                      <td className="p-2">{item.code}</td>
                      <td className="p-2">
                        {state.fromZones.find((z) => z.id === item.fromWarehouseZoneId)?.name}
                      </td>
                      <td className="p-2">
                        <select
                          value={item.toWarehouseZoneId || ""}
                          onChange={(e) => handleItemUpdate(item.id, "toWarehouseZoneId", e.target.value)}
                          className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                          disabled={!state.toWarehouse || state.loading}
                        >
                          <option value="">Выберите зону</option>
                          {availableToZones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">{item.availableQuantity}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max={item.availableQuantity}
                          value={item.transferQuantity}
                          onChange={(e) => handleItemUpdate(item.id, "transferQuantity", e.target.value)}
                          className="w-24 p-1 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                          disabled={state.loading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Submit Button */}
        {state.transferItems.size > 0 && (
          <section className="flex justify-end">
            <ConfirmationWrapper
              title="Подтверждение перемещения"
              message="Вы уверены, что хотите создать запрос на перемещение товаров?"
              onConfirm={handleSubmitTransfer}
            >
              <button
                disabled={state.loading || !validateTransfer()}
                className="w-full sm:w-48 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
              >
                {state.loading ? "Обработка..." : "Создать перемещение"}
              </button>
            </ConfirmationWrapper>
          </section>
        )}
      </div>
    </div>
  );
};

export default TransferRequestPage;