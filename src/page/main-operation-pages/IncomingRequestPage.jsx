import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const IncomingRequestPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [documentNumber, setDocumentNumber] = useState("");
    const [documentDate, setDocumentDate] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [tnvedCode, setTnvedCode] = useState("");
    const [items, setItems] = useState([]);
    const [nomenclatureOptions, setNomenclatureOptions] = useState([]); // Список номенклатуры
    const [warehouses, setWarehouses] = useState([]); // Список складов
    const [zonesByWarehouse, setZonesByWarehouse] = useState({}); // Зоны по складам
    const [containersByZone, setContainersByZone] = useState({}); // Контейнеры по зонам
    const [suppliers, setSuppliers] = useState([]); // Список поставщиков

    // Загружаем номенклатуру при загрузке страницы
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

    // Загружаем склады при загрузке страницы
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/warehouses", {
                    headers: { "Auth-token": authToken },
                });
                setWarehouses(response.data.body);
            } catch (error) {
                toast.error("Ошибка загрузки складов");
            }
        };
        fetchWarehouses();
    }, [authToken]);

    // Загружаем поставщиков при загрузке страницы
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/suppliers", {
                    headers: { "Auth-token": authToken },
                });
                setSuppliers(response.data.body);
            } catch (error) {
                toast.error("Ошибка загрузки поставщиков");
            }
        };
        fetchSuppliers();
    }, [authToken]);

    // Загружаем зоны для выбранного склада
    const fetchZonesForWarehouse = async (warehouseId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/warehouse-manager/warehouses/${warehouseId}/zones`, {
                headers: { "Auth-token": authToken },
            });
            setZonesByWarehouse((prev) => ({ ...prev, [warehouseId]: response.data.body }));
        } catch (error) {
            toast.error("Ошибка загрузки зон");
        }
    };

    // Загружаем контейнеры для выбранной зоны
    const fetchContainersForZone = async (zoneId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/warehouse-manager/zones/${zoneId}/containers`, {
                headers: { "Auth-token": authToken },
            });
            setContainersByZone((prev) => ({ ...prev, [zoneId]: response.data.body }));
        } catch (error) {
            toast.error("Ошибка загрузки контейнеров");
        }
    };

    const handleAddItem = () => {
        setItems([...items, { 
            nomenclatureId: "", 
            nomenclatureName: "", 
            quantity: 1, 
            measurementUnit: "", 
            warehouseId: "", 
            warehouseName: "", 
            zoneId: "", 
            zoneName: "", 
            containerId: "", 
            returnable: false 
        }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const handleNomenclatureChange = (index, nomenclatureId) => {
        const selectedNomenclature = nomenclatureOptions.find(n => n.id === parseInt(nomenclatureId, 10));
        if (selectedNomenclature) {
            handleItemChange(index, "nomenclatureId", selectedNomenclature.id);
            handleItemChange(index, "nomenclatureName", selectedNomenclature.name);
            handleItemChange(index, "measurementUnit", selectedNomenclature.measurement);
        }
    };

    const handleWarehouseChange = async (index, warehouseId) => {
        handleItemChange(index, "warehouseId", warehouseId);
        handleItemChange(index, "zoneId", ""); // Сбрасываем зону при смене склада
        handleItemChange(index, "containerId", ""); // Сбрасываем контейнер при смене склада
        if (warehouseId) {
            await fetchZonesForWarehouse(warehouseId);
        }
    };

    const handleZoneChange = async (index, zoneId) => {
        handleItemChange(index, "zoneId", zoneId);
        handleItemChange(index, "containerId", ""); // Сбрасываем контейнер при смене зоны
        if (zoneId) {
            await fetchContainersForZone(zoneId);
        }
    };

    const handleContainerChange = (index, containerId) => {
        handleItemChange(index, "containerId", containerId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                documentType: "INCOMING",
                documentNumber,
                documentDate,
                supplierId: parseInt(supplierId, 10),
                tnvedCode,
                items: items.map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity),
                    warehouseId: parseInt(item.warehouseId, 10),
                    zoneId: parseInt(item.zoneId, 10),
                    containerId: item.containerId ? parseInt(item.containerId, 10) : null, // Контейнер может быть null
                })),
                createdBy: userId,
                updatedBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await axios.post("http://localhost:8081/api/v1/storekeeper/incoming", payload, {
                headers: { "Auth-token": authToken },
            });
            toast.success("Заявка успешно создана");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-main-light-gray rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">Создание заявки INCOMING</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-main-dull-blue">Номер документа</label>
                    <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-main-dull-blue">Дата документа</label>
                    <input type="date" className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-main-dull-blue">Поставщик</label>
                    <select
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                        required
                    >
                        <option value="">Выберите поставщика</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-main-dull-blue">Код ТН ВЭД</label>
                    <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={tnvedCode} onChange={(e) => setTnvedCode(e.target.value)} required />
                </div>
                
                <h3 className="text-lg font-semibold text-main-dull-gray">Товары</h3>
                {items.map((item, index) => (
                    <div key={index} className="border border-main-dull-blue p-4 rounded-lg space-y-4">
                        <h4 className="text-md font-medium text-main-dull-blue">Товар #{index + 1}</h4>
                        
                        <div>
                            <label className="block text-main-dull-blue">Выберите номенклатуру</label>
                            <select
                                className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                value={item.nomenclatureId}
                                onChange={(e) => handleNomenclatureChange(index, e.target.value)}
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
                            <label className="block text-main-dull-blue">Количество</label>
                            <input type="number" className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-main-dull-blue">Единица измерения</label>
                            <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={item.measurementUnit} disabled />
                        </div>

                        <div>
                            <label className="block text-main-dull-blue">Выберите склад</label>
                            <select
                                className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                value={item.warehouseId}
                                onChange={(e) => handleWarehouseChange(index, e.target.value)}
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

                        {item.warehouseId && (
                            <div>
                                <label className="block text-main-dull-blue">Выберите зону</label>
                                <select
                                    className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                    value={item.zoneId}
                                    onChange={(e) => handleZoneChange(index, e.target.value)}
                                    required
                                >
                                    <option value="">Выберите зону</option>
                                    {zonesByWarehouse[item.warehouseId]?.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {item.zoneId && (
                            <div>
                                <label className="block text-main-dull-blue">Выберите контейнер (необязательно)</label>
                                <select
                                    className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                    value={item.containerId}
                                    onChange={(e) => handleContainerChange(index, e.target.value)}
                                >
                                    <option value="">Не выбрано</option>
                                    {containersByZone[item.zoneId]?.map((container) => (
                                        <option key={container.id} value={container.id}>
                                            {container.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-main-dull-blue">Возвратная тара</label>
                            <input
                                type="checkbox"
                                checked={item.returnable}
                                onChange={(e) => handleItemChange(index, "returnable", e.target.checked)}
                            />
                        </div>
                        
                        <button type="button" onClick={() => handleRemoveItem(index)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                            Удалить
                        </button>
                    </div>
                ))}
                
                <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    Добавить товар
                </button>
                
                <div className="flex justify-end space-x-4">
                    <button type="submit" className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition">
                        Создать заявку
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IncomingRequestPage;