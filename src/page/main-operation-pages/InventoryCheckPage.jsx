import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InventoryCheckPage = ({ inventoryId }) => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    // Состояния для этапа начала инвентаризации
    const [warehouseId, setWarehouseId] = useState("");
    const [inventoryStarted, setInventoryStarted] = useState(false); // Флаг начала инвентаризации

    // Состояния для данных
    const [nomenclatureOptions, setNomenclatureOptions] = useState([]); // Список номенклатур
    const [warehouses, setWarehouses] = useState([]); // Список складов
    const [zonesByWarehouse, setZonesByWarehouse] = useState({}); // Зоны по складам

    // Состояния для этапа обработки данных инвентаризации
    const [inventoryData, setInventoryData] = useState([]); // Инициализация пустым массивом

    // Загрузка номенклатуры
    useEffect(() => {
        const fetchNomenclatureList = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/nomenclatures", {
                    headers: { "Auth-token": authToken },
                });
                setNomenclatureOptions(response.data.body);
            } catch (error) {
                toast.error("Ошибка загрузки номенклатуры");
            }
        };
        fetchNomenclatureList();
    }, [authToken]);

    // Загрузка складов
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/employee/warehouses", {
                    headers: { "Auth-token": authToken },
                });
                setWarehouses(response.data.body);
            } catch (error) {
                toast.error("Ошибка загрузки складов");
            }
        };
        fetchWarehouses();
    }, [authToken]);

    // Загрузка зон для выбранного склада
    const fetchZonesForWarehouse = async (warehouseId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/employee/warehouses/${warehouseId}/zones`, {
                headers: { "Auth-token": authToken },
            });
            setZonesByWarehouse((prev) => ({ ...prev, [warehouseId]: response.data.body }));
        } catch (error) {
            toast.error("Ошибка загрузки зон");
        }
    };

    // Загрузка данных для продолжения инвентаризации
    useEffect(() => {
        if (inventoryId) {
            const fetchInventoryData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8081/api/v1/storekeeper/inventory-check/${inventoryId}`,
                        {
                            headers: { "Auth-token": authToken },
                        }
                    );
                    const { warehouseId, items } = response.data.body;
                    setWarehouseId(warehouseId);
                    setInventoryData(items || []); // Убедимся, что items - это массив
                    setInventoryStarted(true);
                    await fetchZonesForWarehouse(warehouseId); // Загружаем зоны для склада
                } catch (error) {
                    toast.error("Ошибка загрузки данных инвентаризации");
                }
            };
            fetchInventoryData();
        }
    }, [inventoryId, authToken]);

    // Обработка начала инвентаризации
    const handleStartInventory = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/inventory-check/start",
                null,
                {
                    params: {
                        warehouseId: parseInt(warehouseId, 10),
                        createdBy: userId,
                    },
                    headers: { "Auth-token": authToken },
                }
            );
            console.log("Ответ сервера:", response.data); // Логируем ответ сервера
            if (response.data.message) {
                toast.success(response.data.message);
                setInventoryStarted(true); // Переключаем на этап обработки данных
            } else {
                toast.error("Не удалось начать инвентаризацию: ответ сервера пуст");
            }
        } catch (error) {
            console.error("Ошибка при начале инвентаризации:", error); // Логируем ошибку
            toast.error(error.response?.data?.message || "Ошибка при начале инвентаризации");
        }
    };

    // Обработка добавления товара
    const handleAddItem = () => {
        setInventoryData([...inventoryData, { nomenclatureId: "", warehouseZoneId: "", actualQuantity: 0 }]);
    };

    // Обработка удаления товара
    const handleRemoveItem = (index) => {
        setInventoryData(inventoryData.filter((_, i) => i !== index));
    };

    // Обработка изменения данных товара
    const handleItemChange = (index, field, value) => {
        const updatedData = [...inventoryData];
        updatedData[index][field] = value;
        setInventoryData(updatedData);
    };

    // Обработка изменения склада
    const handleWarehouseChange = async (warehouseId) => {
        setWarehouseId(warehouseId);
        if (warehouseId) {
            await fetchZonesForWarehouse(warehouseId);
        }
    };

    // Обработка отправки данных инвентаризации
    const handleSubmitInventoryData = async () => {
        try {
            const payload = inventoryData.map((item) => ({
                nomenclatureId: parseInt(item.nomenclatureId, 10),
                warehouseZoneId: parseInt(item.warehouseZoneId, 10),
                actualQuantity: parseFloat(item.actualQuantity),
            }));
            const response = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/inventory-check/process",
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message || "Данные инвентаризации успешно обработаны");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обработке данных инвентаризации");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-main-light-gray rounded-xl shadow-lg space-y-6">
            <ToastContainer position="top-center" /> {/* Добавьте это для отображения уведомлений */}
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">
                {inventoryStarted ? "Обработка данных инвентаризации" : "Начало инвентаризации"}
            </h2>

            {/* Этап начала инвентаризации */}
            {!inventoryStarted && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-main-dull-blue">Выберите склад</label>
                        <select
                            className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                            value={warehouseId}
                            onChange={(e) => handleWarehouseChange(e.target.value)}
                            required
                        >
                            <option value="">Выберите склад</option>
                            {warehouses.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleStartInventory}
                        className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                    >
                        Начать инвентаризацию
                    </button>
                </div>
            )}

            {/* Этап обработки данных инвентаризации */}
            {inventoryStarted && (
                <div className="space-y-6">
                    {Array.isArray(inventoryData) && inventoryData.map((item, index) => (
                        <div key={index} className="border border-main-dull-blue p-4 rounded-lg space-y-4">
                            <h4 className="text-md font-medium text-main-dull-blue">Товар #{index + 1}</h4>
                            <div>
                                <label className="block text-main-dull-blue">Выберите номенклатуру</label>
                                <select
                                    className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                    value={item.nomenclatureId}
                                    onChange={(e) => handleItemChange(index, "nomenclatureId", e.target.value)}
                                    required
                                >
                                    <option value="">Выберите номенклатуру</option>
                                    {nomenclatureOptions.map((nomenclature) => (
                                        <option key={nomenclature.id} value={nomenclature.id}>
                                            {nomenclature.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-main-dull-blue">Выберите зону склада</label>
                                <select
                                    className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                    value={item.warehouseZoneId}
                                    onChange={(e) => handleItemChange(index, "warehouseZoneId", e.target.value)}
                                    required
                                >
                                    <option value="">Выберите зону</option>
                                    {zonesByWarehouse[warehouseId]?.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-main-dull-blue">Фактическое количество</label>
                                <input
                                    type="number"
                                    className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                    value={item.actualQuantity}
                                    onChange={(e) => handleItemChange(index, "actualQuantity", e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                Удалить
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        Добавить товар
                    </button>
                    <button
                        onClick={handleSubmitInventoryData}
                        className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                    >
                        Отправить данные
                    </button>
                </div>
            )}
        </div>
    );
};

export default InventoryCheckPage;  