import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { List } from "react-virtualized"; // Добавляем виртуализацию

const CreateWriteOffPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [comment, setComment] = useState("");
    const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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
            setFilteredItems(items); // Изначально все элементы
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

    const handleCreateWriteOff = async () => {
        if (!selectedItem || !quantity || quantity <= 0) {
            toast.error("Выберите товар и укажите корректное количество");
            return;
        }
        try {
            setLoading(true);
            const payload = {
                documentType: "WRITE-OFF",
                documentNumber: `WO-${Date.now()}`,
                documentDate: new Date().toISOString().split("T")[0],
                comment: comment || "Списание товара",
                inventoryId: selectedItem.id,
                quantity: parseInt(quantity, 10),
                createdBy: userId,
            };
            await axios.post(
                "http://localhost:8081/api/v1/warehouse-manager/ticket/write-off",
                payload,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Заявка на списание успешно создана");
            setSelectedItem(null);
            setQuantity("");
            setComment("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки");
            console.error("Create write-off error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
        setIsItemDropdownOpen(false);
        setQuantity("");
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
                <h1 className="text-2xl font-bold text-gray-800">Создать заявку на списание</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Выберите товар
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
                                                width={300} // Ширина списка (подстройте под ваш дизайн)
                                                height={240} // Высота списка
                                                rowCount={filteredItems.length}
                                                rowHeight={40} // Высота одной строки
                                                rowRenderer={rowRenderer}
                                            />
                                        ) : (
                                            <div className="p-2 text-gray-500 text-sm">
                                                Товары не найдены
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedItem && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Выбрано: {selectedItem.nomenclatureName} (
                                        {selectedItem.quantity} {selectedItem.measurementUnit})
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Количество
                            </label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                max={selectedItem?.quantity || ""}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                disabled={!selectedItem || loading}
                                placeholder="Введите количество"
                            />
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
                        onClick={handleCreateWriteOff}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Создание..." : "Создать заявку"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWriteOffPage;