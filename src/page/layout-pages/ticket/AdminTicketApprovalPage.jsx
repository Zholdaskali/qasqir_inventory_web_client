import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCalendarDate } from "react-icons/ci"; // Импорт иконки
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";

const AdminTicketApprovalPage = ({ ticketType }) => {
    const authToken = useSelector((state) => state.token.token);
    const adminId = useSelector((state) => state.user.userId);
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);

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
                `http://localhost:8081/api/v1/employee/ticket/${ticketType}`,
                {
                    headers: { "Auth-token": authToken },
                    params: {
                        startDate: startDate || undefined,
                        endDate: endDate || undefined,
                    },
                }
            );
            console.log(`Ответ API по заявкам (${ticketType}):`, response.data);
            setTickets(Array.isArray(response.data.body) ? response.data.body : []);
        } catch (error) {
            toast.error(`Ошибка при загрузке заявок (${ticketType})`);
            console.error(`Ошибка загрузки заявок (${ticketType}):`, error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [authToken, ticketType, startDate, endDate]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

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

    const handleApproveTicket = async (ticketId) => {
        try {
            setLoading(true);
            const payload = { ticketId, managed_id: adminId };
            const response = await axios.put(
                `http://localhost:8081/api/v1/warehouse-manager/ticket/allowed`,
                payload,
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response?.data?.message || "Заявка успешно одобрена");
            setTickets((prev) =>
                prev.map((ticket) =>
                    ticket.id === ticketId
                        ? {
                            ...ticket,
                            status: "ALLOWED",
                            managerId: adminId,
                            managedAt: new Date().toISOString(),
                        }
                        : ticket
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при одобрении заявки");
            console.error(`Ошибка одобрения заявки (${ticketType}):`, error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (tickets, status) => {
        const headers = [
            "ID Заявки",
            "Статус",
            "Тип",
            "Автор",
            "Дата создания",
            "Одобрил",
            "Дата одобрения",
            "Комментарий",
            "№ Документа",
            "Тип документа",
            "Дата документа",
            "Поставщик",
            "Клиент",
            "ID Инвентаря",
            "Название товара",
            "Количество",
            "Зона склада",
            "Серийный №",
        ];

        const rows = tickets.map((ticket) => [
            ticket.id,
            ticket.status,
            ticket.type,
            `${ticket.createdByName} (ID: ${ticket.createdBy})`,
            new Date(ticket.createdAt).toLocaleString(),
            ticket.managerName ? `${ticket.managerName} (ID: ${ticket.managerId})` : "—",
            ticket.managedAt ? new Date(ticket.managedAt).toLocaleString() : "—",
            ticket.comment || "Нет",
            ticket.document.documentNumber,
            ticket.document.documentType,
            ticket.document.documentDate,
            ticket.document.supplier || "—",
            ticket.document.customer || "—",
            ticket.inventory.id,
            ticket.inventory.nomenclatureName || "—",
            ticket.quantity,
            ticket.inventory.warehouseZoneId,
            ticket.inventory.containerSerial,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${ticketType}_tickets_${status.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    label: "НЕИЗВЕСТНО",
                };
        }
    };

    const renderTicketCard = (ticket) => {
        const statusStyles = getStatusStyles(ticket.status);
        const actionLabel = ticketType === "sales" ? "продажу" : "списание";
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

                <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-600">Документ</h4>
                    <p className="text-xs text-gray-800">
                        №: {ticket.document.documentNumber} ({ticket.document.documentType})
                    </p>
                    <p className="text-xs text-gray-600">
                        Дата: {ticket.document.documentDate}
                    </p>
                    <p className="text-xs text-gray-600">
                        Поставщик: {ticket.document.supplier || "—"}
                    </p>
                    <p className="text-xs text-gray-600">
                        Клиент: {ticket.document.customer || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                        Создан: {new Date(ticket.document.createdAt).toLocaleString()} (ID:{" "}
                        {ticket.document.createdBy})
                    </p>
                </div>

                <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-600">Заявка</h4>
                    <p className="text-xs text-gray-800">Тип: {ticket.type}</p>
                    <p className="text-xs text-gray-600">
                        Автор: {ticket.createdByName} (ID: {ticket.createdBy})
                    </p>
                    <p className="text-xs text-gray-600">
                        Создано: {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                        Одобрил: {ticket.managerName || "Не одобрено"} (ID:{" "}
                        {ticket.managerId || "—"})
                    </p>
                    <p className="text-xs text-gray-500">
                        Дата одобрения:{" "}
                        {ticket.managedAt ? new Date(ticket.managedAt).toLocaleString() : "—"}
                    </p>
                    <p className="text-xs text-gray-600">
                        Комментарий: {ticket.comment || "Нет"}
                    </p>
                </div>

                <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-600">Инвентарь</h4>
                    <p className="text-xs text-gray-800">ID: {ticket.inventory.id}</p>
                    <p className="text-xs text-gray-600">
                        Товар: {ticket.inventory.nomenclatureName || "—"}
                    </p>
                    <p className="text-xs text-gray-600">Количество: {ticket.quantity}</p>
                    <p className="text-xs text-gray-600">
                        Зона склада: {ticket.inventory.warehouseZoneId}
                    </p>
                    <p className="text-xs text-gray-600">
                        Серийный №: {ticket.inventory.containerSerial}
                    </p>
                    <p className="text-xs text-gray-500">
                        Создан: {new Date(ticket.inventory.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                        Обновлен: {new Date(ticket.inventory.updatedAt).toLocaleString()}
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <ConfirmationWrapper
                        title="Подтверждение удаления"
                        message="Вы уверены, что хотите удалить эту заявку?"
                        onConfirm={() => handleCancelTicket(ticket.id)}
                    >
                        <button
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors text-sm"
                            disabled={loading}
                        >
                            Удалить
                        </button>
                    </ConfirmationWrapper>

                    {ticket.status === "ACTIVE" && (
                        <ConfirmationWrapper
                            title="Подтверждение одобрения"
                            message="Вы уверены, что хотите одобрить эту заявку?"
                            onConfirm={() => handleApproveTicket(ticket.id)}
                        >
                            <button
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm transition-colors duration-200"
                                disabled={loading}
                            >
                                Одобрить
                            </button>
                        </ConfirmationWrapper>
                    )}
                </div>
            </div>
        );
    };

    const activeTickets = tickets.filter((ticket) => ticket.status === "ACTIVE");
    const allowedTickets = tickets.filter((ticket) => ticket.status === "ALLOWED");
    const completedTickets = tickets.filter((ticket) => ticket.status === "COMPLETED");

    const actionTitle = ticketType === "sales" ? "продажу" : "списание";

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="flex flex-col gap-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Одобрение заявок на {actionTitle}
                    </h1>
                    {/* Поля для выбора дат справа */}
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
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Ожидающие одобрения
                                </h2>
                                {activeTickets.length > 0 && (
                                    <button
                                        onClick={() => exportToCSV(activeTickets, "ACTIVE")}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors duration-200"
                                    >
                                        Экспорт в CSV
                                    </button>
                                )}
                            </div>
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

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Одобренные заявки
                                </h2>
                                {allowedTickets.length > 0 && (
                                    <button
                                        onClick={() => exportToCSV(allowedTickets, "ALLOWED")}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors duration-200"
                                    >
                                        Экспорт в CSV
                                    </button>
                                )}
                            </div>
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

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Выполненные заявки
                                </h2>
                                {completedTickets.length > 0 && (
                                    <button
                                        onClick={() => exportToCSV(completedTickets, "COMPLETED")}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors duration-200"
                                    >
                                        Экспорт в CSV
                                    </button>
                                )}
                            </div>
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

export default AdminTicketApprovalPage;