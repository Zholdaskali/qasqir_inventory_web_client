import React, { useState, useEffect, Component } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Notification from '../../../components/notification/Notification';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  BeakerIcon,
  ShoppingCartIcon,
  ArrowUpIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/20/solid';
import { API_GET_DOCUMENTS_WITH_TRANSACTIONS } from '../../../api/API';
import * as XLSX from 'xlsx';

// Компонент для обработки ошибок
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-sm text-xs">
          Ошибка: {this.state.error?.message || 'Неизвестная ошибка'}
        </div>
      );
    }
    return this.props.children;
  }
}

// Получение стиля для типа транзакции
const getTransactionStyle = (type) => {
  switch (type) {
    case '1C-SALES':
      return { className: 'bg-green-50 text-green-700', label: '1С-Продажа', icon: ShoppingCartIcon };
    case 'INCOMING':
      return { className: 'bg-blue-50 text-blue-700', label: 'Поступление', icon: ArrowDownIcon };
    case 'TRANSFER':
      return { className: 'bg-purple-50 text-purple-700', label: 'Перемещение', icon: ArrowRightIcon };
    case 'WRITE-OFF':
      return { className: 'bg-red-50 text-red-700', label: 'Списание', icon: TrashIcon };
    case 'RETURN':
      return { className: 'bg-orange-50 text-orange-700', label: 'Возврат', icon: ArrowUturnLeftIcon };
    case 'PRODUCTION':
      return { className: 'bg-indigo-50 text-indigo-700', label: 'Производство', icon: BeakerIcon };
    case 'SALES':
      return { className: 'bg-green-50 text-green-700', label: 'Продажа', icon: ShoppingCartIcon };
    default:
      return { className: 'bg-gray-50 text-gray-700', label: 'Неизвестно', icon: null };
  }
};

// Получение знака и иконки для количества
const getQuantitySign = (type, placementType) => {
  switch (type) {
    case 'INCOMING':
    case 'RETURN':
    case 'PRODUCTION':
      return { sign: '+', className: 'text-green-600 font-semibold', icon: ArrowDownIcon };
    case '1C-SALES':
    case 'SALES':
    case 'WRITE-OFF':
      return { sign: '-', className: 'text-red-600 font-semibold', icon: ArrowUpIcon };
    case 'TRANSFER':
      if (placementType === 'OUT') {
        return { sign: '-', className: 'text-red-600 font-semibold', icon: ArrowUpIcon };
      } else if (placementType === 'IN') {
        return { sign: '+', className: 'text-green-600 font-semibold', icon: ArrowDownIcon };
      }
      toast.warn('Неизвестное направление перемещения для транзакции');
      return { sign: '', className: 'text-gray-600', icon: null };
    default:
      return { sign: '', className: 'text-gray-600', icon: null };
  }
};

// Форматирование даты
const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Экспорт транзакций в Excel
const exportTransactionsToExcel = (transactions, nomenclatureCode, startDate, endDate) => {
  try {
    if (!transactions?.length) {
      throw new Error('Транзакции отсутствуют');
    }

    const headers = [
      'Дата',
      'Тип',
      'Направление',
      'Номенклатура',
      'Количество',
      'Склад',
      'Зона',
      'Контейнер',
      'Создатель',
    ];

    const data = transactions.map((item) => {
      const quantity = item.quantity ?? 'N/A';
      const { sign } = getQuantitySign(item.transactionDTO?.transactionType, item.placementType);
      const formattedQuantity = quantity !== 'N/A' ? `${sign}${quantity}` : 'N/A';
      return {
        Дата: formatDate(item.transactionDTO?.createdAt),
        Тип: getTransactionStyle(item.transactionDTO?.transactionType).label,
        Направление: item.transactionDTO?.transactionType === 'TRANSFER' ? (item.placementType === 'IN' ? 'Входящее' : 'Исходящее') : '-',
        Номенклатура: item.transactionDTO?.nomenclatureName || 'N/A',
        Количество: formattedQuantity,
        Склад: item.warehouseZoneDTO?.warehouseName || 'N/A',
        Зона: item.warehouseZoneDTO?.name || 'N/A',
        Контейнер: item.warehouseContainerDTO?.serialNumber || 'N/A',
        Создатель: item.transactionDTO?.createdBy || 'N/A',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(
      workbook,
      `transactions_${nomenclatureCode || 'unknown'}_${startDate || 'no-start'}_${endDate || 'no-end'}.xlsx`
    );
    toast.success(`Экспорт транзакций в Excel для кода ${nomenclatureCode || 'unknown'} выполнен`);
  } catch (error) {
    toast.error('Ошибка экспорта в Excel: ' + (error.message || 'Неизвестная ошибка'));
    console.error('Ошибка экспорта Excel:', error);
  }
};

// Компонент для отображения сводки движения товаров
const GoodsMovementSummary = ({ transactions, totalQuantity }) => {
  const incoming = transactions
    .filter((t) =>
      ['INCOMING', 'RETURN', 'PRODUCTION'].includes(t.transactionDTO?.transactionType) ||
      (t.transactionDTO?.transactionType === 'TRANSFER' && t.placementType === 'IN')
    )
    .reduce((sum, t) => sum + (t.quantity || 0), 0);
  const outgoing = transactions
    .filter((t) =>
      ['1C-SALES', 'SALES', 'WRITE-OFF'].includes(t.transactionDTO?.transactionType) ||
      (t.transactionDTO?.transactionType === 'TRANSFER' && t.placementType === 'OUT')
    )
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
        <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
        Движение товаров
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600">Поступления</p>
          <p className="text-lg font-bold text-green-600">+{incoming}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600">Списания</p>
          <p className="text-lg font-bold text-red-600">-{outgoing}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600">Итого на сегодня</p>
          <p className="text-lg font-bold text-blue-600">{totalQuantity}</p>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения хронологии
const TimelineView = ({ transactions }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Хронология движения товара</h2>
      <div className="relative">
        {transactions.map((item, index) => {
          const { className, label, icon: Icon } = getTransactionStyle(item.transactionDTO?.transactionType);
          const quantity = item.quantity ?? '-';
          const { sign, className: quantityClass, icon: QuantityIcon } = getQuantitySign(item.transactionDTO?.transactionType, item.placementType);
          const formattedQuantity = quantity !== '-' ? `${sign}${quantity}` : '-';
          const isTransfer = item.transactionDTO?.transactionType === 'TRANSFER';
          const directionLabel = isTransfer ? (item.placementType === 'IN' ? 'Входящее' : 'Исходящее') : '';

          return (
            <div key={index} className="mb-6 flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {QuantityIcon && <QuantityIcon className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                    {label} {isTransfer && `(${directionLabel})`}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{formatDate(item.transactionDTO?.createdAt)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-700">
                  <p><strong>Номенклатура:</strong> {item.transactionDTO?.nomenclatureName || '-'}</p>
                  <p><strong>Количество:</strong> <span className={quantityClass}>{formattedQuantity}</span></p>
                  <p><strong>Склад:</strong> {item.warehouseZoneDTO?.warehouseName || '-'}</p>
                  <p><strong>Зона:</strong> {item.warehouseZoneDTO?.name || '-'}</p>
                  <p><strong>Контейнер:</strong> {item.warehouseContainerDTO?.serialNumber || '-'}</p>
                  <p><strong>Ответственный:</strong> {item.transactionDTO?.createdBy || '-'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Основной компонент страницы
const TransactionHistoryPage = () => {
  const { code } = useParams();
  const [nomenclatureCode, setNomenclatureCode] = useState(code || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table');
  const pageSize = 10;

  const authToken = useSelector((state) => state.token.token);
  const API_BASE_URL = API_GET_DOCUMENTS_WITH_TRANSACTIONS;

  // Функция сортировки данных
  const sortData = (data, key, direction) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      let aValue, bValue;

      switch (key) {
        case 'date':
          aValue = a.transactionDTO?.createdAt ? new Date(a.transactionDTO.createdAt).getTime() : 0;
          bValue = b.transactionDTO?.createdAt ? new Date(b.transactionDTO.createdAt).getTime() : 0;
          break;
        case 'type':
          aValue = getTransactionStyle(a.transactionDTO?.transactionType).label || '';
          bValue = getTransactionStyle(b.transactionDTO?.transactionType).label || '';
          break;
        case 'direction':
          aValue = a.transactionDTO?.transactionType === 'TRANSFER' ? a.placementType : '';
          bValue = b.transactionDTO?.transactionType === 'TRANSFER' ? b.placementType : '';
          break;
        case 'nomenclature':
          aValue = a.transactionDTO?.nomenclatureName || '';
          bValue = b.transactionDTO?.nomenclatureName || '';
          break;
        case 'quantity':
          aValue = (a.quantity ?? 0) * (getQuantitySign(a.transactionDTO?.transactionType, a.placementType).sign === '-' ? -1 : 1);
          bValue = (b.quantity ?? 0) * (getQuantitySign(b.transactionDTO?.transactionType, b.placementType).sign === '-' ? -1 : 1);
          break;
        case 'warehouse':
          aValue = a.warehouseZoneDTO?.warehouseName || '';
          bValue = b.warehouseZoneDTO?.warehouseName || '';
          break;
        case 'zone':
          aValue = a.warehouseZoneDTO?.name || '';
          bValue = b.warehouseZoneDTO?.name || '';
          break;
        case 'container':
          aValue = a.warehouseContainerDTO?.serialNumber || '';
          bValue = b.warehouseContainerDTO?.serialNumber || '';
          break;
        case 'createdBy':
          aValue = a.transactionDTO?.createdBy || '';
          bValue = b.transactionDTO?.createdBy || '';
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
    return sortedData;
  };

  // Обработка запроса на сортировку
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedTransactions = sortData(transactions, key, direction);
    setTransactions(sortedTransactions);
  };

  // Получение транзакций с сервера
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
        cache: false,
      });

      const data = response.data;
      if (data.body?.transactionPlacementDTOS && Array.isArray(data.body.transactionPlacementDTOS)) {
        setTransactions(data.body.transactionPlacementDTOS);
        setSortConfig({ key: null, direction: 'asc' });
        setTotalQuantity(data.body.totalQuantity || 0);
        const calculatedTotalPages = data.body.totalPages || Math.ceil((data.body.totalElements || data.body.transactionPlacementDTOS.length) / pageSize) || 1;
        setTotalPages(calculatedTotalPages);
      } else {
        setTransactions([]);
        setTotalQuantity(0);
        setTotalPages(1);
        toast.error('Данные не получены или имеют неверный формат');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка загрузки данных';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Хук для автоматического получения данных
  useEffect(() => {
    if (code && startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      setNomenclatureCode(code);
      fetchTransactions(code, startDate, endDate, 0);
    }
  }, [code, startDate, endDate]);

  // Обработка поиска
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

  // Сброс фильтров
  const handleReset = () => {
    setNomenclatureCode('');
    setStartDate('');
    setEndDate(new Date().toISOString().split('T')[0]);
    setTransactions([]);
    setTotalQuantity(0);
    setPage(0);
    setTotalPages(1);
    setError(null);
    setSortConfig({ key: null, direction: 'asc' });
    toast.info('Форма сброшена');
  };

  // Смена страницы
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && !loading) {
      setPage(newPage);
      fetchTransactions(nomenclatureCode, startDate, endDate, newPage);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 p-4">
        <Notification />
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Карта движения товара</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Таблица
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Хронология
              </button>
            </div>
          </div>

          {transactions.length > 0 && (
            <GoodsMovementSummary transactions={transactions} totalQuantity={totalQuantity} />
          )}

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="nomenclatureCode" className="block text-sm font-medium text-gray-700 mb-1">
                Код номенклатуры
              </label>
              <input
                id="nomenclatureCode"
                type="text"
                value={nomenclatureCode}
                onChange={(e) => setNomenclatureCode(e.target.value)}
                placeholder="Введите код"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Начальная дата
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Конечная дата
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Загрузка...' : 'Поиск'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
              >
                Сброс
              </button>
              {transactions.length > 0 && (
                <button
                  type="button"
                  onClick={() => exportTransactionsToExcel(transactions, nomenclatureCode, startDate, endDate)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md text-sm hover:bg-teal-600"
                >
                  Excel
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg shadow-sm mb-4 text-sm">
              {error}
            </div>
          )}

          {viewMode === 'timeline' && transactions.length > 0 && (
            <TimelineView transactions={transactions} />
          )}

          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          Дата
                          {sortConfig.key === 'date' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('type')}
                      >
                        <div className="flex items-center gap-2">
                          Тип
                          {sortConfig.key === 'type' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('direction')}
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                          Направление
                          {sortConfig.key === 'direction' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('nomenclature')}
                      >
                        <div className="flex items-center gap-2">
                          Номенклатура
                          {sortConfig.key === 'nomenclature' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('quantity')}
                      >
                        <div className="flex items-center gap-2">
                          Количество
                          {sortConfig.key === 'quantity' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('warehouse')}
                      >
                        <div className="flex items-center gap-2">
                          Склад
                          {sortConfig.key === 'warehouse' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('zone')}
                      >
                        <div className="flex items-center gap-2">
                          Зона
                          {sortConfig.key === 'zone' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('container')}
                      >
                        <div className="flex items-center gap-2">
                          Контейнер
                          {sortConfig.key === 'container' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => requestSort('createdBy')}
                      >
                        <div className="flex items-center gap-2">
                          Ответственный
                          {sortConfig.key === 'createdBy' && (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading && (
                      <tr>
                        <td colSpan="9" className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <svg
                              className="animate-spin h-5 w-5 text-blue-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                            </svg>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && transactions.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-4 py-4 text-center text-gray-500 text-sm">
                          Нет транзакций для отображения
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      transactions.map((item, index) => {
                        const { className, label, icon: Icon } = getTransactionStyle(item.transactionDTO?.transactionType);
                        const quantity = item.quantity ?? '-';
                        const { sign, className: quantityClass, icon: QuantityIcon } = getQuantitySign(item.transactionDTO?.transactionType, item.placementType);
                        const formattedQuantity = quantity !== '-' ? `${sign}${quantity}` : '-';
                        const isTransfer = item.transactionDTO?.transactionType === 'TRANSFER';
                        const directionLabel = isTransfer ? (item.placementType === 'IN' ? 'Входящее' : 'Исходящее') : '-';
                        const directionIcon = isTransfer ? (
                          item.placementType === 'IN' ? (
                            <ArrowDownIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpIcon className="w-4 h-4 text-red-500" />
                          )
                        ) : null;

                        return (
                          <tr
                            key={index}
                            className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-700 relative">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full absolute left-2 top-1/2 transform -translate-y-1/2"></span>
                                <span className="ml-4">{formatDate(item.transactionDTO?.createdAt)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
                                {Icon && <Icon className="w-4 h-4" />}
                                {label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                {directionIcon}
                                {directionLabel}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.transactionDTO?.nomenclatureName || '-'}
                            </td>
                            <td className={`px-4 py-3 text-sm ${quantityClass}`}>
                              <div className="flex items-center gap-2">
                                {QuantityIcon && <QuantityIcon className="w-4 h-4" />}
                                {formattedQuantity}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.warehouseZoneDTO?.warehouseName || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.warehouseZoneDTO?.name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.warehouseContainerDTO?.serialNumber || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {item.transactionDTO?.createdBy || '-'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {transactions.length > 0 && viewMode === 'table' && (
            <div className="flex justify-between items-center mt-4 px-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0 || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm flex items-center gap-1 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Предыдущая
              </button>
              <span className="text-sm text-gray-600">
                Страница {page + 1} из {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm flex items-center gap-1 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Следующая
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default TransactionHistoryPage;