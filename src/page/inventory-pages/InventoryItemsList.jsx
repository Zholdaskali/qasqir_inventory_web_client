import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Notification from "../../components/notification/Notification";
import { IoIosNotificationsOutline } from "react-icons/io";

const InventoryItemsList = () => {
    const authToken = useSelector((state) => state.token.token);
    const [inventoryItems, setInventoryItems] = useState([]);

    const fetchInventoryItems = async () => {
        try {
            const response = await axios.get(`http://localhost:8081/api/v1/user/inventory/items`, {
                headers: { "Auth-token": authToken },
            });
            setInventoryItems(response.data.body);
            console.log(response.data.body)
            toast.success("Инвентарь загружен");
        } catch (error) {
            toast.error("Ошибка загрузки инвентаря");
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, []);

    return (
        <div className="h-screen w-full flex flex-col overflow-y-auto p-4">
            <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between border-b py-5 gap-4">
                <h1 className="text-2xl">Инвентарь</h1>
            </div>

            {/* Таблица */}
            <div className="flex-1 overflow-hidden mt-4">
                <div className="h-full overflow-auto rounded-xl">
                    <table className="table-auto w-full border-separate border-spacing-y-4">
                        <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 sticky top-0 z-10">
                            <tr className="h-14">
                                <th className="text-start px-4">ID инвентаря</th>
                                <th className="text-start px-4">Номенклатура</th>
                                <th className="text-start px-4">Ед. изм.</th>
                                <th className="text-start px-4">Код</th>
                                <th className="text-start px-4">Количество</th>
                                <th className="text-start px-4">Склад</th>
                                <th className="text-start px-4">Контейнер</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {inventoryItems.map((item) => (
                                <tr key={item.inventoryId} className="bg-white hover:bg-gray-50 border-b transition">
                                    <td className="py-4 px-4">{item.inventoryId}</td>
                                    <td className="py-4 px-4">{item.nomenclatureName}</td>
                                    <td className="py-4 px-4">{item.measurementUnit}</td>
                                    <td className="py-4 px-4">{item.code}</td>
                                    <td className="py-4 px-4">{item.quantity}</td>
                                    <td className="py-4 px-4">{item.warehouseName}</td>
                                    <td className="py-4 px-4">{item.containerName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Notification />
            </div>
        </div>
    );
};

export default InventoryItemsList;
