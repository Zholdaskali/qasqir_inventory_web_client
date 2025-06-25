import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import {
  addItem,
  removeItem,
  updateItem,
  setItems,
} from "../../../store/slices/main-operation-slice/incoming/itemsSlice";
import {
  setNomenclatures,
  setWarehouses,
  setZonesForWarehouse,
  setContainersForZone,
  setSuppliers,
} from "../../../store/slices/main-operation-slice/incoming/incomingCacheSlice";
import { FaPlus, FaTrash, FaCheckCircle, FaSpinner, FaEye, FaUpload } from "react-icons/fa";
import Notification from "../../../components/notification/Notification";
import UploadFileModal from "../../../components/modal-components/UploadFileModal";
import {
  API_GET_ALL_WAREHOUSES,
  API_GET_ALL_SUPPLIERS,
  API_GET_ALL_NOMENCLATURES,
  API_GET_WAREHOUSE_ZONES_BY_ID,
  API_GET_CONTAINERS_BY_ZONE,
  API_PROCESS_INCOMING_GOODS,
} from "../../../api/API";

// CapacityHint component
const CapacityHint = ({ status, message }) => {
  const getStyles = () => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700 border-green-300";
      case "error":
        return "bg-red-100 text-red-700 border-red-300";
      case "neutral":
        return "bg-gray-100 text-gray-600 border-gray-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  return (
    <div
      className={`inline-block px-3 py-1 rounded-md border text-xs font-medium ${getStyles()}`}
    >
      {message}
    </div>
  );
};

const IncomingRequestPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);
  const items = useSelector((state) => state.items.items);
  const { nomenclatures, warehouses, zonesByWarehouse, containersByZone, suppliers } =
    useSelector((state) => state.incomingCache);
  const dispatch = useDispatch();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      documentNumber: "",
      documentDate: "",
      supplierId: "",
    },
  });

  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nomenclaturesLoaded, setNomenclaturesLoaded] = useState(false);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch initial data (warehouses and suppliers)
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [warehousesRes, suppliersRes] = await Promise.all([
          axios.get(API_GET_ALL_WAREHOUSES, { headers: { "Auth-token": authToken } }),
          axios.get(API_GET_ALL_SUPPLIERS, { headers: { "Auth-token": authToken } }),
        ]);
        dispatch(setWarehouses(warehousesRes.data.body));
        dispatch(setSuppliers(suppliersRes.data.body));
      } catch (error) {
        toast.error(error.response?.data?.message || "Ошибка загрузки данных");
        console.error("Ошибка загрузки начальных данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (warehouses.length === 0 || suppliers.length === 0) {
      fetchInitialData();
    }
  }, [authToken, dispatch, warehouses.length, suppliers.length]);

  // Fetch nomenclatures
  const fetchNomenclatures = async () => {
    if (nomenclaturesLoaded) return;
    setIsLoading(true);
    try {
      const response = await axios.get(API_GET_ALL_NOMENCLATURES, {
        headers: { "Auth-token": authToken },
      });
      const nomenclaturesData = response.data.body || [];
      // Валидация данных номенклатур
      const validNomenclatures = nomenclaturesData.filter(n => n.measurement && (n.volume != null || (n.length != null && n.width != null && n.height != null)));
      if (validNomenclatures.length < nomenclaturesData.length) {
        toast.warn("Некоторые номенклатуры исключены из-за отсутствия единицы измерения или размеров");
      }
      dispatch(setNomenclatures(validNomenclatures));
      setNomenclaturesLoaded(true);
      toast.success("Номенклатуры успешно загружены");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки номенклатур");
      console.error("Ошибка загрузки номенклатур:", error);
      setNomenclaturesLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZonesForWarehouse = useCallback(
    async (warehouseId) => {
      if (zonesByWarehouse[warehouseId]) return;
      try {
        const response = await axios.get(
          API_GET_WAREHOUSE_ZONES_BY_ID.replace("{warehouseId}", warehouseId),
          { headers: { "Auth-token": authToken } }
        );
        dispatch(setZonesForWarehouse({ warehouseId, zones: response.data.body }));
      } catch (error) {
        toast.error(error.response?.data?.message || "Ошибка загрузки зон");
        console.error("Ошибка загрузки зон:", error);
      }
    },
    [authToken, zonesByWarehouse, dispatch]
  );

  const fetchContainersForZone = useCallback(
    async (zoneId) => {
      if (containersByZone[zoneId]) return;
      try {
        const response = await axios.get(
          API_GET_CONTAINERS_BY_ZONE.replace("{zoneId}", zoneId),
          { headers: { "Auth-token": authToken } }
        );
        dispatch(setContainersForZone({ zoneId, containers: response.data.body }));
      } catch (error) {
        toast.error(error.response?.data?.message || "Ошибка загрузки контейнеров");
        console.error("Ошибка загрузки контейнеров:", error);
      }
    },
    [authToken, containersByZone, dispatch]
  );

  const handleAddItem = () => {
    try {
      dispatch(
        addItem({
          nomenclatureId: "",
          nomenclatureName: "",
          quantity: 1,
          measurementUnit: null,
          warehouseId: "",
          zoneId: "",
          containerId: "",
          returnable: false,
        })
      );
      toast.success("Товар успешно добавлен");
    } catch (error) {
      console.error("Ошибка при добавлении товара:", error);
      toast.error("Не удалось добавить");
    }
  };

  const handleRemoveItem = useCallback((index) => {
    dispatch(removeItem(index));
    toast.success("Товар удален");
  }, [dispatch]);

  const handleItemChange = useCallback(
    (index, field, value) => {
      dispatch(updateItem({ index, field, value }));
    },
    [dispatch]
  );

  const handleNomenclatureChange = useCallback(
    (index, selectedOption) => {
      if (selectedOption) {
        const { value, label, measurement } = selectedOption;
        if (!measurement) {
          toast.error("У выбранной номенклатуры отсутствует единица измерения");
          return;
        }
        handleItemChange(index, "nomenclatureId", value);
        handleItemChange(index, "nomenclatureName", label);
        handleItemChange(index, "measurementUnit", measurement);
      } else {
        handleItemChange(index, "nomenclatureId", "");
        handleItemChange(index, "nomenclatureName", "");
        handleItemChange(index, "measurementUnit", "");
      }
    },
    [handleItemChange]
  );

  const handleWarehouseChange = useCallback(
    async (index, selectedOption) => {
      const warehouseId = selectedOption ? selectedOption.value : "";
      handleItemChange(index, "warehouseId", warehouseId);
      handleItemChange(index, "zoneId", "");
      handleItemChange(index, "containerId", "");
      if (warehouseId) await fetchZonesForWarehouse(warehouseId);
    },
    [handleItemChange, fetchZonesForWarehouse]
  );

  const handleZoneChange = useCallback(
    async (index, selectedOption) => {
      const zoneId = selectedOption ? selectedOption.value : "";
      handleItemChange(index, "zoneId", zoneId);
      handleItemChange(index, "containerId", "");
      if (zoneId) await fetchContainersForZone(zoneId);
    },
    [handleItemChange, fetchContainersForZone]
  );

  const handleContainerChange = useCallback(
    (index, selectedOption) => {
      handleItemChange(index, "containerId", selectedOption ? selectedOption.value : "");
    },
    [handleItemChange]
  );

  const calculateNomenclatureVolume = (nomenclatureId, quantity) => {
    const nomenclature = nomenclatures.find((n) => n.id === nomenclatureId);
    if (!nomenclature || !quantity) {
      console.log(`No nomenclature or quantity for ID: ${nomenclatureId}`);
      return 0;
    }

    // Проверка габаритов в метрах с валидацией минимальных значений
    if (nomenclature.volume != null) {
      console.log(`Using volume: ${nomenclature.volume} * ${quantity}`);
      return nomenclature.volume * quantity;
    }

    if (
      nomenclature.length != null &&
      nomenclature.width != null &&
      nomenclature.height != null &&
      nomenclature.length > 0 &&
      nomenclature.width > 0 &&
      nomenclature.height > 0
    ) {
      const volumePerUnit = nomenclature.length * nomenclature.width * nomenclature.height;
      console.log(`Calculated volume: ${volumePerUnit} * ${quantity}`);
      return volumePerUnit * quantity;
    }

    console.log(`No valid volume or dimensions for nomenclature ID: ${nomenclatureId}`);
    return 0;
  };

  const getCapacityHint = (item) => {
    const totalVolume = calculateNomenclatureVolume(item.nomenclatureId, parseFloat(item.quantity || 0));
    let zoneHint = { status: "neutral", message: "Выберите зону" };
    let containerHint = item.zoneId ? { status: "neutral", message: "Контейнер не выбран" } : null;

    if (item.warehouseId && item.zoneId && !item.containerId) {
      const zone = zonesByWarehouse[item.warehouseId]?.find((z) => z.id === item.zoneId);
      if (!zone || !totalVolume) {
        zoneHint = { status: "neutral", message: "Данные о зоне недоступны" };
      } else {
        const freeCapacity = zone.capacity;
        if (totalVolume <= freeCapacity) {
          zoneHint = {
            status: "success",
            message: `Помещается в зону (${totalVolume.toFixed(3)} м³ из ${freeCapacity.toFixed(3)} м³)`,
          };
        } else {
          const excess = (totalVolume - freeCapacity).toFixed(3);
          zoneHint = {
            status: "error",
            message: `Не помещается: превышение на ${excess} м³`,
          };
        }
      }
    } else if (item.warehouseId) {
      zoneHint = { status: "neutral", message: "Выберите зону" };
    }

    if (item.zoneId && item.containerId) {
      const container = containersByZone[item.zoneId]?.find((c) => c.id === item.containerId);
      if (!container || !totalVolume) {
        containerHint = { status: "neutral", message: "Данные о контейнере недоступны" };
      } else {
        const freeCapacity = container.capacity;
        if (totalVolume <= freeCapacity) {
          containerHint = {
            status: "success",
            message: `Помещается в контейнер (${totalVolume.toFixed(3)} м³ из ${freeCapacity.toFixed(3)} м³)`,
          };
          zoneHint = { status: "neutral", message: "Зона не проверяется, так как выбран контейнер" };
        } else {
          const excess = (totalVolume - freeCapacity).toFixed(3);
          containerHint = {
            status: "error",
            message: `Не помещается: превышение на ${excess} м³`,
          };
        }
      }
    }

    return { zoneHint, containerHint };
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Добавьте хотя бы один товар");
      return;
    }

    const invalidItems = items.some(
      (item) => !item.nomenclatureId || !item.warehouseId || !item.zoneId || !item.quantity || !item.measurementUnit
    );
    if (invalidItems) {
      toast.error("Все обязательные поля для товаров должны быть заполнены, включая единицу измерения");
      return;
    }

    const capacityIssues = items.some((item) => {
      const totalVolume = calculateNomenclatureVolume(item.nomenclatureId, parseFloat(item.quantity));
      const zone = zonesByWarehouse[item.warehouseId]?.find((z) => z.id === item.zoneId);
      const container =
        item.containerId && containersByZone[item.zoneId]?.find((c) => c.id === item.containerId);

      if (container) {
        return totalVolume > container.capacity;
      }

      return zone && totalVolume > zone.capacity;
    });

    if (capacityIssues) {
      toast.error("Некоторые товары не помещаются в выбранные зоны или контейнеры");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Формирование payload:", { data, items, selectedFile });
      const payload = {
        documentType: "INCOMING",
        documentNumber: data.documentNumber,
        documentDate: data.documentDate,
        fileName: selectedFile ? selectedFile.fileName : null,
        fileData: selectedFile ? selectedFile.base64 : null,
        supplierId: parseInt(data.supplierId, 10),
        customerId: null,
        items: items.map((item) => ({
          nomenclatureId: parseInt(item.nomenclatureId, 10),
          quantity: parseFloat(item.quantity),
          warehouseZoneId: parseInt(item.zoneId, 10),
          containerId: item.containerId ? parseInt(item.containerId, 10) : null,
          returnable: item.returnable,
          measurementUnit: item.measurementUnit,
        })),
        createdBy: userId,
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));
      const response = await axios.post(API_PROCESS_INCOMING_GOODS, payload, {
        headers: {
          "Auth-token": authToken,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      console.log("Ответ сервера:", response.data);
      toast.success(response?.data?.message || "Заявка успешно создана");
      setRequestSuccess(true);
      setSelectedFile(null);
      setTimeout(() => {
        setRequestSuccess(false);
        dispatch(setItems([]));
      }, 2000);
    } catch (error) {
      console.error("Ошибка в onSubmit:", error);
      const errorMessage = error.response?.data?.message || error.message || "Ошибка при создании заявки";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNomenclature = async (id, data) => {
    console.log("Updating nomenclature with data:", JSON.stringify(data, null, 2));
    try {
      const response = await axios.put(
        `/api/v1/warehouse-manager/${id}/nomenclatures`,
        {
          ...data,
          measurement_unit: data.measurementUnit || "шт",
          length: data.length || null,
          width: data.width || null,
          height: data.height || null,
          volume: data.volume || null,
        },
        { headers: { "Auth-token": authToken } }
      );
      toast.success("Номенклатура обновлена");
      return response.data;
    } catch (error) {
      console.error("Error updating nomenclature:", error);
      toast.error(error.response?.data?.message || "Ошибка обновления номенклатуры");
      throw error;
    }
  };

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ value: s.id, label: s.name })),
    [suppliers]
  );
  const nomenclatureSelectOptions = useMemo(
    () =>
      nomenclatures.map((n) => {
        // Расчет объема на основе габаритов в метрах, если volume отсутствует
        const calculatedVolume = n.volume != null
          ? n.volume
          : n.length != null && n.width != null && n.height != null
          ? n.length * n.width * n.height
          : null;

        const volumeDisplay = calculatedVolume != null
          ? `Объем: ${calculatedVolume.toFixed(3)} м³`
          : "Нет объема";

        const dimensionDisplay = n.length != null && n.width != null && n.height != null
          ? `${n.length} x ${n.width} x ${n.height} м`
          : "Нет размеров";

        return {
          value: n.id,
          label: n.name,
          measurement: n.measurement,
          details: `Ед. изм.: ${n.measurement || "Не указано"} | ${calculatedVolume != null ? volumeDisplay : dimensionDisplay} | ${n.value || "Нет значения"}`,
        };
      }),
    [nomenclatures]
  );
  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ value: w.id, label: w.name })),
    [warehouses]
  );
  const getZoneOptions = useCallback(
    (warehouseId) =>
      zonesByWarehouse[warehouseId]?.map((z) => ({
        value: z.id,
        label: `${z.name} (Свободно: ${z.capacity} м³)`,
      })) || [],
    [zonesByWarehouse]
  );
  const getContainerOptions = useCallback(
    (zoneId) =>
      containersByZone[zoneId]?.map((c) => ({
        value: c.id,
        label: `${c.serialNumber} (Доступно: ${c.capacity} м³)`,
      })) || [],
    [containersByZone]
  );

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

      {uploadFileModal && (
        <UploadFileModal
          setUploadFileModal={setUploadFileModal}
          setSelectedFile={setSelectedFile}
        />
      )}

      <h2 className="text-lg font-semibold text-main-dull-gray text-center">
        Новая заявка на оприходование
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-md font-semibold text-main-dull-gray mb-2">Основные данные</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">
                Номер документа *
              </label>
              <input
                {...register("documentNumber", { required: "Поле обязательно" })}
                className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                placeholder="INV-2025-001"
                disabled={isLoading}
              />
              {errors.documentNumber && (
                <p className="text-red-500 text-xs">{errors.documentNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">
                Дата документа *
              </label>
              <input
                type="date"
                {...register("documentDate", { required: "Поле обязательно" })}
                className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                disabled={isLoading}
              />
              {errors.documentDate && (
                <p className="text-red-500 text-xs">{errors.documentDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">
                Поставщик *
              </label>
              <Controller
                name="supplierId"
                control={control}
                rules={{ required: "Поле обязательно" }}
                render={({ field }) => (
                  <Select
                    options={supplierOptions}
                    value={supplierOptions.find((option) => option.value === field.value)}
                    onChange={(option) => field.onChange(option ? option.value : "")}
                    placeholder="Выберите поставщика"
                    isClearable
                    isDisabled={isLoading}
                    className="text-sm"
                  />
                )}
              />
              {errors.supplierId && (
                <p className="text-red-500 text-xs">{errors.supplierId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-main-dull-blue font-medium mb-1">
                Файл
              </label>
              <button
                type="button"
                onClick={() => setUploadFileModal(true)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                <FaUpload className="mr-1" />
                Загрузить файл
              </button>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Выбран файл: {selectedFile.fileName}
                </p>
              )}
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
                <FaEye className="mr-1" />
                {nomenclaturesLoaded ? "Номенклатуры загружены" : "Просмотреть номенклатуры"}
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                disabled={isLoading}
              >
                <FaPlus className="mr-1" /> Добавить
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-4 bg-white rounded-lg shadow-md text-sm text-main-dull-gray">
              {nomenclaturesLoaded
                ? "Добавьте товары для оприходования"
                : "Загрузите номенклатуры, чтобы добавить товары"}
            </div>
          ) : (
            items.map((item, index) => {
              const { zoneHint, containerHint } = getCapacityHint(item);
              return (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-6 gap-4"
                >
                  <div className="col-span-1">
                    <label className="block text-sm text-main-dull-blue font-semibold mb-1">
                      Номенклатура *
                    </label>
                    <Select
                      options={nomenclatureSelectOptions}
                      value={nomenclatureSelectOptions.find(
                        (o) => o.value === item.nomenclatureId
                      )}
                      onChange={(option) => handleNomenclatureChange(index, option)}
                      placeholder="Выберите товар"
                      isClearable
                      isDisabled={isLoading}
                      formatOptionLabel={({ label, details }) => (
                        <div>
                          <span className="font-semibold">{label}</span>
                          <span className="text-xs text-gray-500 block">{details}</span>
                        </div>
                      )}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm text-main-dull-blue font-semibold mb-1">
                      Количество *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="w-full border border-blue-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-700 transition"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm text-main-dull-blue font-semibold mb-1">
                      Склад *
                    </label>
                    <Select
                      options={warehouseOptions}
                      value={warehouseOptions.find((o) => o.value === item.warehouseId)}
                      onChange={(option) => handleWarehouseChange(index, option)}
                      placeholder="Выберите склад"
                      isClearable
                      isDisabled={isLoading}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm text-main-dull-blue font-semibold mb-1">
                      Зона *
                    </label>
                    <Select
                      options={getZoneOptions(item.warehouseId)}
                      value={getZoneOptions(item.warehouseId).find(
                        (o) => o.value === item.zoneId
                      )}
                      onChange={(option) => handleZoneChange(index, option)}
                      placeholder="Выберите зону"
                      isClearable
                      isDisabled={isLoading}
                      className="text-sm"
                    />
                    <div className="mt-1">
                      <CapacityHint status={zoneHint.status} message={zoneHint.message} />
                    </div>
                  </div>
                  {item.zoneId && (
                    <div className="col-span-1">
                      <label className="block text-sm text-main-dull-blue font-semibold mb-1">
                        Контейнер
                      </label>
                      <Select
                        options={getContainerOptions(item.zoneId)}
                        value={getContainerOptions(item.zoneId).find(
                          (o) => o.value === item.containerId
                        )}
                        onChange={(option) => handleContainerChange(index, option)}
                        placeholder="Необязательно"
                        isClearable
                        isDisabled={isLoading}
                        className="text-sm"
                      />
                      {containerHint && (
                        <div className="mt-1">
                          <CapacityHint
                            status={containerHint.status}
                            message={containerHint.message}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="col-span-1 flex items-center gap-4">
                    <label className="flex items-center text-sm text-blue-600">
                      <input
                        type="checkbox"
                        checked={item.returnable}
                        onChange={(e) =>
                          handleItemChange(index, "returnable", e.target.checked)
                        }
                        className="mr-2"
                        disabled={isLoading}
                      />
                      Возврат
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Удалить"
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || items.length === 0}
            className={`flex items-center px-4 py-2 bg-blue-700 text-white text-sm rounded-md hover:bg-blue-800 transition-colors ${isLoading || items.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Создание...
              </>
            ) : (
              "Создать заявку"
            )}
          </button>
        </div>
        <Notification />
      </form>
    </div>
  );
};

export default IncomingRequestPage;