import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InventoryCheckPage = ({ inventoryId: initialInventoryId }) => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [zones, setZones] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [selectedZones, setSelectedZones] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [inventoryId, setInventoryId] = useState(initialInventoryId || null);
    const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Загрузка складов
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/employee/warehouses", {
                    headers: { "Auth-token": authToken },
                });
                setWarehouses(response.data.body || []);
            } catch (error) {
                toast.error("Ошибка загрузки складов");
                setWarehouses([]);
            }
        };
        fetchWarehouses();
    }, [authToken]);

    // Загрузка зон для выбранного склада после начала инвентаризации
    const fetchZonesForWarehouse = async (warehouseId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/employee/warehouses/${warehouseId}/zones`, {
                headers: { "Auth-token": authToken },
            });
            setZones(response.data.body || []);
        } catch (error) {
            toast.error("Ошибка загрузки зон");
            setZones([]);
        }
    };

    const fetchItemsForZone = async (zoneId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/api/v1/user/inventory/items/${zoneId}`, {
                headers: { "Auth-token": authToken },
            });
            const newItems = (response.data.body || []).map((item) => ({
                nomenclatureId: item.nomenclatureId,
                nomenclatureName: item.nomenclatureName,
                measurementUnit: item.measurementUnit,
                code: item.code,
                quantity: item.quantity,
                actualQuantity: item.quantity,
                warehouseZoneId: parseInt(zoneId, 10),
            }));
            setInventoryItems((prevItems) => [...prevItems, ...newItems]);
            toast.success(`Товары из зоны ${zoneId} успешно добавлены`);
        } catch (error) {
            toast.error(`Ошибка загрузки товаров для зоны ${zoneId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStartInventory = async () => {
        if (!selectedWarehouse) {
            toast.error("Выберите склад для начала инвентаризации");
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/inventory-check/start",
                null,
                {
                    params: {
                        warehouseId: parseInt(selectedWarehouse, 10),
                        createdBy: userId,
                    },
                    headers: { "Auth-token": authToken },
                }
            );
            const newInventoryId = response.data.body?.inventoryId || response.data.inventoryId;
            setInventoryId(newInventoryId);
            await fetchZonesForWarehouse(selectedWarehouse); // Загружаем зоны после начала
            toast.success(response.data.message || "Инвентаризация успешно начата");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при начале инвентаризации");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitInventory = async () => {
        if (inventoryItems.length === 0) {
            toast.error("Нет данных для отправки");
            return;
        }
        if (!inventoryId) {
            toast.error("Инвентаризация еще не начата");
            return;
        }
        setShowConfirmDialog(true); // Показываем диалог подтверждения
    };

    const confirmSubmitInventory = async () => {
        try {
            setLoading(true);
            const payload = inventoryItems.map((item) => ({
                nomenclatureId: parseInt(item.nomenclatureId, 10),
                warehouseZoneId: parseInt(item.warehouseZoneId, 10),
                actualQuantity: parseFloat(item.actualQuantity),
            }));
            const response = await axios.post(
                `http://localhost:8081/api/v1/storekeeper/inventory-check/process/${inventoryId}`,
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message || "Инвентаризация успешно завершена");
            setInventoryItems([]);
            setSelectedZones([]);
            setSelectedWarehouse("");
            setInventoryId(null);
            setZones([]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при завершении инвентаризации");
        } finally {
            setLoading(false);
            setShowConfirmDialog(false);
        }
    };

    const handleWarehouseSelect = async (warehouseId) => {
        setSelectedWarehouse(warehouseId);
        setSelectedZones([]);
        setInventoryItems([]);
        setIsWarehouseDropdownOpen(false);
        if (!inventoryId) {
            setZones([]); // Очищаем зоны, если инвентаризация еще не начата
        }
    };

    const handleZoneToggle = (zoneId) => {
        const zoneIdStr = String(zoneId);
        if (selectedZones.includes(zoneIdStr)) {
            setSelectedZones((prevZones) => prevZones.filter((id) => id !== zoneIdStr));
            setInventoryItems((prevItems) => prevItems.filter((item) => item.warehouseZoneId !== zoneId));
        } else {
            setSelectedZones((prevZones) => [...prevZones, zoneIdStr]);
            fetchItemsForZone(zoneIdStr);
        }
    };

    const handleRemoveZone = (zoneId) => {
        setSelectedZones((prevZones) => prevZones.filter((id) => id !== zoneId));
        setInventoryItems((prevItems) => prevItems.filter((item) => item.warehouseZoneId !== parseInt(zoneId, 10)));
    };

    const handleQuantityChange = (index, value) => {
        const newItems = [...inventoryItems];
        newItems[index].actualQuantity = parseFloat(value);
        setInventoryItems(newItems);
    };

    useEffect(() => {
        if (initialInventoryId) {
            const fetchInventoryData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8081/api/v1/storekeeper/inventory-check/${initialInventoryId}`,
                        {
                            headers: { "Auth-token": authToken },
                        }
                    );
                    const { warehouseId, items } = response.data.body;
                    setSelectedWarehouse(warehouseId);
                    setInventoryId(initialInventoryId);
                    setInventoryItems(items || []);
                    await fetchZonesForWarehouse(warehouseId);
                    const zoneIds = [...new Set(items.map((item) => item.warehouseZoneId))];
                    setSelectedZones(zoneIds.map(String));
                } catch (error) {
                    toast.error("Ошибка загрузки данных инвентаризации");
                }
            };
            fetchInventoryData();
        }
    }, [initialInventoryId, authToken]);

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <ToastContainer position="top-center" />
            <div className="flex flex-col gap-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Инвентаризация</h1>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Выберите склад
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
                                className={`w-full p-2 border rounded-lg bg-white text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading || inventoryId ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={loading || inventoryId}
                            >
                                {selectedWarehouse
                                    ? warehouses.find((w) => w.id === parseInt(selectedWarehouse))?.name || "Выберите склад"
                                    : "Выберите склад"}
                            </button>
                            {isWarehouseDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {warehouses.length > 0 ? (
                                        warehouses.map((warehouse) => (
                                            <li
                                                key={warehouse.id}
                                                onClick={() => handleWarehouseSelect(warehouse.id)}
                                                className="p-2 hover:bg-blue-100 cursor-pointer text-gray-700"
                                            >
                                                {warehouse.name}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Выберите зоны
                        </label>
                        <div className="p-2 border rounded-lg max-h-32 overflow-y-auto bg-white shadow-sm">
                            {inventoryId && zones.length > 0 ? (
                                zones.map((zone) => (
                                    <div
                                        key={zone.id}
                                        className="flex items-center py-1 px-2 hover:bg-gray-100 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`zone-${zone.id}`}
                                            checked={selectedZones.includes(String(zone.id))}
                                            onChange={() => handleZoneToggle(zone.id)}
                                            disabled={loading}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label
                                            htmlFor={`zone-${zone.id}`}
                                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                                        >
                                            {zone.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">
                                    {inventoryId ? "Зоны отсутствуют" : "Начните инвентаризацию для выбора зон"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-700">Выбранные зоны:</h3>
                    {selectedZones.length > 0 ? (
                        <ul className="flex flex-wrap gap-2 mt-2">
                            {selectedZones.map((zoneId) => (
                                <li
                                    key={zoneId}
                                    className="flex items-center gap-2 bg-blue-100 text-blue-800 p-2 rounded-full text-sm"
                                >
                                    {zones.find((z) => z.id === parseInt(zoneId))?.name || zoneId}
                                    <button
                                        onClick={() => handleRemoveZone(zoneId)}
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

                {!inventoryId && (
                    <button
                        onClick={handleStartInventory}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors w-48"
                        disabled={!selectedWarehouse || loading}
                    >
                        Начать инвентаризацию
                    </button>
                )}

                {loading ? (
                    <div className="text-center text-lg text-gray-600">Загрузка...</div>
                ) : inventoryItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">Номенклатура</th>
                                    <th className="text-left px-2">Ед. измерения</th>
                                    <th className="text-left px-2">Код</th>
                                    <th className="text-left px-2">Зона</th>
                                    <th className="text-left px-2">Количество</th>
                                    <th className="text-left px-2">Фактическое количество</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.map((item, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="py-3 px-2">{item.nomenclatureName}</td>
                                        <td className="py-3 px-2">{item.measurementUnit}</td>
                                        <td className="py-3 px-2">{item.code}</td>
                                        <td className="py-3 px-2">
                                            {zones.find((z) => z.id === item.warehouseZoneId)?.name || item.warehouseZoneId}
                                        </td>
                                        <td className="py-3 px-2">{item.quantity}</td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                value={item.actualQuantity}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                className="p-1 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">Товары отсутствуют</div>
                )}

                {inventoryId && (
                    <button
                        onClick={handleSubmitInventory}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors w-48"
                        disabled={loading || inventoryItems.length === 0}
                    >
                        Завершить инвентаризацию
                    </button>
                )}

                {/* Диалог подтверждения */}
                {showConfirmDialog && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">
                                Подтверждение завершения инвентаризации
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Вы уверены, что хотите завершить инвентаризацию? Все данные будут сохранены.
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="p-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={confirmSubmitInventory}
                                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    disabled={loading}
                                >
                                    {loading ? "Сохранение..." : "Подтвердить"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryCheckPage;