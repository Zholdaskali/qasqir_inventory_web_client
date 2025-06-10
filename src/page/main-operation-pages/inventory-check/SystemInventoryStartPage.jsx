import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/20/solid';
import { API_GET_INVENTORY_CHECK_SYSTEM_BY_ID, API_PATH_STOREKEEPER,API_BASE } from '../../../api/API';

const API_BASE_URL = API_BASE + API_BASE;

const SystemInventoryStartPage = ({ onSelectInventory }) => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);

  const today = new Date();
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [activeInventories, setActiveInventories] = useState([]);
  const [completedInventories, setCompletedInventories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const activeResponse = await axios.get(`${API_BASE_URL}inventory-check-system/in-progress`, {
        headers: { 'Auth-token': authToken },
        params: { startDate, endDate },
      });
      setActiveInventories(activeResponse.data.body || []);

      const completedResponse = await axios.get(`${API_BASE_URL}/inventory-check-system/completed`, {
        headers: { 'Auth-token': authToken },
        params: { startDate, endDate },
      });
      setCompletedInventories(completedResponse.data.body || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка загрузки инвентаризаций');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, [startDate, endDate, authToken]);

  const handleStartInventory = async () => {
    if (!userId) {
      toast.error('Пользователь не авторизован');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/inventory-check-system/start`,
        { createdById: userId, status: 'IN_PROGRESS' },
        { headers: { 'Auth-token': authToken } }
      );
      console.log('API Response for start:', response.data); // Добавим отладку
      const inventoryId = response.data.body?.inventoryId || response.data.inventoryId;
      if (inventoryId) {
        toast.success(response.data.message || 'Системная инвентаризация успешно начата');
        onSelectInventory(inventoryId);
        fetchInventories();
      } else {
        throw new Error('ID инвентаризации не получен');
      }
    } catch (error) {
      console.error('Error starting inventory:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Ошибка при создании инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueInventory = async (inventoryId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_GET_INVENTORY_CHECK_SYSTEM_BY_ID.replace("{inventoryId}", inventoryId)}`,
        { headers: { 'Auth-token': authToken } }
      );
      console.log('API Response for continue:', response.data); // Добавим отладку
      onSelectInventory(inventoryId);
    } catch (error) {
      console.error('Error continuing inventory:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Ошибка загрузки данных инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Данные для экспорта отсутствуют');
      }
      const headers = ['ID', 'Дата', 'Статус', 'Создатель', 'Создано', 'Обновлено'];
      const rows = data.map((item) => [
        `"${item.id || 'N/A'}"`,
        item.auditDate ? `"${new Date(item.auditDate).toLocaleDateString('ru-RU')}"` : '"N/A"',
        `"${item.status || 'N/A'}"`,
        `"${item.createdById || 'N/A'}"`,
        item.createdAt ? `"${new Date(item.createdAt).toLocaleString('ru-RU')}"` : '"N/A"',
        item.updatedAt ? `"${new Date(item.updatedAt).toLocaleString('ru-RU')}"` : '"N/A"',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((row) => row.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Экспорт ${filename} выполнен успешно`);
    } catch (error) {
      toast.error('Ошибка при экспорте в CSV: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { className: 'bg-blue-100 text-blue-600', label: 'В процессе', icon: ClockIcon };
      case 'COMPLETED':
        return { className: 'bg-green-100 text-green-600', label: 'Завершена', icon: CheckCircleIcon };
      default:
        return { className: 'bg-gray-100 text-gray-600', label: status || 'Неизвестно', icon: null };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white sm:bg-gray-50 p-2 sm:p-4">
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
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
        <h1 className="text-base sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Системная инвентаризация
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Дата начала</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Дата окончания</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchInventories}
            disabled={loading}
            className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 disabled:bg-blue-300 mt-4 sm:mt-6"
          >
            {loading ? 'Загрузка...' : 'Фильтровать'}
          </button>
          <button
            onClick={handleStartInventory}
            disabled={loading}
            className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600 disabled:bg-green-300 mt-4 sm:mt-6"
          >
            Начать инвентаризацию
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Активные инвентаризации</h2>
          {activeInventories.length > 0 && (
            <button
              onClick={() => exportToCSV(activeInventories, 'active_inventories')}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600"
            >
              Экспорт в CSV
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center text-gray-600">Загрузка...</div>
        ) : activeInventories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Дата</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Статус</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Создатель</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Создано</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Обновлено</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {activeInventories.map((item) => {
                  const { className, label, icon: Icon } = getStatusStyle(item.status);
                  return (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2">{item.id}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {item.auditDate ? new Date(item.auditDate).toLocaleDateString('ru-RU') : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                          {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                          {label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2">{item.createdById || '-'}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        <button
                          onClick={() => handleContinueInventory(item.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm"
                        >
                          Продолжить
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">Нет активных инвентаризаций</div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Завершённые инвентаризации</h2>
          {completedInventories.length > 0 && (
            <button
              onClick={() => exportToCSV(completedInventories, 'completed_inventories')}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm hover:bg-green-600"
            >
              Экспорт в CSV
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-center text-gray-600">Загрузка...</div>
        ) : completedInventories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Дата</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Статус</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Создатель</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Создано</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Обновлено</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {completedInventories.map((item) => {
                  const { className, label, icon: Icon } = getStatusStyle(item.status);
                  return (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2">{item.id}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {item.auditDate ? new Date(item.auditDate).toLocaleDateString('ru-RU') : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                          {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                          {label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2">{item.createdById || '-'}</td>
                      <td className="px-2 sm:px-4 py-2">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : '-'}
                      </td>
                      <td className="px-2 sm:px-4 py-2">
                        <button
                          onClick={() => onSelectInventory(item.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm"
                        >
                          Перейти
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">Нет завершённых инвентаризаций</div>
        )}
      </div>
    </div>
  );
};

export default SystemInventoryStartPage;