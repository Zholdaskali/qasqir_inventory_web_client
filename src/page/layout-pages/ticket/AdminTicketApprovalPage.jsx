import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CiCalendarDate } from 'react-icons/ci';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ConfirmationWrapper from '../../../components/ui/ConfirmationWrapper';
import {
  API_GET_TICKETS_BY_TYPE,
  API_DELETE_TICKET,
  API_ALLOW_TICKET,
  API_ALLOW_BATCH_TICKETS,
} from '../../../api/API';
import {
  fetchTicketsStart,
  fetchTicketsSuccess,
  fetchTicketsFailure,
  updateTicket,
  deleteTicket,
  clearTickets,
} from '../../../store/slices/layout/ticket/ticketApprovalSlice';

const AdminTicketApprovalPage = ({ ticketType, onTabChange }) => {
  console.log('AdminBatchTicketApprovalPage.jsx loaded');
  const authToken = useSelector((state) => state.token.token);
  const adminId = useSelector((state) => state.user.userId);
  const { ticketsByType = {}, loading = false, error = null } = useSelector(
    (state) => {
      console.log('Redux state:', state.ticketApproval);
      return state.ticketApproval || {};
    }
  );
  const tickets = ticketsByType[ticketType] || [];
  const dispatch = useDispatch();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [hasFetchedByType, setHasFetchedByType] = useState({});
  const [expandedDocs, setExpandedDocs] = useState({});

  const fetchTickets = useCallback(
    async (forceFetch = false) => {
      if (!forceFetch && hasFetchedByType[ticketType]) {
        return;
      }

      if (!authToken) {
        toast.error('Токен авторизации отсутствует');
        dispatch(fetchTicketsFailure('Токен авторизации отсутствует'));
        return;
      }

      if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
        toast.error('Пожалуйста, выберите корректный диапазон дат');
        dispatch(fetchTicketsFailure('Некорректный диапазон дат'));
        return;
      }

      try {
        dispatch(fetchTicketsStart());
        const response = await axios.get(
          API_GET_TICKETS_BY_TYPE.replace('{type}', ticketType),
          {
            headers: { 'Auth-token': authToken },
            params: {
              startDate,
              endDate,
            },
          }
        );
        const ticketData = Array.isArray(response.data.body)
          ? response.data.body
          : [];
        dispatch(fetchTicketsSuccess({ ticketType, tickets: ticketData }));
        setHasFetchedByType((prev) => ({ ...prev, [ticketType]: true }));
        toast.success(
          `Заявки на ${ticketType === 'sales' ? 'продажу' : 'списание'} загружены`
        );
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          `Ошибка загрузки заявок на ${
            ticketType === 'sales' ? 'продажу' : 'списание'
          }`;
        dispatch(fetchTicketsFailure(errorMessage));
        setHasFetchedByType((prev) => ({ ...prev, [ticketType]: true }));
        toast.error(errorMessage);
      }
    },
    [authToken, ticketType, startDate, endDate, dispatch]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, ticketType]);

  const handleCancelTicket = async (ticketId) => {
    try {
      dispatch(fetchTicketsStart());
      const response = await axios.delete(
        API_DELETE_TICKET.replace('{ticketId}', ticketId),
        { headers: { 'Auth-token': authToken } }
      );
      toast.success(response?.data?.message || 'Заявка успешно отменена');
      dispatch(deleteTicket({ ticketId, ticketType }));
      await fetchTickets(true);
    } catch (error) {
      dispatch(fetchTicketsFailure(error.response?.data?.message || 'Ошибка при отмене заявки'));
      toast.error(error.response?.data?.message || 'Ошибка при отмене заявки');
    }
  };

  const handleApproveTicket = async (ticketId) => {
    try {
      dispatch(fetchTicketsStart());
      const payload = { ticketId, managed_id: adminId };
      const response = await axios.put(API_ALLOW_TICKET, payload, {
        headers: { 'Auth-token': authToken },
      });
      console.log('Approve response:', response.data);
      toast.success(response?.data?.message || 'Заявка успешно одобрена');
      dispatch(
        updateTicket({
          id: ticketId,
          status: 'ALLOWED',
          managerId: adminId,
          managedAt: new Date().toISOString(),
          ticketType,
        })
      );
      await fetchTickets(true);
    } catch (error) {
      dispatch(fetchTicketsFailure(error.response?.data?.message || 'Ошибка при одобрении заявки'));
      toast.error(error.response?.data?.message || 'Ошибка при одобрении заявки');
    }
  };

  const handleBatchApprove = async (ticketIds) => {
    try {
      dispatch(fetchTicketsStart());
      const payload = {
        ticketIds,
        managedId: adminId,
      };
      const response = await axios.put(
        API_ALLOW_BATCH_TICKETS,
        payload,
        {
          headers: { 'Auth-token': authToken },
        }
      );
      console.log('Batch approve response:', response.data);
      toast.success(response?.data?.message || 'Заявки успешно одобрены');
      ticketIds.forEach((ticketId) => {
        dispatch(
          updateTicket({
            id: ticketId,
            status: 'ALLOWED',
            managerId: adminId,
            managedAt: new Date().toISOString(),
            ticketType,
          })
        );
      });
      await fetchTickets(true);
    } catch (error) {
      dispatch(fetchTicketsFailure(error.response?.data?.message || 'Ошибка при массовом одобрении заявок'));
      toast.error(error.response?.data?.message || 'Ошибка при массовом одобрении заявок');
    }
  };

  const exportToCSV = (tickets, status) => {
    const headers = [
      'ID Заявки',
      'Статус',
      'Тип',
      'Автор',
      'Дата создания',
      'Одобрил',
      'Дата одобрения',
      'Комментарий',
      '№ Документа',
      'Тип документа',
      'Дата документа',
      'Поставщик',
      'Клиент',
      'ID Инвентаря',
      'Название товара',
      'Количество',
      'Зона склада',
      'Серийный №',
    ];

    const rows = tickets.map((ticket) => [
      ticket.id,
      ticket.status,
      ticket.type,
      `${ticket.createdByName} (ID: ${ticket.createdBy})`,
      new Date(ticket.createdAt).toLocaleString(),
      ticket.managerName
        ? `${ticket.managerName} (ID: ${ticket.managerId})`
        : '—',
      ticket.managedAt ? new Date(ticket.managedAt).toLocaleString() : '—',
      ticket.comment || 'Нет',
      ticket.document.documentNumber,
      ticket.document.documentType,
      ticket.document.documentDate,
      ticket.document.supplier || '—',
      ticket.document.customer || '—',
      ticket.inventory.id,
      ticket.inventory.nomenclatureName || '—',
      ticket.quantity,
      ticket.inventory.warehouseZoneId,
      ticket.inventory.containerSerial,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${ticketType}_tickets_${status.toLowerCase()}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Экспорт в CSV выполнен');
  };

  const handleApplyDates = () => {
    dispatch(clearTickets(ticketType));
    setHasFetchedByType((prev) => ({ ...prev, [ticketType]: false }));
    fetchTickets(true);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-orange-100',
          dot: 'bg-orange-500',
          text: 'text-orange-700',
          label: 'ОЖИДАЕТСЯ',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-green-100',
          dot: 'bg-green-500',
          text: 'text-green-700',
          label: 'ВЫПОЛНЕНА',
        };
      case 'ALLOWED':
        return {
          bg: 'bg-blue-100',
          dot: 'bg-blue-500',
          text: 'text-blue-700',
          label: 'ОДОБРЕНА',
        };
      default:
        return {
          bg: 'bg-gray-100',
          dot: 'bg-gray-500',
          text: 'text-gray-700',
          label: 'НЕИЗВЕСТНО',
        };
    }
  };

  const groupTicketsByDocument = (tickets) => {
    return tickets.reduce((acc, ticket) => {
      const docId = ticket.document.id;
      if (!acc[docId]) {
        acc[docId] = {
          document: ticket.document,
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
    const actionLabel = ticketType === 'sales' ? 'продажу' : 'списание';
    return (
      <div
        key={ticket.id}
        className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
      >
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Заявка #{ticket.id} на {actionLabel}
          </h3>
          <div
            className={`${statusStyles.bg} inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
          >
            <div className={`${statusStyles.dot} h-2 w-2 rounded-full mr-1`} />
            <span className={statusStyles.text}>{statusStyles.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Заявка</h4>
            <p className="text-sm text-gray-600"><span className="font-medium">Тип:</span> {ticket.type}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Автор:</span> {ticket.createdByName}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Создано:</span> {new Date(ticket.createdAt).toLocaleString()}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Одобрил:</span> {ticket.managerName || 'Не одобрено'}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Дата одобрения:</span> {ticket.managedAt ? new Date(ticket.managedAt).toLocaleString() : '—'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Инвентарь</h4>
            <p className="text-sm text-gray-600"><span className="font-medium">ID:</span> {ticket.inventory.id}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Товар:</span> {ticket.inventory.nomenclatureName || '—'}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Количество:</span> {ticket.quantity}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Зона склада:</span> {ticket.inventory.warehouseZoneId}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Серийный №:</span> {ticket.inventory.containerSerial || '—'}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
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

          {ticket.status === 'ACTIVE' && (
            <ConfirmationWrapper
              title="Подтверждение одобрения"
              message="Вы уверены, что хотите одобрить эту заявку?"
              onConfirm={() => handleApproveTicket(ticket.id)}
            >
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm"
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

  const renderDocumentGroup = (documentGroup, status) => {
    const activeTicketIds = documentGroup.tickets
      .filter((ticket) => ticket.status === 'ACTIVE')
      .map((ticket) => ticket.id);
    const docId = documentGroup.document.id;
    const isExpanded = expandedDocs[docId] ?? true;

    return (
      <div key={docId} className="mb-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          onClick={() => toggleDocument(docId)}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Документ #{documentGroup.document.documentNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Тип: {documentGroup.document.documentType} | Дата: {documentGroup.document.documentDate}
            </p>
            <p className="text-sm text-gray-600">
              Поставщик: {documentGroup.document.supplier || '—'} | Клиент: {documentGroup.document.customer || '—'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activeTicketIds.length > 0 && status === 'ACTIVE' && (
              <ConfirmationWrapper
                title="Подтверждение массового одобрения"
                message={`Вы уверены, что хотите одобрить все активные заявки (${activeTicketIds.length}) для этого документа?`}
                onConfirm={() => handleBatchApprove(activeTicketIds)}
              >
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                  disabled={loading}
                >
                  Одобрить все ({activeTicketIds.length})
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    group?.tickets?.some((ticket) => ticket.status === 'ACTIVE') || false
  );
  const allowedDocuments = Object.values(groupedTickets).filter((group) =>
    group?.tickets?.some((ticket) => ticket.status === 'ALLOWED') || false
  );
  const completedDocuments = Object.values(groupedTickets).filter((group) =>
    group?.tickets?.some((ticket) => ticket.status === 'COMPLETED') || false
  );

  const actionTitle = ticketType === 'sales' ? 'продажу' : 'списание';

  return (
    <div className="w-full h-full px-4 py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={2}
        className="mt-20"
        toastClassName="text-sm max-w-sm p-3 rounded-lg shadow-md"
        bodyClassName="text-sm"
      />
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Одобрение заявок на {actionTitle}
            </h1>
            <button
              onClick={handleApplyDates}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              disabled={loading}
            >
              Применить фильтр
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="flex-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                <CiCalendarDate className="w-5 h-5" /> Начало
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-1">
                <CiCalendarDate className="w-5 h-5" /> Конец
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-lg text-gray-600">Загрузка...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 text-base">
            Ошибка: {error}
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Ожидающие одобрения
                </h2>
                {activeDocuments.length > 0 && (
                  <button
                    onClick={() =>
                      exportToCSV(
                        activeDocuments.flatMap((group) =>
                          group.tickets.filter((t) => t.status === 'ACTIVE')
                        ),
                        'ACTIVE'
                      )
                    }
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors"
                  >
                    Экспорт в CSV
                  </button>
                )}
              </div>
              {activeDocuments.length > 0 ? (
                activeDocuments.map((group, index) =>
                  group ? (
                    <div key={group.document.id || index}>
                      {renderDocumentGroup(group, 'ACTIVE')}
                    </div>
                  ) : null
                )
              ) : (
                <div className="text-center py-4 text-gray-500 text-base">
                  Ожидающие заявки отсутствуют
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Одобренные заявки
                </h2>
                {allowedDocuments.length > 0 && (
                  <button
                    onClick={() =>
                      exportToCSV(
                        allowedDocuments.flatMap((group) =>
                          group.tickets.filter((t) => t.status === 'ALLOWED')
                        ),
                        'ALLOWED'
                      )
                    }
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors"
                  >
                    Экспорт в CSV
                  </button>
                )}
              </div>
              {allowedDocuments.length > 0 ? (
                allowedDocuments.map((group, index) =>
                  group ? (
                    <div key={group.document.id || index}>
                      {renderDocumentGroup(group, 'ALLOWED')}
                    </div>
                  ) : null
                )
              ) : (
                <div className="text-center py-4 text-gray-500 text-base">
                  Одобренные заявки отсутствуют
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Выполненные заявки
                </h2>
                {completedDocuments.length > 0 && (
                  <button
                    onClick={() =>
                      exportToCSV(
                        completedDocuments.flatMap((group) =>
                          group.tickets.filter((t) => t.status === 'COMPLETED')
                        ),
                        'COMPLETED'
                      )
                    }
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors"
                  >
                    Экспорт в CSV
                  </button>
                )}
              </div>
              {completedDocuments.length > 0 ? (
                completedDocuments.map((group, index) =>
                  group ? (
                    <div key={group.document.id || index}>
                      {renderDocumentGroup(group, 'COMPLETED')}
                    </div>
                  ) : null
                )
              ) : (
                <div className="text-center py-4 text-gray-500 text-base">
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