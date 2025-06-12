import React, { useState, Component } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  BeakerIcon,
  ShoppingCartIcon,
} from '@heroicons/react/20/solid';
import { API_GET_DOCUMENTS_WITH_TRANSACTIONS } from '../../../api/API';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 text-red-700 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
          Произошла ошибка: {this.state.error?.message || 'Неизвестная ошибка'}
        </div>
      );
    }
    return this.props.children;
  }
}

// Function to get transaction type styling and label
const getTransactionStyle = (type) => {
  switch (type) {
    case '1C-SALES':
      return { className: 'bg-green-100 text-green-600', label: '1С-Продажа', icon: ShoppingCartIcon };
    case 'INCOMING':
      return { className: 'bg-blue-100 text-blue-600', label: 'Поступление', icon: ArrowDownIcon };
    case 'TRANSFER':
      return { className: 'bg-purple-100 text-purple-600', label: 'Перемещение', icon: ArrowRightIcon };
    case 'WRITE-OFF':
      return { className: 'bg-red-100 text-red-600', label: 'Утилизация', icon: TrashIcon };
    case 'RETURN':
      return { className: 'bg-orange-100 text-orange-600', label: 'Возврат', icon: ArrowUturnLeftIcon };
    case 'PRODUCTION':
      return { className: 'bg-indigo-100 text-indigo-600', label: 'Производство', icon: BeakerIcon };
    case 'SALES':
      return { className: 'bg-green-100 text-green-600', label: 'Продажа', icon: ShoppingCartIcon };
    default:
      return { className: 'bg-gray-100 text-gray-600', label: 'Неизвестно', icon: null };
  }
};

// Function to get quantity sign based on transaction type
const getQuantitySign = (type) => {
  switch (type) {
    case 'INCOMING':
    case 'RETURN':
    case 'PRODUCTION':
      return '+';
    case '1C-SALES':
    case 'SALES':
    case 'WRITE-OFF':
      return '-';
    case 'TRANSFER':
      return '+'; // Neutral, assuming no loss/gain; adjust if API specifies direction
    default:
      return ''; // No sign for unknown types
  }
};

// Function to export transactions to CSV
const exportTransactionsToCSV = (transactions, nomenclatureCode, startDate, endDate) => {
  try {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      throw new Error('Транзакции отсутствуют или имеют неверный формат');
    }

    const headers = [
      'Тип',
      'Номенклатура',
      'Количество',
      'Дата',
      'Склад',
      'Зона',
      'Контейнер',
      'Создатель',
    ];

    const rows = transactions.map((item) => {
      const quantity = item.quantity != null ? item.quantity : item.transactionDTO?.quantity;
      const sign = getQuantitySign(item.transactionDTO?.transactionType);
      const formattedQuantity = quantity != null ? `${sign}${quantity}` : 'N/A';
      return [
        `"${getTransactionStyle(item.transactionDTO?.transactionType).label || 'N/A'}"`,
        `"${item.transactionDTO?.nomenclatureName || 'N/A'}"`,
        `"${formattedQuantity}"`,
        item.transactionDTO?.createdAt ? `"${new Date(item.transactionDTO.createdAt).toLocaleString('ru-RU')}"` : '"N/A"',
        `"${item.warehouseZoneDTO?.warehouseName || 'N/A'}"`,
        `"${item.warehouseZoneDTO?.name || 'N/A'}"`,
        `"${item.warehouseContainerDTO?.serialNumber || 'N/A'}"`,
        `"${item.transactionDTO?.createdBy || 'N/A'}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((row) => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transactions_${nomenclatureCode || 'unknown'}_${startDate || 'no-start'}_${endDate || 'no-end'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Экспорт транзакций для кода ${nomenclatureCode || 'unknown'} выполнен успешно`);
  } catch (error) {
    toast.error('Ошибка при экспорте в CSV: ' + (error.message || 'Неизвестная ошибка'));
    console.error('Ошибка экспорта CSV:', error);
  }
};

const TransactionHistoryPage = () => {
  const [nomenclatureCode, setNomenclatureCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const authToken = useSelector((state) => state.token.token);
  const API_BASE_URL = API_GET_DOCUMENTS_WITH_TRANSACTIONS;

  const fetchTransactions = async (code, start, end, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/${code}`, {
        headers: { 'Auth-token': authToken },
        params: {
          startDate: start,
          endDate: end,
          page: pageNum,
          size: pageSize,
        },
      });
      const data = response.data;
      if (data.body && Array.isArray(data.body)) {
        setTransactions(data.body);
        setTotalPages(data.totalPages || 1);
      } else {
        setTransactions([]);
        toast.error('Данные не получены или имеют неверный формат');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка при загрузке данных';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!nomenclatureCode.trim()) {
      toast.error('Введите код номенклатуры');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Выберите начальную и конечную даты');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Начальная дата не может быть позже конечной');
      return;
    }
    setPage(0);
    fetchTransactions(nomenclatureCode, startDate, endDate, 0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchTransactions(nomenclatureCode, startDate, endDate, newPage);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-white sm:bg-gray-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
          <h1 className="text-base sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
            История транзакций по номенклатуре
          </h1>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4">
            <input
              type="text"
              value={nomenclatureCode}
              onChange={(e) => setNomenclatureCode(e.target.value)}
              placeholder="Введите код номенклатуры"
              className="w-full sm:w-64 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Начальная дата"
              className="w-full sm:w-44 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Конечная дата"
              className="w-full sm:w-44 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Загрузка...' : 'Поиск'}
            </button>
            {transactions.length > 0 && (
              <button
                onClick={() => exportTransactionsToCSV(transactions, nomenclatureCode, startDate, endDate)}
                className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600"
              >
                Экспорт в CSV
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 sm:p-4 rounded-lg mb-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Тип</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Номенклатура</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Количество</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Дата</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Склад</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Зона</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Контейнер</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Ответственный</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && !loading && (
                  <tr>
                    <td colSpan="8" className="px-2 sm:px-4 py-3 sm:py-4 text-center text-gray-500">
                      Нет данных для отображения
                    </td>
                  </tr>
                )}
                {transactions.map((item, index) => {
                  const { className, label, icon: Icon } = getTransactionStyle(item.transactionDTO?.transactionType);
                  const quantity = item.quantity != null ? item.quantity : item.transactionDTO?.quantity;
                  const sign = getQuantitySign(item.transactionDTO?.transactionType);
                  const formattedQuantity = quantity != null ? `${sign}${quantity}` : '-';
                  return (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}
                        >
                          {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                          {label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{item.transactionDTO?.nomenclatureName || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{formattedQuantity}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        {item.transactionDTO?.createdAt
                          ? new Date(item.transactionDTO.createdAt).toLocaleDateString('ru-RU')
                          : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{item.warehouseZoneDTO?.warehouseName || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{item.warehouseZoneDTO?.name || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{item.warehouseContainerDTO?.serialNumber || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{item.transactionDTO?.createdBy || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="flex justify-between items-center mt-3 sm:mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || loading}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Предыдущая
            </button>
            <span className="text-xs sm:text-sm text-gray-600">
              Страница {page + 1} из {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Следующая
            </button>
          </div>
        )}

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
          className="mt-16 sm:mt-20"
          toastClassName="text-xs sm:text-sm w-[90%] sm:max-w-sm mx-auto sm:mx-0 p-2 sm:p-3 rounded-lg shadow-md"
          bodyClassName="text-xs sm:text-sm"
        />
      </div>
    </ErrorBoundary>
  );
};

export default TransactionHistoryPage;
