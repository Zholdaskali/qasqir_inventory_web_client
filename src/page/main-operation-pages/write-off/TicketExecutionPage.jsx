import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCalendarDate } from "react-icons/ci"; // Импорт иконки

const TicketExecutionPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [ticketType, setTicketType] = useState("WRITE-OFF"); // Начальное значение

    // Установка начальных дат: сегодня и 3 дня назад
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const [startDate, setStartDate] = useState(threeDaysAgo.toISOString().slice(0, 10)); // Формат YYYY-MM-DD
    const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10)); // Формат YYYY-MM-DD

    const fetchTickets = useCallback(async () => {
        if (!authToken) return;
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8081/api/v1/warehouse-manager/ticket/${ticketType}`,
                {
                    headers: { "Auth-token": authToken },
                    params: {
                        startDate: startDate || undefined,
                        endDate: endDate || undefined,
                    },
                }
            );
            setTickets(Array.isArray(response.data.body) ? response.data.body : []);
        } catch (error) {
            toast.error(`Ошибка загрузки заявок (${ticketType})`);
            console.error(`Fetch tickets error (${ticketType}):`, error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [authToken, ticketType, startDate, endDate]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleExecuteTicket = async (ticketId) => {
        try {
            setLoading(true);
            const response = await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/ticket/${ticketId}`,
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
            console.error(`Execute ${ticketType} error:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelTicket = async (ticketId) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/ticket/${ticketId}`,
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response?.data?.message || "Заявка успешно отменена");
            setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId)); // Удаляем заявку из списка
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при отмене заявки");
            console.error(`Cancel ${ticketType} error:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (event) => {
        setTicketType(event.target.value);
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
                    label: "НЕ РАСПОЗНАН СТАТУС ЗАЯВКИ",
                };
        }
    };

    const renderTicketCard = (ticket) => {
        const statusStyles = getStatusStyles(ticket.status);
        const actionLabel = ticketType === "SALES" ? "продажу" : "списание";
        return (
            <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Заявка на {actionLabel} #{ticket.id}
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
                        {ticket.inventory?.nomenclatureName || "Неизвестно"}
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
                    <div className="flex justify-end mt-5 gap-2">
                        <button
                            onClick={() => handleExecuteTicket(ticket.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm"
                            disabled={loading}
                        >
                            Выполнить
                        </button>
                        <button
                            onClick={() => handleCancelTicket(ticket.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors text-sm"
                            disabled={loading}
                        >
                            Отменить
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const activeTickets = tickets.filter((ticket) => ticket.status === "ACTIVE");
    const allowedTickets = tickets.filter((ticket) => ticket.status === "ALLOWED");
    const completedTickets = tickets.filter((ticket) => ticket.status === "COMPLETED");

    const actionTitle = ticketType === "SALES" ? "продажу" : "списание";

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="flex flex-col gap-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-x-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Список заявок на {actionTitle}
                        </h1>
                        <select
                            value={ticketType}
                            onChange={handleTypeChange}
                            className="p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="WRITE-OFF">Утилизация</option>
                            <option value="SALES">Продажа</option>
                            <option value="PRODUCTION">Производство</option>
                        </select>
                    </div>
                    <div className="flex gap-2 sm:w-auto">
                        <div className="flex-1">
                            <label className="flex items-center gap-1 text-sm">
                                <CiCalendarDate /> Начало
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border px-2 py-1 rounded-md w-full text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="flex items-center gap-1 text-sm">
                                <CiCalendarDate /> Конец
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border px-2 py-1 rounded-md w-full text-sm"
                            />
                        </div>
                    </div>
                </div>

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

export default TicketExecutionPage;