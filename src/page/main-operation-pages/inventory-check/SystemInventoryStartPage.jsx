import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/20/solid';
import ConfirmationWrapper from '../../../components/ui/ConfirmationWrapper';
import { API_GET_INVENTORY_CHECK_SYSTEM_BY_ID, API_PATH_STOREKEEPER, API_BASE } from '../../../api/API';

const API_BASE_URL = API_BASE + API_PATH_STOREKEEPER;

const SystemInventoryStartPage = ({ onSelectInventory }) => {
  const authToken = useSelector((state) => state.token.token);
  const userId = useSelector((state) => state.user.userId);
  const navigate = useNavigate(); // Инициализируем useNavigate
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

      const completedResponse = await axios.get(`${API_BASE_URL}inventory-check-system/completed`, {
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
        `${API_BASE_URL}inventory-check-system/start`,
        { createdById: userId, status: 'IN_PROGRESS' },
        { headers: { 'Auth-token': authToken } }
      );
      const inventoryId = response.data.body?.id || response.data.id;
      if (inventoryId) {
        toast.success(response.data.message || 'Системная инвентаризация успешно начата');
        onSelectInventory(inventoryId);
        fetchInventories();
      } else {
        throw new Error('ID инвентаризации не получен');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при создании инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueInventory = async (inventoryId) => {
    try {
      setLoading(true);
      await axios.get(`${API_GET_INVENTORY_CHECK_SYSTEM_BY_ID.replace('{inventoryId}', inventoryId)}`, {
        headers: { 'Auth-token': authToken },
      });
      onSelectInventory(inventoryId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка загрузки данных инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    try {
      if (!data.length) throw new Error('Нет данных для экспорта');
      const headers = ['ID', 'Дата', 'Статус', 'Создатель', 'Создано', 'Обновлено'];
      const rows = data.map((item) => [
        `"${item.id}"`,
        item.auditDate ? `"${new Date(item.auditDate).toLocaleDateString('ru-RU')}"` : '"-"',
        `"${item.status}"`,
        `"${item.createdById || '-'}"`,
        item.createdAt ? `"${new Date(item.createdAt).toLocaleString('ru-RU')}"` : '"-"',
        item.updatedAt ? `"${new Date(item.updatedAt).toLocaleString('ru-RU')}"` : '"-"',
      ]);
      const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Экспорт ${filename} выполнен успешно`);
    } catch (err) {
      toast.error(`Ошибка экспорта: ${err.message}`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { className: 'bg-blue-100 text-blue-600', label: 'В процессе', icon: ClockIcon };
      case 'COMPLETED':
        return { className: 'bg-green-100 text-green-600', label: 'Завершена', icon: CheckCircleIcon };
      default:
        return { className: 'bg-gray-100 text-gray-600', label: status, icon: null };
    }
  };

  const renderInventoryTable = (data, isActive) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Дата</th>
            <th className="px-4 py-2 text-left">Статус</th>
            <th className="px-4 py-2 text-left">Создатель</th>
            <th className="px-4 py-2 text-left">Создано</th>
            <th className="px-4 py-2 text-left">Обновлено</th>
            <th className="px-4 py-2 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const { className, label, icon: Icon } = getStatusStyle(item.status);
            return (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{item.id}</td>
                <td className="px-4 py-2">{item.auditDate ? new Date(item.auditDate).toLocaleDateString('ru-RU') : '-'}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </span>
                </td>
                <td className="px-4 py-2">{item.createdById || '-'}</td>
                <td className="px-4 py-2">{item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : '-'}</td>
                <td className="px-4 py-2">{item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : '-'}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => {
                      if (isActive) {
                        handleContinueInventory(item.id); // Для активных инвентаризаций
                      } else {
                        navigate(`/inventory-report/${item.id}`); // Для завершенных — переход на отчет
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {isActive ? 'Продолжить' : 'Отчет'}
                  </button>
                  <ConfirmationWrapper
                    title="Подтверждение удаления"
                    message="Вы уверены, что хотите удалить эту инвентаризацию?"
                    onConfirm={async () => {
                      try {
                        setLoading(true);
                        await axios.delete(`${API_BASE_URL}inventory-check-system/${item.id}`, {
                          headers: { 'Auth-token': authToken },
                        });
                        toast.success('Инвентаризация успешно удалена');
                        fetchInventories();
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Ошибка при удалении инвентаризации');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <button
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </ConfirmationWrapper>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" autoClose={2000} limit={2} />
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-xl font-semibold mb-4">Системная инвентаризация</h1>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Дата начала</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 w-40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Дата окончания</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 w-40"
            />
          </div>
          <button
            onClick={fetchInventories}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Загрузка...' : 'Фильтровать'}
          </button>
          <button
            onClick={handleStartInventory}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-green-300"
          >
            Начать инвентаризацию
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Активные инвентаризации</h2>
          {activeInventories.length > 0 && (
            <button
              onClick={() => exportToCSV(activeInventories, 'active_inventories')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Экспорт в CSV
            </button>
          )}
        </div>
        {loading ? <p>Загрузка...</p> : activeInventories.length > 0 ? renderInventoryTable(activeInventories, true) : <p className="text-gray-500">Нет активных инвентаризаций</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Завершённые инвентаризации</h2>
          {completedInventories.length > 0 && (
            <button
              onClick={() => exportToCSV(completedInventories, 'completed_inventories')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Экспорт в CSV
            </button>
          )}
        </div>
        {loading ? <p>Загрузка...</p> : completedInventories.length > 0 ? renderInventoryTable(completedInventories, false) : <p className="text-gray-500">Нет завершённых инвентаризаций</p>}
      </div>
    </div>
  );
};

export default SystemInventoryStartPage;