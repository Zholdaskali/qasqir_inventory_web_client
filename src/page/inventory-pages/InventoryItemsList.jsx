import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

const InventoryItemsList = () => {
    const authToken = useSelector((state) => state.token.token);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const fetchInventoryItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8081/api/v1/user/inventory/items",
                {
                    headers: { "Auth-token": authToken },
                }
            );
            setItems(response.data.body);
            toast.success(response.data.message || "Список элементов инвентаризации успешно загружен");
        } catch (error) {
            toast.error("Ошибка загрузки списка элементов инвентаризации");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            {loading ? (
                <div className="text-center text-lg">Загрузка...</div>
            ) : (
                <div className="flex flex-col gap-y-5 overflow-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
                        <h1 className="text-2xl">Элементы инвентаризации</h1>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">ID</th>
                                    <th className="text-left px-2">Номенклатура</th>
                                    <th className="text-left px-2">Количество</th>
                                    <th className="text-left px-2">Ед. измерения</th>
                                    <th className="text-left px-2">Код</th>
                                    <th className="text-left px-2">Склад</th>
                                    <th className="text-left px-2">Контейнер</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="bg-white border-b cursor-pointer hover:bg-gray-200"
                                        >
                                            <td className="py-3 px-2">{item.id}</td>
                                            <td className="py-3 px-2">
                                                {item.nomenclatureName} (ID: {item.nomenclatureId})
                                            </td>
                                            <td className="py-3 px-2">{item.quantity}</td>
                                            <td className="py-3 px-2">{item.measurementUnit}</td>
                                            <td className="py-3 px-2">{item.code}</td>
                                            <td className="py-3 px-2">
                                                {item.warehouseName} (ID: {item.warehouseId})
                                            </td>
                                            <td className="py-3 px-2">
                                                {item.containerName} (ID: {item.containerId})
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            Данные отсутствуют
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryItemsList;