import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import successIcon from '../../assets/success.svg';
import Notification from "../../components/notification/Notification";
import { addItem, removeItem, updateItem, setItems } from '../../store/slices/operationSlice/itemsSlice'; // Импортируем actions

const IncomingRequestPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);
    const items = useSelector((state) => state.items.items); // Получаем товары из Redux
    const dispatch = useDispatch();

    const [documentNumber, setDocumentNumber] = useState("");
    const [documentDate, setDocumentDate] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [tnvedCode, setTnvedCode] = useState("");
    const [nomenclatureOptions, setNomenclatureOptions] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [zonesByWarehouse, setZonesByWarehouse] = useState({});
    const [containersByZone, setContainersByZone] = useState({});
    const [suppliers, setSuppliers] = useState([]);
    const [requestSuccess, setRequestSuccess] = useState(false);

    // Загрузка номенклатуры, складов и поставщиков (остается без изменений)
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

    // Добавление товара
    const handleAddItem = () => {
        const newItem = {
            nomenclatureId: "",
            nomenclatureName: "",
            quantity: 1,
            measurementUnit: "",
            warehouseId: "",
            warehouseZoneId: "",
            containerId: "",
            returnable: false
        };
        dispatch(addItem(newItem)); // Используем Redux action
    };

    // Удаление товара
    const handleRemoveItem = (index) => {
        dispatch(removeItem(index)); // Используем Redux action
    };

    // Изменение товара
    const handleItemChange = (index, field, value) => {
        dispatch(updateItem({ index, field, value })); // Используем Redux action
    };

    // Обработка изменения номенклатуры
    const handleNomenclatureChange = (index, nomenclatureId) => {
        const selectedNomenclature = nomenclatureOptions.find(n => n.id === parseInt(nomenclatureId, 10));
        if (selectedNomenclature) {
            handleItemChange(index, "nomenclatureId", selectedNomenclature.id);
            handleItemChange(index, "nomenclatureName", selectedNomenclature.name);
            handleItemChange(index, "measurementUnit", selectedNomenclature.measurement);
        }
    };

    // Обработка изменения склада
    const handleWarehouseChange = async (index, warehouseId) => {
        handleItemChange(index, "warehouseId", warehouseId);
        handleItemChange(index, "zoneId", "");
        handleItemChange(index, "containerId", "");
        if (warehouseId) {
            await fetchZonesForWarehouse(warehouseId);
        }
    };

    // Обработка изменения зоны
    const handleZoneChange = async (index, zoneId) => {
        handleItemChange(index, "zoneId", zoneId);
        handleItemChange(index, "containerId", "");
        if (zoneId) {
            await fetchContainersForZone(zoneId);
        }
    };

    // Обработка изменения контейнера
    const handleContainerChange = (index, containerId) => {
        handleItemChange(index, "containerId", containerId);
    };

    // Отправка формы
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
                    nomenclatureId: parseInt(item.nomenclatureId, 10),
                    quantity: parseFloat(item.quantity),
                    warehouseZoneId: parseInt(item.zoneId, 10),
                    containerId: item.containerId ? parseInt(item.containerId, 10) : null,
                    returnable: item.returnable,
                })),
                createdBy: userId,
            };
            console.log("Отправляемый payload:", JSON.stringify(payload, null, 2));
            const response = await axios.post("http://localhost:8081/api/v1/storekeeper/incoming", payload, {
                headers: { "Auth-token": authToken },
            });
            toast.success(response?.data?.message || "Заявка успешно создана");
            setRequestSuccess(true);
            setTimeout(() => {
                setRequestSuccess(false);
                dispatch(setItems([])); // Очищаем список товаров после успешного создания заявки
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-main-light-gray rounded-xl shadow-lg space-y-6">
            {requestSuccess && (
                <div className="absolute h-screen w-full top-1/3 left-0 text-black">
                    <div className='flex justify-center items-center w-full'>
                        <div className='bg-white w-2/5 md:w-1/5 px-4 py-8 md:px-2 rounded-xl'>
                            <div className='flex flex-col items-center gap-y-8 md:gap-y-16'>
                                <img src={successIcon} className='w-1/2 md:w-1/3' alt="Успех" />
                                <h2>Заявка успешно создана</h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">Создание Оприходование</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-main-dull-blue">Номер документа</label>
                    <input
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-main-dull-blue">Дата документа</label>
                    <input
                        type="date"
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={documentDate}
                        onChange={(e) => setDocumentDate(e.target.value)}
                        required
                    />
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

                <h3 className="text-lg font-semibold text-main-dull-gray">Товары</h3>
                {items.map((item, index) => (
                    <div key={index} className="border border-main-dull-blue p-4 rounded-lg space-y-4">
                        <h4 className="text-md font-medium text-main-dull-blue">Товар #{index + 1}</h4>

                        <div>
                            <label className="block text-main-dull-blue font-medium mb-2">Выберите номенклатуру</label>
                            <select
                                className="w-full border border-main-dull-blue rounded-lg px-4 py-2 focus:border-main-blue focus:ring-2 focus:ring-main-blue transition-colors duration-200"
                                value={item.nomenclatureId}
                                onChange={(e) => handleNomenclatureChange(index, e.target.value)}
                            >
                                <option value="">Выберите номенклатуру</option>
                                {nomenclatureOptions.map((nomenclature) => (
                                    <option key={nomenclature.id} value={nomenclature.id}>
                                        <span className="font-semibold">{nomenclature.name}</span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {` | Длина: ${nomenclature.length} | Высота: ${nomenclature.height} | Ширина: ${nomenclature.width}`}
                                        </span>
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-main-dull-blue">Количество</label>
                            <input
                                type="number"
                                className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                required
                            />
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
                                            <span className="font-semibold">{zone.name}</span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                {` | Длина: ${zone.length} | Высота: ${zone.height} | Ширина: ${zone.width} | Свободные место: ${zone.capacity}`}
                                            </span>
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
                                            <span className="font-semibold">{container.serialNumber}</span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                {` | Длина: ${container.length} | Высота: ${container.height} | Ширина: ${container.width} | ${container.capacity}`}
                                            </span>
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

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

                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                    >
                        Создать заявку
                    </button>
                </div>
            </form>
            <Notification />
        </div>
    );
};

export default IncomingRequestPage;