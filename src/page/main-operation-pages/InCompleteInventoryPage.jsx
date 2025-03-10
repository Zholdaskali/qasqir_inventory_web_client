import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const InCompleteInventoryPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const [completedInventories, setCompletedInventories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompletedInventories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    "http://localhost:8081/api/v1/storekeeper/inventory-check/completed",
                    {
                        headers: { "Auth-token": authToken },
                    }
                );
                setCompletedInventories(response.data.body);
                console.log(response.data.message || "Список завершенных инвентаризаций успешно загружен");
            } catch (error) {
                console.error("Ошибка загрузки списка завершенных инвентаризаций");
            } finally {
                setLoading(false);
            }
        };
        fetchCompletedInventories();
    }, [authToken]);

    const handleDetails = (auditId) => {
        navigate(`/inventory-result/${auditId}`);
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">
                Завершенные инвентаризации
            </h2>

            {loading ? (
                <div className="text-center text-lg">Загрузка...</div>
            ) : (
                <div className="space-y-6">
                    {completedInventories.length > 0 ? (
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">ID инвентаризации</th>
                                    <th className="text-left px-2">Склад</th>
                                    <th className="text-left px-2">Дата аудита</th>
                                    <th className="text-left px-2">Статус</th>
                                    <th className="text-left px-2">Создатель</th>
                                    <th className="text-left px-2">Дата создания</th>
                                    <th className="text-left px-2">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedInventories.map((inventory) => (
                                    <tr
                                        key={inventory.inventoryId}
                                        className="bg-white border-b cursor-pointer hover:bg-gray-200"
                                    >
                                        <td className="py-3 px-2">{inventory.inventoryId}</td>
                                        <td className="py-3 px-2">
                                            {inventory.warehouseName} (ID: {inventory.warehouseId})
                                        </td>
                                        <td className="py-3 px-2">{inventory.auditDate}</td>
                                        <td className="py-3 px-2">{inventory.status}</td>
                                        <td className="py-3 px-2">{inventory.createdBy}</td>
                                        <td className="py-3 px-2">{new Date(inventory.createdAt).toLocaleString()}</td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => handleDetails(inventory.inventoryId)}
                                                className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                                            >
                                                Детали
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center text-lg">Нет завершенных инвентаризаций</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InCompleteInventoryPage;