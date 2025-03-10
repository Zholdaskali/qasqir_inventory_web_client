import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

const InventoryCheckProgressList = () => {
    const authToken = useSelector((state) => state.token.token);
    const [loading, setLoading] = useState(true);
    const [inventories, setInventories] = useState([]);

    const fetchInventoryList = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8081/api/v1/storekeeper/inventory-check",
                {
                    headers: { "Auth-token": authToken },
                }
            );
            setInventories(response.data.body);
            toast.success(response.data.message || "Список инвентаризаций успешно загружен");
        } catch (error) {
            toast.error("Ошибка загрузки списка инвентаризаций");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryList();
    }, []);

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            {loading ? (
                <div className="text-center text-lg">Загрузка...</div>
            ) : (
                <div className="flex flex-col gap-y-5 overflow-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
                        <h1 className="text-2xl">Инвентаризации</h1>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">ID инвентаризации</th>
                                    <th className="text-left px-2">Склад</th>
                                    <th className="text-left px-2">Дата аудита</th>
                                    <th className="text-left px-2">Статус</th>
                                    <th className="text-left px-2">Создатель</th>
                                    <th className="text-left px-2">Дата создания</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventories.length > 0 ? (
                                    inventories.map((inventory) => (
                                        <tr
                                            key={inventory.inventoryId}
                                            className="bg-white border-b cursor-pointer hover:bg-gray-200"
                                        >
                                            <td className="py-3 px-2">{inventory.inventoryId}</td>
                                            <td className="py-3 px-2">
                                                {inventory.warehouseName} (ID: {inventory.warehouseId})
                                            </td>
                                            <td className="py-3 px-2">{inventory.auditDate}</td>
                                            <td className="py-3 px-2 ">{inventory.status}</td>
                                            <td className="py-3 px-2">{inventory.createdBy}</td>
                                            <td className="py-3 px-2">{new Date(inventory.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
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

export default InventoryCheckProgressList;