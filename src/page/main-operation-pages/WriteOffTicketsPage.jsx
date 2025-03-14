import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WriteOffTicketsPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);

    const fetchTickets = useCallback(async () => {
        if (!authToken) return;
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8081/api/v1/warehouse-manager/ticket/write-off",
                { headers: { "Auth-token": authToken } }
            );
            setTickets(Array.isArray(response.data.body) ? response.data.body : []);
        } catch (error) {
            toast.error("Ошибка загрузки заявок");
            console.error("Fetch tickets error:", error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    const fetchInventory = useCallback(async () => {
        if (!authToken) return;
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8081/api/v1/user/inventory/items",
                { headers: { "Auth-token": authToken } }
            );
            setInventoryItems(Array.isArray(response.data.body) ? response.data.body : []);
        } catch (error) {
            toast.error("Ошибка загрузки инвентаря");
            console.error("Fetch inventory error:", error);
            setInventoryItems([]);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchTickets();
        fetchInventory();
    }, [fetchTickets, fetchInventory]);

    const handleExecuteWriteOff = async (ticketId) => {
        try {
            setLoading(true);
            const response = await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/ticket/write-off/${ticketId}`,
                {},
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response?.data?.message || "Заявка успешно выполнена");
            setTickets((prev) =>
                prev.map((ticket) =>
                    ticket.id === ticketId ? { ...ticket, status: "COMPLETED" } : ticket
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при выполнении заявки");
            console.error("Execute write-off error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case "ACTIVE":
                return {
                    bg: "bg-[#FFF2EA]",
                    dot: "bg-[#E84D43]",
                    text: "text-[#E84D43]",
                    label: "ОЖИДАЕТСЯ",
                };
            case "COMPLETED":
                return {
                    bg: "bg-[#E3F3E9]",
                    dot: "bg-[#11B066]",
                    text: "text-[#11B066]",
                    label: "ВЫПОЛНЕНА",
                };
            case "ALLOWED":
                return {
                    bg: "bg-[#E6F0FF]",
                    dot: "bg-[#1A73E8]",
                    text: "text-[#1A73E8]",
                    label: "ОДОБРЕНА",
                };
            default:
                return {
                    bg: "bg-[#F2F2F2]",
                    dot: "bg-[#666666]",
                    text: "text-[#666666]",
                    label: "НЕ РАСПОЗНАН СТАТУС ЗАЯВКИ ОБРАТИТЕСЬ С ЕРКЕБУЛАНУ",
                };
        }
    };

    const renderTicketCard = (ticket) => {
        const statusStyles = getStatusStyles(ticket.status);
        return (
            <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Заявка на списание #{ticket.id}
                    </h3>
                    <div
                        className={`${statusStyles.bg} inline-flex items-center px-2 py-1 rounded-full text-xs`}
                    >
                        <div className={`${statusStyles.dot} h-2 w-2 rounded-full mr-1`} />
                        <span className={statusStyles.text}>{statusStyles.label}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Номер документа:</span>{" "}
                        {ticket.document?.documentNumber || "—"}
                    </p>
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Дата:</span>{" "}
                        {ticket.createdAt
                            ? new Date(ticket.createdAt).toLocaleDateString()
                            : "—"}
                    </p>
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Товар:</span>{" "}
                        {inventoryItems.find((item) => item.id === ticket.inventory?.id)
                            ?.nomenclatureName || "Неизвестно"}
                    </p>
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Количество:</span> {ticket.quantity || 0}
                    </p>
                    <p className="text-xs text-gray-600">
                        <span className="font-medium">Комментарий или причина:</span>{" "}
                        {ticket.comment || "—"}
                    </p>
                    {ticket.status === "ALLOWED" && (
                        <p className="text-sm text-gray-600 text-green-600 text-right mt-2">
                            <span className="font-medium">Одобрено:</span>{" "}
                            {ticket.managerName || "Неизвестный менеджер"}
                        </p>
                    )}
                </div>

                {ticket.status === "ALLOWED" && (
                    <div className="flex justify-end mt-5">
                        <button
                            onClick={() => handleExecuteWriteOff(ticket.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm"
                            disabled={loading}
                        >
                            Выполнить
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const activeTickets = tickets.filter((ticket) => ticket.status === "ACTIVE");
    const allowedTickets = tickets.filter((ticket) => ticket.status === "ALLOWED");
    const completedTickets = tickets.filter((ticket) => ticket.status === "COMPLETED");

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="flex flex-col gap-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Список заявок на списание</h1>

                {loading ? (
                    <div className="text-center text-lg text-gray-600">Загрузка...</div>
                ) : (
                    <div className="space-y-8">
                        {/* Ожидающие заявки */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Ожидающие выполнения
                            </h2>
                            {activeTickets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeTickets.map(renderTicketCard)}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Ожидающие заявки отсутствуют
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-300" />

                        {/* Одобренные заявки */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Одобренные заявки
                            </h2>
                            {allowedTickets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allowedTickets.map(renderTicketCard)}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Одобренные заявки отсутствуют
                                </div>
                            )}
                        </div>

                        <hr className="border-gray-300" />

                        {/* Выполненные заявки */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Выполненные заявки
                            </h2>
                            {completedTickets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {completedTickets.map(renderTicketCard)}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Выполненные заявки отсутствуют
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WriteOffTicketsPage;