import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
// Исправленный вариант:
import { 
  addItem, 
  removeItem, 
  updateItem, 
  setItems 
} from '../../../store/slices/main-operation-slice/incoming/itemsSlice';

import { 
  setNomenclatures,
  setWarehouses,
  setZonesForWarehouse,
  setContainersForZone,
  setSuppliers
} from '../../../store/slices/main-operation-slice/incoming/incomingCacheSlice';

import { FaPlus, FaTrash, FaCheckCircle, FaSpinner, FaEye } from 'react-icons/fa';
import Notification from "../../../components/notification/Notification";
import {
  API_GET_ALL_WAREHOUSES,
  API_GET_ALL_SUPPLIERS,
  API_GET_ALL_NOMENCLATURES,
  API_GET_WAREHOUSE_ZONES_BY_ID,
  API_GET_CONTAINERS_BY_ZONE,
  API_PROCESS_INCOMING_GOODS
} from '../../../api/API';

const IncomingRequestPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);
  const items = useSelector((state) => state.items.items);
  const {
    nomenclatures,
    warehouses,
    zonesByWarehouse,
    containersByZone,
    suppliers
  } = useSelector((state) => state.incomingCache);
  const dispatch = useDispatch();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      documentNumber: "",
      documentDate: "",
      supplierId: "",
      tnvedCode: "",
    },
  });

  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nomenclaturesLoaded, setNomenclaturesLoaded] = useState(false);

  // Загрузка складов и поставщиков при монтировании
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [warehousesRes, suppliersRes] = await Promise.all([
          axios.get(API_GET_ALL_WAREHOUSES, { headers: { "Auth-token": authToken } }),
          axios.get(API_GET_ALL_SUPPLIERS, { headers: { "Auth-token": authToken } })
        ]);
        dispatch(setWarehouses(warehousesRes.data.body));
        dispatch(setSuppliers(suppliersRes.data.body));
      } catch (error) {
        toast.error(error.response?.data?.message || "Ошибка загрузки данных");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Загружаем только если данных нет в хранилище
    if (warehouses.length === 0 || suppliers.length === 0) {
      fetchInitialData();
    }
  }, [authToken, dispatch, warehouses.length, suppliers.length]);

  // Функция загрузки номенклатур по кнопке
  const fetchNomenclatures = async () => {
    if (nomenclaturesLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get(API_GET_ALL_NOMENCLATURES, {
        headers: { "Auth-token": authToken },
      });
      dispatch(setNomenclatures(response.data.body));
      setNomenclaturesLoaded(true);
      toast.success("Номенклатуры успешно загружены");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки номенклатур");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZonesForWarehouse = useCallback(async (warehouseId) => {
    if (zonesByWarehouse[warehouseId]) return;
    try {
      const response = await axios.get(
        API_GET_WAREHOUSE_ZONES_BY_ID.replace("{warehouseId}", warehouseId), 
        { headers: { "Auth-token": authToken } }
      );
      dispatch(setZonesForWarehouse({ warehouseId, zones: response.data.body }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки зон");
    }
  }, [authToken, zonesByWarehouse, dispatch]);

  const fetchContainersForZone = useCallback(async (zoneId) => {
    if (containersByZone[zoneId]) return;
    try {
      const response = await axios.get(
        API_GET_CONTAINERS_BY_ZONE.replace("{zoneId}", zoneId), 
        { headers: { "Auth-token": authToken } }
      );
      dispatch(setContainersForZone({ zoneId, containers: response.data.body }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки контейнеров");
    }
  }, [authToken, containersByZone, dispatch]);

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
  };

  const handleRemoveItem = (index) => dispatch(removeItem(index));

  const handleItemChange = useCallback((index, field, value) => {
    dispatch(updateItem({ index, field, value }));
  }, [dispatch]);

  const handleNomenclatureChange = useCallback((index, selectedOption) => {
    if (selectedOption) {
      const { value, label, measurement } = selectedOption;
      handleItemChange(index, "nomenclatureId", value);
      handleItemChange(index, "nomenclatureName", label);
      handleItemChange(index, "measurementUnit", measurement);
    } else {
      handleItemChange(index, "nomenclatureId", "");
      handleItemChange(index, "nomenclatureName", "");
      handleItemChange(index, "measurementUnit", "");
    }
  }, [handleItemChange]);

  const handleWarehouseChange = useCallback(async (index, selectedOption) => {
    const warehouseId = selectedOption ? selectedOption.value : "";
    handleItemChange(index, "warehouseId", warehouseId);
    handleItemChange(index, "zoneId", "");
    handleItemChange(index, "containerId", "");
    if (warehouseId) await fetchZonesForWarehouse(warehouseId);
  }, [handleItemChange, fetchZonesForWarehouse]);

  const handleZoneChange = useCallback(async (index, selectedOption) => {
    const zoneId = selectedOption ? selectedOption.value : "";
    handleItemChange(index, "zoneId", zoneId);
    handleItemChange(index, "containerId", "");
    if (zoneId) await fetchContainersForZone(zoneId);
  }, [handleItemChange, fetchContainersForZone]);

  const handleContainerChange = useCallback((index, selectedOption) => {
    handleItemChange(index, "containerId", selectedOption ? selectedOption.value : "");
  }, [handleItemChange]);

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Добавьте хотя бы один товар");
      return;
    }

    const invalidItems = items.some(item => !item.nomenclatureId || !item.warehouseId || !item.zoneId || !item.quantity);
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
        items: items.map(item => ({
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
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при создании заявки");
    } finally {
      setIsLoading(false);
    }
  };

  const supplierOptions = useMemo(() => suppliers.map(s => ({ value: s.id, label: s.name })), [suppliers]);
  const nomenclatureSelectOptions = useMemo(() => nomenclatures.map(n => ({
    value: n.id,
    label: n.name,
    measurement: n.measurement,
    details: `Ед. изм.: ${n.measurement} | ${n.length} x ${n.height} x ${n.width} | ${n.value}`,
  })), [nomenclatures]);
  const warehouseOptions = useMemo(() => warehouses.map(w => ({ value: w.id, label: w.name })), [warehouses]);
  const getZoneOptions = useCallback((warehouseId) => 
    zonesByWarehouse[warehouseId]?.map(z => ({
      value: z.id,
      label: `${z.name} (Свободно: ${z.capacity})`,
    })) || [], 
  [zonesByWarehouse]);
  const getContainerOptions = useCallback((zoneId) => 
    containersByZone[zoneId]?.map(c => ({
      value: c.id,
      label: `${c.serialNumber} (Доступно: ${c.capacity})`,
    })) || [], 
  [containersByZone]);

  return (
    <div className="p-4 w-full bg-main-light-gray rounded-lg shadow-md space-y-4">
      {requestSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-2">
            <FaCheckCircle className="text-green-500 text-3xl" />
            <h2 className="text-lg font-semibold text-main-dull-gray">Заявка успешно создана</h2>
            <p className="text-sm text-gray-500">Форма очистится через 2 сек.</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <FaSpinner className="animate-spin text-main-dull-gray" />
            <span className="text-main-dull-gray">Загрузка...</span>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-main-dull-gray text-center">
        Новая заявка на оприходование
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-main-dull-gray mb-2">Основные данные</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">Номер документа *</label>
              <input
                {...register("documentNumber", { required: "Поле обязательно" })}
                className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                placeholder="INV-2025-001"
                disabled={isLoading}
              />
              {errors.documentNumber && <p className="text-red-500 text-xs">{errors.documentNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">Дата документа *</label>
              <input
                type="date"
                {...register("documentDate", { required: "Поле обязательно" })}
                className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                disabled={isLoading}
              />
              {errors.documentDate && <p className="text-red-500 text-xs">{errors.documentDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">Поставщик *</label>
              <Controller
                name="supplierId"
                control={control}
                rules={{ required: "Поле обязательно" }}
                render={({ field }) => (
                  <Select
                    options={supplierOptions}
                    value={supplierOptions.find(option => option.value === field.value)}
                    onChange={(option) => field.onChange(option ? option.value : "")}
                    placeholder="Выберите поставщика"
                    isClearable
                    isDisabled={isLoading}
                    className="text-sm"
                  />
                )}
              />
              {errors.supplierId && <p className="text-red-500 text-xs">{errors.supplierId.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">Код ТН ВЭД</label>
              <input
                {...register("tnvedCode")}
                className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                placeholder="Необязательно"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-main-dull-gray">Список товаров</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchNomenclatures}
                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                disabled={isLoading || nomenclaturesLoaded}
              >
                <FaEye className="mr-1" /> {nomenclaturesLoaded ? "Номенклатуры загружены" : "Просмотреть номенклатуры"}
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                disabled={isLoading || !nomenclaturesLoaded}
              >
                <FaPlus className="mr-1" /> Добавить
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-4 bg-white rounded-lg shadow-md text-sm text-main-dull-gray">
              {nomenclaturesLoaded ? "Добавьте товары для оприходования" : "Загрузите номенклатуры, чтобы добавить товары"}
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-main-dull-blue font-medium mb-1">Номенклатура *</label>
                  <Select
                    options={nomenclatureSelectOptions}
                    value={nomenclatureSelectOptions.find(o => o.value === item.nomenclatureId)}
                    onChange={(option) => handleNomenclatureChange(index, option)}
                    placeholder="Выберите товар"
                    isClearable
                    isDisabled={isLoading}
                    formatOptionLabel={({ label, details }) => (
                      <div>
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-gray-500 block">{details}</span>
                      </div>
                    )}
                    className="text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-sm text-main-dull-blue font-medium mb-1">Количество *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm text-main-dull-blue font-medium mb-1">Склад *</label>
                  <Select
                    options={warehouseOptions}
                    value={warehouseOptions.find(o => o.value === item.warehouseId)}
                    onChange={(option) => handleWarehouseChange(index, option)}
                    placeholder="Выберите склад"
                    isClearable
                    isDisabled={isLoading}
                    className="text-sm"
                  />
                </div>
                {item.warehouseId && (
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm text-main-dull-blue font-medium mb-1">Зона *</label>
                    <Select
                      options={getZoneOptions(item.warehouseId)}
                      value={getZoneOptions(item.warehouseId).find(o => o.value === item.zoneId)}
                      onChange={(option) => handleZoneChange(index, option)}
                      placeholder="Выберите зону"
                      isClearable
                      isDisabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                )}
                {item.zoneId && (
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm text-main-dull-blue font-medium mb-1">Контейнер</label>
                    <Select
                      options={getContainerOptions(item.zoneId)}
                      value={getContainerOptions(item.zoneId).find(o => o.value === item.containerId)}
                      onChange={(option) => handleContainerChange(index, option)}
                      placeholder="Необязательно"
                      isClearable
                      isDisabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-sm text-main-dull-blue">
                    <input
                      type="checkbox"
                      checked={item.returnable}
                      onChange={(e) => handleItemChange(index, "returnable", e.target.checked)}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    Возвратная
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Удалить"
                    disabled={isLoading}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || items.length === 0}
            className={`flex items-center px-4 py-2 bg-main-dull-blue text-white text-sm rounded-md hover:bg-main-purp-dark transition ${
              isLoading || items.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-1" />
                Создание...
              </>
            ) : (
              "Создать заявку"
            )}
          </button>
        </div>
        <Notification/>
      </form>
    </div>
  );
};

export default IncomingRequestPage;