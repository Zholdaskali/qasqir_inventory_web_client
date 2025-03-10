import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransferRequestPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [fromWarehouse, setFromWarehouse] = useState("");
    const [toWarehouse, setToWarehouse] = useState("");
    const [fromZones, setFromZones] = useState([]);
    const [toZones, setToZones] = useState([]);
    const [selectedFromZones, setSelectedFromZones] = useState([]);
    const [transferItems, setTransferItems] = useState([]);
    const [isFromWarehouseDropdownOpen, setIsFromWarehouseDropdownOpen] = useState(false);
    const [isToWarehouseDropdownOpen, setIsToWarehouseDropdownOpen] = useState(false);

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

    // Загрузка зон для склада-источника
    const fetchFromZonesForWarehouse = async (warehouseId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/employee/warehouses/${warehouseId}/zones`, {
                headers: { "Auth-token": authToken },
            });
            setFromZones(response.data.body || []);
        } catch (error) {
            toast.error("Ошибка загрузки зон склада-источника");
            setFromZones([]);
        }
    };

    // Загрузка зон для склада-назначения
    const fetchToZonesForWarehouse = async (warehouseId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/employee/warehouses/${warehouseId}/zones`, {
                headers: { "Auth-token": authToken },
            });
            setToZones(response.data.body || []);
        } catch (error) {
            toast.error("Ошибка загрузки зон склада-назначения");
            setToZones([]);
        }
    };

    // Загрузка товаров для выбранной зоны
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
                fromWarehouseZoneId: parseInt(zoneId, 10),
                toWarehouseZoneId: null,
                containerId: null,
            }));
            setTransferItems((prevItems) => [...prevItems, ...newItems]);
            toast.success(`Товары из зоны ${zoneId} успешно добавлены`);
        } catch (error) {
            toast.error(`Ошибка загрузки товаров для зоны ${zoneId}`);
        } finally {
            setLoading(false);
        }
    };

    // Обработка выбора склада-источника
    const handleFromWarehouseSelect = async (warehouseId) => {
        setFromWarehouse(warehouseId);
        setSelectedFromZones([]);
        setTransferItems([]);
        setIsFromWarehouseDropdownOpen(false);
        if (warehouseId) {
            await fetchFromZonesForWarehouse(warehouseId);
        } else {
            setFromZones([]);
        }
    };

    // Обработка выбора склада-назначения
    const handleToWarehouseSelect = async (warehouseId) => {
        setToWarehouse(warehouseId);
        setIsToWarehouseDropdownOpen(false);
        if (warehouseId) {
            await fetchToZonesForWarehouse(warehouseId);
        } else {
            setToZones([]);
        }
    };

    // Обработка выбора зон через чекбоксы
    const handleZoneToggle = (zoneId) => {
        const zoneIdStr = String(zoneId);
        if (selectedFromZones.includes(zoneIdStr)) {
            setSelectedFromZones((prevZones) => prevZones.filter((id) => id !== zoneIdStr));
            setTransferItems((prevItems) => prevItems.filter((item) => item.fromWarehouseZoneId !== zoneId));
        } else {
            setSelectedFromZones((prevZones) => [...prevZones, zoneIdStr]);
            fetchItemsForZone(zoneIdStr);
        }
    };

    // Удаление зоны и связанных товаров
    const handleRemoveZone = (zoneId) => {
        setSelectedFromZones((prevZones) => prevZones.filter((id) => id !== zoneId));
        setTransferItems((prevItems) => prevItems.filter((item) => item.fromWarehouseZoneId !== parseInt(zoneId, 10)));
    };

    // Обработка изменения целевой зоны
    const handleToZoneChange = (index, value) => {
        const newItems = [...transferItems];
        newItems[index].toWarehouseZoneId = parseInt(value, 10);
        setTransferItems(newItems);
    };

    // Обработка изменения количества
    const handleQuantityChange = (index, value) => {
        const newItems = [...transferItems];
        newItems[index].quantity = parseFloat(value);
        setTransferItems(newItems);
    };

    // Обработка отправки перемещения
    const handleSubmitTransfer = async () => {
        if (transferItems.length === 0) {
            toast.error("Нет данных для отправки");
            return;
        }
        try {
            setLoading(true);
            const payload = {
                documentType: "TRANSFER",
                documentNumber: Date.now(),
                documentDate: new Date().toISOString().split('T')[0],
                supplierId: 0,
                customerId: 0,
                fromWarehouseId: parseInt(fromWarehouse, 10),
                toWarehouseId: parseInt(toWarehouse, 10),
                items: transferItems.map((item) => ({
                    nomenclatureId: item.nomenclatureId,
                    quantity: item.quantity,
                    toWarehouseZoneId: item.toWarehouseZoneId,
                    fromWarehouseZoneId: item.fromWarehouseZoneId,
                    containerId: item.containerId,
                })),
                createdBy: userId,
            };
            const response = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/transfer",
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message || "Перемещение успешно завершено");
            setTransferItems([]);
            setSelectedFromZones([]);
            setFromWarehouse("");
            setToWarehouse("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при завершении перемещения");
            console.error("Ошибка:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <ToastContainer position="top-center" />
            <div className="flex flex-col gap-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Перемещение товаров</h1>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Выбор склада-источника */}
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Склад-источник
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsFromWarehouseDropdownOpen(!isFromWarehouseDropdownOpen)}
                                className={`w-full p-2 border rounded-lg bg-white text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={loading}
                            >
                                {fromWarehouse
                                    ? warehouses.find((w) => w.id === parseInt(fromWarehouse))?.name || "Выберите склад"
                                    : "Выберите склад"}
                            </button>
                            {isFromWarehouseDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {warehouses.length > 0 ? (
                                        warehouses.map((warehouse) => (
                                            <li
                                                key={warehouse.id}
                                                onClick={() => handleFromWarehouseSelect(warehouse.id)}
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

                    {/* Выбор склада-назначения */}
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Склад-назначение
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsToWarehouseDropdownOpen(!isToWarehouseDropdownOpen)}
                                className={`w-full p-2 border rounded-lg bg-white text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={loading}
                            >
                                {toWarehouse
                                    ? warehouses.find((w) => w.id === parseInt(toWarehouse))?.name || "Выберите склад"
                                    : "Выберите склад"}
                            </button>
                            {isToWarehouseDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {warehouses.length > 0 ? (
                                        warehouses.map((warehouse) => (
                                            <li
                                                key={warehouse.id}
                                                onClick={() => handleToWarehouseSelect(warehouse.id)}
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
                </div>

                {/* Выбор зон склада-источника */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Выберите зоны склада-источника
                    </label>
                    <div className="p-2 border rounded-lg max-h-32 overflow-y-auto bg-white shadow-sm">
                        {fromZones.length > 0 ? (
                            fromZones.map((zone) => (
                                <div
                                    key={zone.id}
                                    className="flex items-center py-1 px-2 hover:bg-gray-100 rounded"
                                >
                                    <input  
                                        type="checkbox"
                                        id={`zone-${zone.id}`}
                                        checked={selectedFromZones.includes(String(zone.id))}
                                        onChange={() => handleZoneToggle(zone.id)}
                                        disabled={!fromWarehouse || loading}
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
                            <p className="text-sm text-gray-500">Зоны отсутствуют</p>
                        )}
                    </div>
                </div>

                {/* Выбранные зоны */}
                <div>
                    <h3 className="text-lg font-medium text-gray-700">Выбранные зоны:</h3>
                    {selectedFromZones.length > 0 ? (
                        <ul className="flex flex-wrap gap-2 mt-2">
                            {selectedFromZones.map((zoneId) => (
                                <li
                                    key={zoneId}
                                    className="flex items-center gap-2 bg-blue-100 text-blue-800 p-2 rounded-full text-sm"
                                >
                                    {fromZones.find((z) => z.id === parseInt(zoneId))?.name || zoneId}
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

                {/* Товары для перемещения */}
                {loading ? (
                    <div className="text-center text-lg text-gray-600">Загрузка...</div>
                ) : transferItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">Номенклатура</th>
                                    <th className="text-left px-2">Ед. измерения</th>
                                    <th className="text-left px-2">Код</th>
                                    <th className="text-left px-2">Из зоны</th>
                                    <th className="text-left px-2">В зону</th>
                                    <th className="text-left px-2">Количество</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transferItems.map((item, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="py-3 px-2">{item.nomenclatureName}</td>
                                        <td className="py-3 px-2">{item.measurementUnit}</td>
                                        <td className="py-3 px-2">{item.code}</td>
                                        <td className="py-3 px-2">
                                            {fromZones.find((z) => z.id === item.fromWarehouseZoneId)?.name || item.fromWarehouseZoneId}
                                        </td>
                                        <td className="py-3 px-2">
                                            <select
                                                value={item.toWarehouseZoneId || ""}
                                                onChange={(e) => handleToZoneChange(index, e.target.value)}
                                                className="p-1 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Выберите зону</option>
                                                {toZones.map((zone) => (
                                                    <option key={zone.id} value={zone.id}>
                                                        {zone.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                value={item.quantity}
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

                {/* Кнопка отправки */}
                {transferItems.length > 0 && (
                    <button
                        onClick={handleSubmitTransfer}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors w-48"
                        disabled={loading}
                    >
                        Завершить перемещение
                    </button>
                )}
            </div>
        </div>
    );
};

export default TransferRequestPage;