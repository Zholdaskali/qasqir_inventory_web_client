import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { List, AutoSizer } from "react-virtualized";
import debounce from "lodash/debounce";

const BatchWriteOffPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);

  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [comment, setComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [documentType, setDocumentType] = useState("WRITE-OFF");
  const [documentNumber, setDocumentNumber] = useState(`WO-${Date.now()}`);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isItemListOpen, setIsItemListOpen] = useState(false);

  // Дебаунс для поиска
  const debouncedSearch = useMemo(() => debounce((query) => setSearchQuery(query), 300), []);

  // Фильтрация товаров
  const filteredItems = useMemo(() => {
    let result = inventoryItems;
    if (selectedZoneId) result = result.filter((item) => item.warehouseZone.id === parseInt(selectedZoneId));
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => item.nomenclatureName.toLowerCase().includes(lowerQuery));
    }
    return result;
  }, [inventoryItems, selectedZoneId, searchQuery]);

  // Функции загрузки данных
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

  const fetchCustomers = useCallback(async () => {
    if (!authToken || documentType !== "SALES") return;
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/customers", {
        headers: { "Auth-token": authToken },
      });
      setCustomers(Array.isArray(response.data.body) ? response.data.body : []);
    } catch (error) {
      toast.error("Ошибка загрузки клиентов");
    } finally {
      setLoading(false);
    }
  }, [authToken, documentType]);

  const fetchInventory = useCallback(async () => {
    if (!authToken || !selectedWarehouseId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/v1/user/warehouse/items/${selectedWarehouseId}`,
        { headers: { "Auth-token": authToken } }
      );
      const inventory = Array.isArray(response.data.body.inventory) ? response.data.body.inventory : [];
      setInventoryItems(inventory);
      setZones([...new Map(inventory.map((item) => [item.warehouseZone.id, item.warehouseZone])).values()]);
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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Обработчики
  const handleItemSelect = useCallback(
    (item) => {
      if (!selectedItems.some((selected) => selected.id === item.id)) {
        setSelectedItems((prev) => [...prev, item]);
        setQuantities((prev) => ({ ...prev, [item.id]: "" }));
      }
    },
    [selectedItems]
  );

  const handleQuantityChange = useCallback((itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: parseInt(value) || 0 }));
  }, []);

  const handleRemoveItem = useCallback((itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
  }, []);

  const handleCreateBatchWriteOff = useCallback(async () => {
    if (!selectedWarehouseId || !selectedZoneId || (documentType === "SALES" && !selectedCustomerId)) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    if (!selectedItems.length) {
      toast.error("Выберите хотя бы один товар");
      return;
    }
    for (const item of selectedItems) {
      if (!quantities[item.id] || quantities[item.id] <= 0) {
        toast.error(`Укажите корректное количество для: ${item.nomenclatureName}`);
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        documentType,
        documentNumber,
        documentDate: "2025-03-24",
        createdBy: userId,
        ...(documentType === "SALES" && { customerId: parseInt(selectedCustomerId) }),
        ticketRequests: selectedItems.map((item) => ({
          comment: comment || `Групповой процесс: ${documentType}`,
          inventoryId: item.id,
          quantity: quantities[item.id],
        })),
      };
      await axios.post("http://localhost:8081/api/v1/warehouse-manager/ticket/batch", payload, {
        headers: { "Auth-token": authToken, "Content-Type": "application/json" },
      });
      toast.success("Заявка успешно создана");
      setSelectedItems([]);
      setQuantities({});
      setComment("");
      setSelectedCustomerId("");
      setDocumentNumber(`${documentType.slice(0, 2).toUpperCase()}-${Date.now()}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при создании заявки");
    } finally {
      setLoading(false);
    }
  }, [authToken, userId, documentType, documentNumber, selectedWarehouseId, selectedZoneId, selectedCustomerId, selectedItems, quantities, comment]);

  const rowRenderer = useCallback(
    ({ index, key, style }) => {
      const item = filteredItems[index];
      return (
        <div
          key={key}
          style={style}
          onClick={() => handleItemSelect(item)}
          className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
        >
          <span className="truncate flex-1">{item.nomenclatureName}</span>
          <span className="text-sm text-gray-500">
            {item.quantity} {item.measurementUnit}
          </span>
        </div>
      );
    },
    [filteredItems, handleItemSelect]
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Групповая заявка</h1>
        <p className="text-sm text-gray-600 mt-1">Создайте заявку на списание, продажу или производство</p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Основные настройки */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Настройки документа</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Зона *</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading || !selectedWarehouseId}
              >
                <option value="">Выберите зону</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Тип процесса *</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading}
              >
                <option value="WRITE-OFF">Утилизация</option>
                <option value="SALES">Продажа</option>
                <option value="PRODUCTION">Производство</option>
              </select>
            </div>
            {documentType === "SALES" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Клиент *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                  disabled={loading}
                >
                  <option value="">Выберите клиента</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contactInfo})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
          </div>
        </section>

        {/* Выбор товаров */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Выбор товаров</h2>
          <div className="relative">
            <input
              type="text"
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Поиск товаров..."
              disabled={loading || !selectedZoneId}
              onFocus={() => setIsItemListOpen(true)}
              onBlur={() => setTimeout(() => setIsItemListOpen(false), 200)}
            />
            {isItemListOpen && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-md max-h-80 overflow-hidden">
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width}
                      height={Math.min(filteredItems.length * 40, 320)}
                      rowCount={filteredItems.length}
                      rowHeight={40}
                      rowRenderer={rowRenderer}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </div>
        </section>

        {/* Выбранные товары */}
        {selectedItems.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Выбранные товары ({selectedItems.length})
            </h2>
            <div className="border rounded-md bg-gray-50 max-h-60 overflow-auto">
              <div className="grid grid-cols-12 gap-2 p-2 text-xs font-medium text-gray-600 border-b">
                <span className="col-span-8">Название</span>
                <span className="col-span-2 text-center">Количество</span>
                <span className="col-span-2 text-center">Действие</span>
              </div>
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 text-sm border-b border-gray-100 last:border-b-0"
                >
                  <span className="col-span-8 truncate">
                    {item.nomenclatureName} ({item.quantity} {item.measurementUnit})
                  </span>
                  <input
                    type="number"
                    value={quantities[item.id] || ""}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    min="1"
                    max={item.quantity}
                    className="col-span-2 p-1 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm text-center"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="col-span-2 text-red-500 hover:text-red-700 text-sm text-center"
                    disabled={loading}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Комментарий и кнопка */}
        <section className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Комментарий</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
              rows="3"
              placeholder="Введите комментарий (опционально)"
              disabled={loading}
            />
          </div>
          <div className="sm:self-end">
            <button
              onClick={handleCreateBatchWriteOff}
              className="w-full sm:w-48 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
              disabled={loading}
            >
              {loading ? "Создание..." : "Создать заявку"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BatchWriteOffPage;