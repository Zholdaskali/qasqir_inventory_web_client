import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { addItem, removeItem, updateItem, setItems } from '../../../store/slices/operationSlice/itemsSlice';
import { FaPlus, FaTrash, FaCheckCircle, FaSpinner, FaEye } from 'react-icons/fa';
import Notification from "../../../components/notification/Notification";
import debounce from "lodash/debounce";
import {
  API_GET_WAREHOUSE_LIST,
  API_GET_ALL_SUPPLIERS,
  API_GET_ALL_NOMENCLATURES,
  API_GET_WAREHOUSE_ZONES_BY_ID,
  API_GET_CONTAINERS_BY_ZONE,
  API_PROCESS_INCOMING_GOODS,
} from "../../../api/API";

const ITEMS_PER_PAGE = 10;

const IncomingRequestPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);
  const items = useSelector((state) => state.items.items);
  const dispatch = useDispatch();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      documentNumber: "",
      documentDate: "",
      supplierId: "",
      tnvedCode: "",
    },
  });

  const [nomenclatureOptions, setNomenclatureOptions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [zonesByWarehouse, setZonesByWarehouse] = useState({});
  const [containersByZone, setContainersByZone] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nomenclaturesLoaded, setNomenclaturesLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [warehousesRes, suppliersRes] = await Promise.all([
          axios.get(API_GET_WAREHOUSE_LIST, { headers: { "Auth-token": authToken } }),
          axios.get(API_GET_ALL_SUPPLIERS, { headers: { "Auth-token": authToken } }),
        ]);
        setWarehouses(warehousesRes.data.body);
        setSuppliers(suppliersRes.data.body);
      } catch (error) {
        toast.error(error.response?.data?.message || "Ошибка загрузки начальных данных");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [authToken]);

  const fetchNomenclatures = async () => {
    if (nomenclaturesLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get(API_GET_ALL_NOMENCLATURES, {
        headers: { "Auth-token": authToken },
      });
      setNomenclatureOptions(response.data.body);
      setNomenclaturesLoaded(true);
      toast.success("Номенклатуры успешно загружены");
    } catch (error) {
      toast.error("Ошибка загрузки номенклатур");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZonesForWarehouse = useCallback(async (warehouseId) => {
    if (zonesByWarehouse[warehouseId]) return;
    try {
      const response = await axios.get(
        `${API_GET_WAREHOUSE_ZONES_BY_ID.replace("{warehouseId}", warehouseId)}`,
        { headers: { "Auth-token": authToken } }
      );
      setZonesByWarehouse((prev) => ({ ...prev, [warehouseId]: response.data.body }));
    } catch (error) {
      toast.error("Ошибка загрузки зон");
    }
  }, [authToken, zonesByWarehouse]);

  const fetchContainersForZone = useCallback(async (zoneId) => {
    if (containersByZone[zoneId]) return;
    try {
      const response = await axios.get(
        `${API_GET_CONTAINERS_BY_ZONE.replace("{zoneId}", zoneId)}`,
        { headers: { "Auth-token": authToken } }
      );
      setContainersByZone((prev) => ({ ...prev, [zoneId]: response.data.body }));
    } catch (error) {
      toast.error("Ошибка загрузки контейнеров");
    }
  }, [authToken, containersByZone]);

  const handleAddItem = () => {
    dispatch(addItem({
      nomenclatureId: "",
      nomenclatureName: "",
      quantity: 1,
      measurementUnit: "",
      warehouseId: "",
      zoneId: "",
      containerId: "",
      returnable: false,
    }));
    setCurrentPage(Math.ceil((items.length + 1) / ITEMS_PER_PAGE));
  };

  const handleRemoveItem = (index) => {
    dispatch(removeItem(index));
    if (items.length % ITEMS_PER_PAGE === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const debouncedHandleItemChange = useMemo(
    () => debounce((index, field, value) => {
      dispatch(updateItem({ index, field, value }));
    }, 300),
    [dispatch]
  );

  const handleNomenclatureChange = useCallback((index, selectedOption) => {
    if (selectedOption) {
      const { value, label, measurement } = selectedOption;
      debouncedHandleItemChange(index, "nomenclatureId", value);
      debouncedHandleItemChange(index, "nomenclatureName", label);
      debouncedHandleItemChange(index, "measurementUnit", measurement);
    } else {
      debouncedHandleItemChange(index, "nomenclatureId", "");
      debouncedHandleItemChange(index, "nomenclatureName", "");
      debouncedHandleItemChange(index, "measurementUnit", "");
    }
  }, [debouncedHandleItemChange]);

  const handleWarehouseChange = useCallback(async (index, selectedOption) => {
    const warehouseId = selectedOption ? selectedOption.value : "";
    debouncedHandleItemChange(index, "warehouseId", warehouseId);
    debouncedHandleItemChange(index, "zoneId", "");
    debouncedHandleItemChange(index, "containerId", "");
    if (warehouseId) await fetchZonesForWarehouse(warehouseId);
  }, [debouncedHandleItemChange, fetchZonesForWarehouse]);

  const handleZoneChange = useCallback(async (index, selectedOption) => {
    const zoneId = selectedOption ? selectedOption.value : "";
    debouncedHandleItemChange(index, "zoneId", zoneId);
    debouncedHandleItemChange(index, "containerId", "");
    if (zoneId) await fetchContainersForZone(zoneId);
  }, [debouncedHandleItemChange, fetchContainersForZone]);

  const handleContainerChange = useCallback((index, selectedOption) => {
    debouncedHandleItemChange(index, "containerId", selectedOption ? selectedOption.value : "");
  }, [debouncedHandleItemChange]);

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Добавьте хотя бы один товар");
      return;
    }

    const invalidItems = items.some((item) => !item.nomenclatureId || !item.warehouseId || !item.zoneId || !item.quantity);
    if (invalidItems) {
      toast.error("Все обязательные поля для товаров должны быть заполнены");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        documentType: "INCOMING",
        documentNumber: data.documentNumber,
        documentDate: data.documentDate,
        supplierId: parseInt(data.supplierId, 10),
        tnvedCode: data.tnvedCode || null,
        items: items.map((item) => ({
          nomenclatureId: parseInt(item.nomenclatureId, 10),
          quantity: parseFloat(item.quantity),
          warehouseZoneId: parseInt(item.zoneId, 10),
          containerId: item.containerId ? parseInt(item.containerId, 10) : null,
          returnable: item.returnable,
        })),
        createdBy: userId,
      };
      const response = await axios.post(API_PROCESS_INCOMING_GOODS, payload, {
        headers: { "Auth-token": authToken },
      });
      toast.success(response?.data?.message || "Заявка успешно создана");
      setRequestSuccess(true);
      setTimeout(() => {
        setRequestSuccess(false);
        dispatch(setItems([]));
        setCurrentPage(1);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при создании заявки");
    } finally {
      setIsLoading(false);
    }
  };

  const supplierOptions = useMemo(() => suppliers.map((s) => ({ value: s.id, label: s.name })), [suppliers]);
  const nomenclatureSelectOptions = useMemo(() => nomenclatureOptions.map((n) => ({
    value: n.id,
    label: n.name,
    measurement: n.measurement,
    details: `Ед.изм: ${n.measurement} | ${n.length}x${n.height}x${n.width}`,
  })), [nomenclatureOptions]);
  const warehouseOptions = useMemo(() => warehouses.map((w) => ({ value: w.id, label: w.name })), [warehouses]);
  const getZoneOptions = useCallback((warehouseId) => 
    zonesByWarehouse[warehouseId]?.map((z) => ({
      value: z.id,
      label: `${z.name} (${z.capacity})`,
    })) || [], 
  [zonesByWarehouse]);
  const getContainerOptions = useCallback((zoneId) => 
    containersByZone[zoneId]?.map((c) => ({
      value: c.id,
      label: `${c.serialNumber} (${c.capacity})`,
    })) || [], 
  [containersByZone]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage]);

  return (
    <div className="w-full h-full p-2 md:p-4 lg:p-6 rounded-lg overflow-auto bg-gray-100">
      {requestSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center gap-1">
            <FaCheckCircle className="text-green-500 text-xl" />
            <h2 className="text-base font-semibold text-gray-800">Заявка создана</h2>
            <p className="text-xs text-gray-500">Очистка через 2 сек.</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-2 rounded-lg shadow-lg flex items-center gap-1">
            <FaSpinner className="animate-spin text-gray-600 text-sm" />
            <span className="text-gray-600 text-sm">Загрузка...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-y-3">
        <h1 className="text-xl font-bold text-gray-800">Новая заявка</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <h3 className="text-base font-medium text-gray-700 mb-2">Данные</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Номер *</label>
                <input
                  {...register("documentNumber", { required: "Обязательно" })}
                  className="w-full p-1 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="INV-2025-001"
                  disabled={isLoading}
                />
                {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Дата *</label>
                <input
                  type="date"
                  {...register("documentDate", { required: "Обязательно" })}
                  className="w-full p-1 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isLoading}
                />
                {errors.documentDate && <p className="text-red-500 text-xs mt-1">{errors.documentDate.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Поставщик *</label>
                <Controller
                  name="supplierId"
                  control={control}
                  rules={{ required: "Обязательно" }}
                  render={({ field }) => (
                    <Select
                      options={supplierOptions}
                      value={supplierOptions.find((option) => option.value === field.value)}
                      onChange={(option) => field.onChange(option ? option.value : "")}
                      placeholder="Выберите"
                      isClearable
                      isDisabled={isLoading}
                      className="text-xs"
                      styles={{ control: (base) => ({ ...base, minHeight: '28px', height: '28px' }), singleValue: (base) => ({ ...base, fontSize: '12px' }), input: (base) => ({ ...base, fontSize: '12px' }) }}
                    />
                  )}
                />
                {errors.supplierId && <p className="text-red-500 text-xs mt-1">{errors.supplierId.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium text-gray-700">Товары ({items.length})</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={fetchNomenclatures}
                  className="flex items-center p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={isLoading || nomenclaturesLoaded}
                >
                  <FaEye className="mr-1 text-xs" /> {nomenclaturesLoaded ? "Загружено" : "Номенклатуры"}
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center p-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-400"
                  disabled={isLoading || !nomenclaturesLoaded}
                >
                  <FaPlus className="mr-1 text-xs" /> Добавить
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-2 bg-white rounded-lg shadow-sm text-gray-500 text-sm">
                {nomenclaturesLoaded ? "Добавьте товары" : "Загрузите номенклатуры"}
              </div>
            ) : (
              <>
                {paginatedItems.map((item, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  return (
                    <div key={globalIndex} className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Номенклатура *</label>
                        <Select
                          options={nomenclatureSelectOptions}
                          value={nomenclatureSelectOptions.find((o) => o.value === item.nomenclatureId)}
                          onChange={(option) => handleNomenclatureChange(globalIndex, option)}
                          placeholder="Товар"
                          isClearable
                          isDisabled={isLoading}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: '28px', height: '28px' }), singleValue: (base) => ({ ...base, fontSize: '12px' }), input: (base) => ({ ...base, fontSize: '12px' }) }}
                        />
                      </div>
                      <div className="flex-1 min-w-[80px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Кол-во *</label>
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          className="w-full p-1 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          value={item.quantity}
                          onChange={(e) => debouncedHandleItemChange(globalIndex, "quantity", e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Склад *</label>
                        <Select
                          options={warehouseOptions}
                          value={warehouseOptions.find((o) => o.value === item.warehouseId)}
                          onChange={(option) => handleWarehouseChange(globalIndex, option)}
                          placeholder="Склад"
                          isClearable
                          isDisabled={isLoading}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: '28px', height: '28px' }), singleValue: (base) => ({ ...base, fontSize: '12px' }), input: (base) => ({ ...base, fontSize: '12px' }) }}
                        />
                      </div>
                      {item.warehouseId && (
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Зона *</label>
                          <Select
                            options={getZoneOptions(item.warehouseId)}
                            value={getZoneOptions(item.warehouseId).find((o) => o.value === item.zoneId)}
                            onChange={(option) => handleZoneChange(globalIndex, option)}
                            placeholder="Зона"
                            isClearable
                            isDisabled={isLoading}
                            className="text-xs"
                            styles={{ control: (base) => ({ ...base, minHeight: '28px', height: '28px' }), singleValue: (base) => ({ ...base, fontSize: '12px' }), input: (base) => ({ ...base, fontSize: '12px' }) }}
                          />
                        </div>
                      )}
                      {item.zoneId && (
                        <div className="flex-1 min-w-[100px]">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Контейнер</label>
                          <Select
                            options={getContainerOptions(item.zoneId)}
                            value={getContainerOptions(item.zoneId).find((o) => o.value === item.containerId)}
                            onChange={(option) => handleContainerChange(globalIndex, option)}
                            placeholder="Контейнер"
                            isClearable
                            isDisabled={isLoading}
                            className="text-xs"
                            styles={{ control: (base) => ({ ...base, minHeight: '28px', height: '28px' }), singleValue: (base) => ({ ...base, fontSize: '12px' }), input: (base) => ({ ...base, fontSize: '12px' }) }}
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(globalIndex)}
                        className="text-red-500 hover:text-red-700 transition p-1"
                        title="Удалить"
                        disabled={isLoading}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1 bg-gray-300 rounded text-xs hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Назад
                  </button>
                  <span className="text-xs">
                    Страница {currentPage} из {totalPages} (Всего: {items.length})
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1 bg-gray-300 rounded text-xs hover:bg-gray-400 disabled:bg-gray-200"
                  >
                    Вперед
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="p-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 w-32 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-1 text-xs" />
                  Создание...
                </>
              ) : (
                "Создать"
              )}
            </button>
          </div>
          <Notification />
        </form>
      </div>
    </div>
  );
};

export default IncomingRequestPage;