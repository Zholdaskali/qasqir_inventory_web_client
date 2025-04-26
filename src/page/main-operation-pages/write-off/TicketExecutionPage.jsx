import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCalendarDate } from "react-icons/ci";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";

import {
  API_GET_TICKETS_BY_TYPE,
  API_COMPLETE_WRITE_OFF_TICKET,
  API_DELETE_TICKET,
  API_COMPLETE_BATCH_TICKETS,
} from "../../../api/API";

const TicketExecutionPage = () => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketType, setTicketType] = useState("WRITE-OFF");
  const [expandedDocs, setExpandedDocs] = useState({});

  // Установка начальных дат: сегодня и 3 дня назад
  const today = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);

  const [startDate, setStartDate] = useState(threeDaysAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));

  // Проверка валидности формы
  const isFormValid = useCallback(() => {
    return startDate && endDate && new Date(startDate) <= new Date(endDate);
  }, [startDate, endDate]);

  const fetchTickets = useCallback(async () => {
    if (!authToken || !isFormValid()) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_GET_TICKETS_BY_TYPE.replace("{type}", ticketType)}`,
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
  }, [authToken, ticketType, startDate, endDate, isFormValid]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleExecuteTicket = async (ticketId) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_COMPLETE_WRITE_OFF_TICKET.replace("{ticketId}", ticketId)}`,
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

  const handleBatchExecute = async (ticketIds) => {
    try {
      setLoading(true);
      const payload = {
        ticketIds,
        managedId: userId,
      };
      const response = await axios.put(
        API_COMPLETE_BATCH_TICKETS,
        payload,
        {
          headers: { "Auth-token": authToken },
        }
      );
      toast.success(response?.data?.message || "Заявки успешно выполнены");
      setTickets((prev) =>
        prev.map((ticket) =>
          ticketIds.includes(ticket.id)
            ? { ...ticket, status: "COMPLETED" }
            : ticket
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при массовом выполнении заявок");
      console.error(`Batch execute ${ticketType} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_DELETE_TICKET.replace("{ticketId}", ticketId)}`,
        { headers: { "Auth-token": authToken } }
      );
      toast.success(response?.data?.message || "Заявка успешно отменена");
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
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

  const groupTicketsByDocument = (tickets) => {
    return tickets.reduce((acc, ticket) => {
      const docId = ticket.document?.id || "unknown";
      if (!acc[docId]) {
        acc[docId] = {
          document: ticket.document || { documentNumber: "Неизвестный документ" },
          tickets: [],
        };
      }
      acc[docId].tickets.push(ticket);
      return acc;
    }, {});
  };

  const toggleDocument = (docId) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const renderTicketCard = (ticket) => {
    const statusStyles = getStatusStyles(ticket.status);
    const actionLabel = ticketType === "SALES" ? "продажу" : "списание";
    return (
      <div
        key={ticket.id}
        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Заявка на {actionLabel} #{ticket.id}
          </h3>
          <div
            className={`${statusStyles.bg} inline-flex items-center px-2 py-1 rounded-full text-xs`}
          >
            <div className={`${statusStyles.dot} h-2 w-2 rounded-full mr-1`} />
            <span className={statusStyles.text}>{statusStyles.label}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Номер документа:</span>{" "}
            {ticket.document?.documentNumber || "—"}
          </p>
          <p>
            <span className="font-medium">Дата:</span>{" "}
            {ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleDateString()
              : "—"}
          </p>
          <p>
            <span className="font-medium">Товар:</span>{" "}
            {ticket.inventory?.nomenclatureName || "Неизвестно"}
          </p>
          <p>
            <span className="font-medium">Количество:</span> {ticket.quantity || 0}
          </p>
          <p>
            <span className="font-medium">Комментарий или причина:</span>{" "}
            {ticket.comment || "—"}
          </p>
          {ticket.status === "ALLOWED" && (
            <p className="text-green-600 text-right">
              <span className="font-medium">Одобрено:</span>{" "}
              {ticket.managerName || "Неизвестный менеджер"}
            </p>
          )}
        </div>

        {ticket.status === "ALLOWED" && (
          <div className="flex justify-end mt-4 gap-2">
            <ConfirmationWrapper
              title="Подтверждение выполнения"
              message={`Вы уверены, что хотите выполнить заявку #${ticket.id} на ${actionLabel}?`}
              onConfirm={() => handleExecuteTicket(ticket.id)}
            >
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
                disabled={loading || !isFormValid()}
              >
                Выполнить
              </button>
            </ConfirmationWrapper>
            <ConfirmationWrapper
              title="Подтверждение отмены"
              message={`Вы уверены, что хотите отменить заявку #${ticket.id} на ${actionLabel}?`}
              onConfirm={() => handleCancelTicket(ticket.id)}
            >
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors text-sm font-medium"
                disabled={loading || !isFormValid()}
              >
                Отменить
              </button>
            </ConfirmationWrapper>
          </div>
        )}
      </div>
    );
  };

  const renderDocumentGroup = (documentGroup, status) => {
    const allowedTicketIds = documentGroup.tickets
      .filter((ticket) => ticket.status === "ALLOWED")
      .map((ticket) => ticket.id);
    const docId = documentGroup.document.id || "unknown";
    const isExpanded = expandedDocs[docId] ?? true;

    return (
      <div key={docId} className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={() => toggleDocument(docId)}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Документ #{documentGroup.document.documentNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Тип: {documentGroup.document.documentType || "—"} | Дата:{" "}
              {documentGroup.document.documentDate || "—"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {allowedTicketIds.length > 0 && status === "ALLOWED" && (
              <ConfirmationWrapper
                title="Подтверждение массового выполнения"
                message={`Вы уверены, что хотите выполнить все одобренные заявки (${allowedTicketIds.length}) для этого документа?`}
                onConfirm={() => handleBatchExecute(allowedTicketIds)}
              >
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                  disabled={loading || !isFormValid()}
                >
                  Выполнить все ({allowedTicketIds.length})
                </button>
              </ConfirmationWrapper>
            )}
            {isExpanded ? (
              <FaChevronUp className="text-gray-600" />
            ) : (
              <FaChevronDown className="text-gray-600" />
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentGroup.tickets
                .filter((ticket) => ticket.status === status)
                .map(renderTicketCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const groupedTickets = groupTicketsByDocument(tickets);
  const activeDocuments = Object.values(groupedTickets).filter((group) =>
    group.tickets.some((ticket) => ticket.status === "ACTIVE")
  );
  const allowedDocuments = Object.values(groupedTickets).filter((group) =>
    group.tickets.some((ticket) => ticket.status === "ALLOWED")
  );
  const completedDocuments = Object.values(groupedTickets).filter((group) =>
    group.tickets.some((ticket) => ticket.status === "COMPLETED")
  );

  const actionTitle = ticketType === "SALES" ? "продажу" : "списание";

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Список заявок на {actionTitle}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Управление заявками на {actionTitle}
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Фильтры */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Фильтры</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Тип заявки *
              </label>
              <select
                value={ticketType}
                onChange={handleTypeChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading}
              >
                <option value="WRITE-OFF">Утилизация</option>
                <option value="SALES">Продажа</option>
                <option value="PRODUCTION">Производство</option>
                <option value="1C-SALES">1C-Продажа</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                <CiCalendarDate /> Начальная дата *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                <CiCalendarDate /> Конечная дата *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 text-sm"
                disabled={loading}
              />
            </div>
          </div>
        </section>

        {/* Список заявок */}
        {loading ? (
          <div className="text-center text-lg text-gray-600">Загрузка...</div>
        ) : (
          <section className="space-y-6">
            {/* Ожидающие заявки */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                Ожидающие выполнения
              </h2>
              {activeDocuments.length > 0 ? (
                activeDocuments.map((group) => renderDocumentGroup(group, "ACTIVE"))
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Ожидающие заявки отсутствуют
                </p>
              )}
            </div>

            {/* Одобренные заявки */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                Одобренные заявки
              </h2>
              {allowedDocuments.length > 0 ? (
                allowedDocuments.map((group) => renderDocumentGroup(group, "ALLOWED"))
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Одобренные заявки отсутствуют
                </p>
              )}
            </div>

            {/* Выполненные заявки */}
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                Выполненные заявки
              </h2>
              {completedDocuments.length > 0 ? (
                completedDocuments.map((group) => renderDocumentGroup(group, "COMPLETED"))
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Выполненные заявки отсутствуют
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TicketExecutionPage;