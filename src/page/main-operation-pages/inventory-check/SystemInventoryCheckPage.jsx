import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import ConfirmationWrapper from '../../../components/ui/ConfirmationWrapper';
import {
  API_GET_ALL_WAREHOUSES,
  API_GET_WAREHOUSE_ZONES_BY_ID,
  API_GET_INVENTORY_ITEMS_BY_ZONE,
  API_START_INVENTORY_CHECK,
  API_PROCESS_INVENTORY_CHECK,
  API_GET_INVENTORY_CHECK_SYSTEM_BY_ID,
} from '../../../api/API';

const SystemInventoryCheckPage = ({ inventoryId: initialInventoryId }) => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);

  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedZones, setSelectedZones] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryId, setInventoryId] = useState(null);
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedZoneIds, setProcessedZoneIds] = useState([]);
  const [processedWarehouseIds, setProcessedWarehouseIds] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const itemsPerPage = 50;

  // Форматируем зоны для react-select
  const zoneOptions = zones.map((zone) => ({
    value: String(zone.id),
    label: zone.name,
    isDisabled: processedZoneIds.includes(String(zone.id)),
  }));

  // Загрузка складов
  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await axios.get(API_GET_ALL_WAREHOUSES, {
        headers: { 'Auth-token': authToken },
      });
      setWarehouses(response.data.body || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Ошибка загрузки складов');
      setWarehouses([]);
    }
  }, [authToken]);

  // Загрузка зон для выбранного склада
  const fetchZonesForWarehouse = useCallback(async (warehouseId) => {
    try {
      const response = await axios.get(
        `${API_GET_WAREHOUSE_ZONES_BY_ID.replace('{warehouseId}', warehouseId)}`,
        { headers: { 'Auth-token': authToken } }
      );
      console.log('Fetched zones for warehouse', warehouseId, ':', response.data.body);
      setZones(response.data.body || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Ошибка загрузки зон');
      setZones([]);
    }
  }, [authToken]);

  // Загрузка товаров для зоны
  const fetchItemsForZone = useCallback(async (zoneId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_GET_INVENTORY_ITEMS_BY_ZONE.replace('{warehouseZoneId}', zoneId)}`,
        { headers: { 'Auth-token': authToken } }
      );

      const newItems = (response.data.body || []).map((item) => ({
        nomenclatureId: item.nomenclatureId,
        nomenclatureName: item.nomenclatureName,
        measurementUnit: item.measurementUnit || 'шт',
        code: item.code || '',
        quantity: parseFloat(item.quantity) || 0,
        actualQuantity: parseFloat(item.quantity) || 0,
        warehouseZoneId: parseInt(zoneId, 10),
        warehouseContainerId: item.warehouseContainer?.id || null,
        warehouseContainerSerial: item.warehouseContainer?.serialNumber || null,
      }));

      setInventoryItems((prevItems) => {
        const filteredNewItems = newItems.filter(
          (newItem) =>
            !prevItems.some(
              (existingItem) =>
                existingItem.nomenclatureId === newItem.nomenclatureId &&
                existingItem.warehouseContainerId === newItem.warehouseContainerId &&
                existingItem.warehouseZoneId === newItem.warehouseZoneId
            )
        );
        return [...prevItems, ...filteredNewItems];
      });
    } catch (error) {
      console.error(`Error fetching items for zone ${zoneId}:`, error);
      toast.error(error.response?.data?.message || `Ошибка загрузки товаров для зоны ${zoneId}`);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Загрузка данных инвентаризации
  const fetchInventoryData = useCallback(async () => {
    if (!initialInventoryId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_GET_INVENTORY_CHECK_SYSTEM_BY_ID.replace('{inventoryId}', initialInventoryId)}`,
        { headers: { 'Auth-token': authToken } }
      );

      console.log('Inventory data response:', response.data);

      const { inventoryAudits, status } = response.data.body || {};

      if (!inventoryAudits || inventoryAudits.length === 0) {
        toast.warn('Инвентаризация не найдена, выберите склад для начала новой');
        setInventoryId(null);
        setSelectedWarehouse('');
        setSelectedZones([]);
        setInventoryItems([]);
        setProcessedZoneIds([]);
        setProcessedWarehouseIds([]);
        setZones([]);
        setInventoryStatus(null);
        return;
      }

      // Сохраняем статус инвентаризации
      setInventoryStatus(status);

      // Собираем завершенные склады и зоны
      const completedInventories = inventoryAudits.filter((inv) => inv.status === 'COMPLETED');
      const activeInventories = inventoryAudits.filter((inv) => inv.status === 'IN_PROGRESS');
      const checkedWarehouseIds = [
        ...new Set(completedInventories.map((inv) => String(inv.warehouseId)).filter(Boolean)),
      ];
      const checkedZoneIds = [
        ...new Set(
          [
            ...completedInventories.flatMap((inv) => inv.inventoryAuditResults),
            ...activeInventories.flatMap((inv) => inv.inventoryAuditResults),
          ]
            .map((item) => String(item.zoneId))
            .filter(Boolean)
        ),
      ];
      setProcessedWarehouseIds(checkedWarehouseIds);
      setProcessedZoneIds(checkedZoneIds);
      console.log('Processed zone IDs:', checkedZoneIds);

      // Проверяем, есть ли активная инвентаризация
      const activeInventory = inventoryAudits.find((inv) => inv.status === 'IN_PROGRESS');

      if (!activeInventory && status !== 'IN_PROGRESS') {
        toast.warn('Активная инвентаризация не найдена, выберите склад для начала новой');
        setInventoryId(null);
        setSelectedWarehouse('');
        setSelectedZones([]);
        setInventoryItems([]);
        setZones([]);
        return;
      }

      if (activeInventory) {
        const warehouseId = activeInventory.warehouseId;
        setSelectedWarehouse(warehouseId);
        setInventoryId(activeInventory.inventoryId);

        // Загружаем зоны
        await fetchZonesForWarehouse(warehouseId);

        const items = activeInventory.inventoryAuditResults.map((item) => ({
          nomenclatureId: item.nomenclatureId,
          nomenclatureName: item.nomenclatureName,
          measurementUnit: 'шт',
          code: '',
          quantity: parseFloat(item.expectedQuantity) || 0,
          actualQuantity: parseFloat(item.actualQuantity) || 0,
          warehouseZoneId: parseInt(item.zoneId, 10),
          warehouseContainerId: null,
          warehouseContainerSerial: null,
        }));
        setInventoryItems(items);

        // Фильтруем зоны, исключая обработанные
        const zoneIds = [
          ...new Set(
            items
              .map((item) => item.warehouseZoneId)
              .filter((zoneId) => !checkedZoneIds.includes(String(zoneId)))
          ),
        ];
        setSelectedZones(zoneIds.map(String));

        console.log('Selected zones:', zoneIds);
        console.log('Zone options:', zoneOptions);
      } else {
        setInventoryId(null);
        setSelectedWarehouse('');
        setSelectedZones([]);
        setInventoryItems([]);
        setZones([]);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error(error.response?.data?.message || 'Ошибка загрузки данных инвентаризации');
      setInventoryId(null);
      setSelectedWarehouse('');
      setSelectedZones([]);
      setInventoryItems([]);
      setProcessedZoneIds([]);
      setProcessedWarehouseIds([]);
      setZones([]);
      setInventoryStatus(null);
    } finally {
      setLoading(false);
    }
  }, [initialInventoryId, authToken, fetchZonesForWarehouse]);

  // Загрузка данных инвентаризации при монтировании
  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Загрузка складов при монтировании
  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Начало инвентаризации
  const handleStartInventory = async () => {
    if (!selectedWarehouse) {
      toast.error('Выберите склад для начала инвентаризации');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(API_START_INVENTORY_CHECK, null, {
        params: {
          warehouseId: parseInt(selectedWarehouse, 10),
          createdBy: userId,
          inventoryAuditSystemId: initialInventoryId,
        },
        headers: { 'Auth-token': authToken },
      });
      const newInventoryId = response.data.body?.inventoryId || response.data.inventoryId;
      setInventoryId(newInventoryId);
      setInventoryStatus('IN_PROGRESS');
      await fetchZonesForWarehouse(selectedWarehouse);
      toast.success(response.data.message || 'Инвентаризация успешно начата');
      await fetchInventoryData();
    } catch (error) {
      console.error('Error starting inventory:', error);
      toast.error(error.response?.data?.message || 'Ошибка при начале инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  // Сброс текущей инвентаризации
  const handleResetInventory = () => {
    setInventoryId(null);
    setSelectedWarehouse('');
    setSelectedZones([]);
    setInventoryItems([]);
    setZones([]);
    setProcessedZoneIds([]);
    setProcessedWarehouseIds([]);
    setInventoryStatus(null);
    setCurrentPage(1);
    toast.info('Текущая инвентаризация сброшена. Выберите склад для начала новой.');
  };

  // Выбор склада
  const handleWarehouseSelect = async (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    setSelectedZones([]);
    setInventoryItems([]);
    setIsWarehouseDropdownOpen(false);
    setCurrentPage(1);
    await fetchZonesForWarehouse(warehouseId);
  };

  // Выбор зон
  const handleZoneChange = useCallback(
    async (selectedOptions) => {
      const newSelectedZones = selectedOptions
        .map((option) => option.value)
        .filter((zoneId) => !processedZoneIds.includes(zoneId));
      setSelectedZones(newSelectedZones);
      setInventoryItems([]);

      if (newSelectedZones.length > 0) {
        setLoading(true);
        try {
          for (const zoneId of newSelectedZones) {
            await fetchItemsForZone(zoneId);
          }
        } catch (error) {
          console.error('Error fetching items for zones:', error);
          toast.error(error.response?.data?.message || 'Ошибка загрузки товаров для выбранных зон');
        } finally {
          setLoading(false);
        }
      }
      setCurrentPage(1);
    },
    [fetchItemsForZone, processedZoneIds]
  );

  // Очистка зон
  const handleClearZones = () => {
    setSelectedZones([]);
    setInventoryItems([]);
    setCurrentPage(1);
  };

  // Изменение количества
  const handleQuantityChange = (index, value) => {
    const newItems = [...inventoryItems];
    const normalizedValue = value.replace(',', '.'); // Поддержка запятой в локалях
    newItems[index].actualQuantity =
      normalizedValue === '' ? 0 : parseFloat(normalizedValue) || 0;
    setInventoryItems(newItems);
  };

  // Сохранение инвентаризации
  const handleSubmitInventory = async () => {
    if (inventoryItems.length === 0) {
      toast.error('Нет данных для отправки');
      return;
    }
    if (!inventoryId) {
      toast.error('Инвентаризация еще не начата');
      return;
    }
    try {
      setLoading(true);
      const payload = inventoryItems
        .map((item) => ({
          nomenclatureId: parseInt(item.nomenclatureId, 10),
          warehouseZoneId: parseInt(item.warehouseZoneId, 10),
          containerId: item.warehouseContainerId ? parseInt(item.warehouseContainerId, 10) : null,
          actualQuantity: isNaN(parseFloat(item.actualQuantity))
            ? 0
            : parseFloat(item.actualQuantity),
        }))
        .filter((item) => item.actualQuantity !== item.quantity);

      const response = await axios.post(
        `${API_PROCESS_INVENTORY_CHECK.replace('{inventoryId}', inventoryId)}`,
        payload,
        { headers: { 'Auth-token': authToken } }
      );

      toast.success(response.data.message || 'Инвентаризация успешно завершена');
      setInventoryStatus('COMPLETED');
      await fetchInventoryData();
      setInventoryItems([]);
      setSelectedZones([]);
      setSelectedWarehouse('');
      setInventoryId(null);
      setZones([]);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error submitting inventory:', error);
      toast.error(error.response?.data?.message || 'Ошибка при сохранении инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(inventoryItems.length / itemsPerPage);
  const paginatedItems = inventoryItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
      <ToastContainer position="top-center" />
      <div className="flex flex-col gap-y-5">
        <h1 className="text-2xl font-bold text-gray-800">Системная инвентаризация</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Выберите склад</label>
            <div className="relative">
              <button
                onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
                className={`w-full p-2 border rounded-lg bg-white text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading || (inventoryId && inventoryStatus === 'IN_PROGRESS')
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
                disabled={loading || (inventoryId && inventoryStatus === 'IN_PROGRESS')}
              >
                {selectedWarehouse
                  ? warehouses.find((w) => w.id === parseInt(selectedWarehouse))?.name ||
                    'Выберите склад'
                  : 'Выберите склад'}
              </button>
              {isWarehouseDropdownOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {warehouses.length > 0 ? (
                    warehouses.map((warehouse) => (
                      <li
                        key={warehouse.id}
                        onClick={() =>
                          !processedWarehouseIds.includes(String(warehouse.id)) &&
                          handleWarehouseSelect(warehouse.id.toString())
                        }
                        className={`p-2 cursor-pointer text-gray-700 ${
                          processedWarehouseIds.includes(String(warehouse.id))
                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                            : 'hover:bg-blue-100'
                        }`}
                      >
                        {warehouse.name}
                        {processedWarehouseIds.includes(String(warehouse.id)) && ' (проверено)'}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-gray-500">Склады отсутствуют</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Выберите зоны</label>
            <Select
              isMulti
              options={zoneOptions}
              value={zoneOptions.filter((option) => selectedZones.includes(option.value))}
              onChange={handleZoneChange}
              placeholder="Выберите зоны..."
              isDisabled={loading || !selectedWarehouse}
              noOptionsMessage={() => 'Зоны отсутствуют'}
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  padding: '2px',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#3b82f6' },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 1000,
                }),
                option: (base, { isDisabled }) => ({
                  ...base,
                  backgroundColor: isDisabled ? '#f3f4f6' : base.backgroundColor,
                  color: isDisabled ? '#9ca3af' : base.color,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }),
              }}
            />
            {selectedZones.length > 0 && (
              <button
                onClick={handleClearZones}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Очистить все зоны
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700">Выбранные зоны:</h3>
          {selectedZones.length > 0 ? (
            <ul className="flex flex-wrap gap-2 mt-2">
              {selectedZones
                .filter((zoneId) => !processedZoneIds.includes(zoneId))
                .map((zoneId) => (
                  <li
                    key={zoneId}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 p-2 rounded-full text-sm"
                  >
                    {zones.find((z) => z.id === parseInt(zoneId))?.name || zoneId}
                    <button
                      onClick={() =>
                        handleZoneChange(
                          zoneOptions.filter(
                            (option) =>
                              selectedZones.includes(option.value) &&
                              option.value !== zoneId &&
                              !processedZoneIds.includes(option.value)
                          )
                        )
                      }
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">Зоны не выбраны</p>
          )}
        </div>

        <div className="flex gap-4">
          {!inventoryId && (
            <button
              onClick={handleStartInventory}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors w-48"
              disabled={!selectedWarehouse || loading}
            >
              Начать инвентаризацию
            </button>
          )}
          {inventoryId && inventoryStatus === 'COMPLETED' && (
            <ConfirmationWrapper
              title="Сброс текущей инвентаризации"
              message="Вы уверены, что хотите сбросить текущую инвентаризацию и начать новую?"
              onConfirm={handleResetInventory}
            >
              <button
                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400 transition-colors w-48"
                disabled={loading}
              >
                Сбросить инвентаризацию
              </button>
            </ConfirmationWrapper>
          )}
        </div>

        {loading ? (
          <div className="text-center text-lg text-gray-600">Загрузка...</div>
        ) : inventoryItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4 min-w-max">
              <thead className="text-gray-500 bg-gray-100 h-12 sticky top-0 z-10">
                <tr className="text-sm">
                  <th className="text-left px-2">Номенклатура</th>
                  <th className="text-left px-2">Ед. измерения</th>
                  <th className="text-left px-2">Код</th>
                  <th className="text-left px-2">Зона</th>
                  <th className="text-left px-2">Контейнер</th>
                  <th className="text-left px-2">Количество</th>
                  <th className="text-left px-2">Фактическое количество</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-3 px-2">{item.nomenclatureName}</td>
                    <td className="py-3 px-2">{item.measurementUnit}</td>
                    <td className="py-3 px-2">{item.code}</td>
                    <td className="py-3 px-2">
                      {zones.find((z) => z.id === item.warehouseZoneId)?.name ||
                        item.warehouseZoneId}
                    </td>
                    <td className="py-3 px-2">
                      {item.warehouseContainerSerial || 'Без контейнера'}
                    </td>
                    <td className="py-3 px-2">{item.quantity.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.actualQuantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            (currentPage - 1) * itemsPerPage + index,
                            e.target.value.replace(',', '.')
                          )
                        }
                        className="p-1 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-200"
              >
                Назад
              </button>
              <span>
                Страница {currentPage} из {totalPages} (Всего: {inventoryItems.length} записей)
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-200"
              >
                Вперед
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Товары отсутствуют</div>
        )}

        {inventoryId && inventoryStatus === 'IN_PROGRESS' && (
          <ConfirmationWrapper
            title="Подтверждение завершения системной инвентаризации"
            message="Вы уверены, что хотите завершить системную инвентаризацию? Все данные будут сохранены."
            onConfirm={handleSubmitInventory}
          >
            <button
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors w-48"
              disabled={loading || inventoryItems.length === 0}
            >
              Завершить инвентаризацию
            </button>
          </ConfirmationWrapper>
        )}
      </div>
    </div>
  );
};

export default SystemInventoryCheckPage;