import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { List } from "react-virtualized";

const BatchWriteOffPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [comment, setComment] = useState("");
    const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [documentType, setDocumentType] = useState("WRITE-OFF");
    const [documentNumber, setDocumentNumber] = useState(`WO-${Date.now()}`);

    const fetchInventory = useCallback(async () => {
        if (!authToken) return;
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8081/api/v1/user/inventory/items",
                { headers: { "Auth-token": authToken } }
            );
            const items = Array.isArray(response.data.body) ? response.data.body : [];
            setInventoryItems(items);
            setFilteredItems(items);
        } catch (error) {
            toast.error("Ошибка загрузки инвентаря");
            console.error("Fetch inventory error:", error);
            setInventoryItems([]);
            setFilteredItems([]);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredItems(inventoryItems);
        } else {
            const lowerQuery = query.toLowerCase();
            setFilteredItems(
                inventoryItems.filter((item) =>
                    item.nomenclatureName.toLowerCase().includes(lowerQuery)
                )
            );
        }
    };

    const handleItemSelect = (item) => {
        if (!selectedItems.some((selected) => selected.id === item.id)) {
            setSelectedItems([...selectedItems, item]);
            setQuantities({ ...quantities, [item.id]: "" });
        }
        setIsItemDropdownOpen(false);
    };

    const handleQuantityChange = (itemId, value) => {
        setQuantities({ ...quantities, [itemId]: parseInt(value) || 0 });
    };

    const handleRemoveItem = (itemId) => {
        setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
        const newQuantities = { ...quantities };
        delete newQuantities[itemId];
        setQuantities(newQuantities);
    };

    const handleCreateBatchWriteOff = async () => {
        if (selectedItems.length === 0) {
            toast.error("Выберите хотя бы один товар");
            return;
        }
        for (const item of selectedItems) {
            if (!quantities[item.id] || quantities[item.id] <= 0) {
                toast.error(`Укажите корректное количество для товара: ${item.nomenclatureName}`);
                return;
            }
        }
        try {
            setLoading(true);
            const payload = {
                documentType: documentType,
                documentNumber: documentNumber,
                documentDate: "2025-03-19", // Используем текущую дату из инструкции
                createdBy: userId,
                ticketRequests: selectedItems.map((item) => ({
                    comment: comment || "Групповое списание товаров",
                    inventoryId: item.id,
                    quantity: quantities[item.id]
                }))
            };
            console.log("Отправляемый запрос:", JSON.stringify(payload));
            await axios.post(
                "http://localhost:8081/api/v1/warehouse-manager/ticket/write-off/batch",
                payload,
                { 
                    headers: { 
                        "Auth-token": authToken,
                        "Content-Type": "application/json" 
                    } 
                }
            );
            toast.success("Групповая заявка на списание успешно создана");
            setSelectedItems([]);
            setQuantities({});
            setComment("");
            setDocumentNumber(`WO-${Date.now()}`); // Обновляем номер документа после успешной отправки
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки");
            console.error("Create batch write-off error:", error);
        } finally {
            setLoading(false);
        }
    };

    const rowRenderer = ({ index, key, style }) => {
        const item = filteredItems[index];
        return (
            <li
                key={key}
                style={style}
                onClick={() => handleItemSelect(item)}
                className="p-2 hover:bg-blue-100 cursor-pointer text-gray-700 text-sm"
            >
                {item.nomenclatureName} ({item.quantity} {item.measurementUnit})
            </li>
        );
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="flex flex-col gap-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Групповое списание товаров</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Тип документа
                            </label>
                            <input
                                type="text"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Номер документа
                            </label>
                            <input
                                type="text"
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Выберите товары
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => setIsItemDropdownOpen(true)}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Поиск по названию товара"
                                    disabled={loading}
                                />
                                {isItemDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
                                        {filteredItems.length > 0 ? (
                                            <List
                                                width={300}
                                                height={240}
                                                rowCount={filteredItems.length}
                                                rowHeight={40}
                                                rowRenderer={rowRenderer}
                                            />
                                        ) : (
                                            <div className="p-2 text-gray-500 text-sm">
                                                Товары не найдены
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Выбранные товары
                            </label>
                            <div className="space-y-2">
                                {selectedItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            {item.nomenclatureName} ({item.quantity} {item.measurementUnit})
                                        </div>
                                        <input
                                            type="number"
                                            value={quantities[item.id] || ""}
                                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            min="1"
                                            max={item.quantity}
                                            className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            disabled={loading}
                                            placeholder="Количество"
                                        />
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Комментарий
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                rows="3"
                                disabled={loading}
                                placeholder="Введите комментарий (опционально)"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreateBatchWriteOff}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Создание..." : "Создать групповую заявку"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchWriteOffPage;