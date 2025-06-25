import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { Download } from 'lucide-react'; // Import Download from lucide-react
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import { API_BASE, API_PATH_STOREKEEPER } from '../../../api/API';

const API_BASE_URL = API_BASE + API_PATH_STOREKEEPER;

const InventoryReportPage = () => {
  const { inventoryId } = useParams();
  const navigate = useNavigate();
  const authToken = useSelector((state) => state.token.token);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedWarehouses, setExpandedWarehouses] = useState({});

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}inventory-check-system/${inventoryId}`,
        { headers: { 'Auth-token': authToken } }
      );
      setInventoryData(response.data.body || null);
      if (!response.data.body) {
        toast.error('Данные инвентаризации не найдены');
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error(error.response?.data?.message || 'Ошибка загрузки данных инвентаризации');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inventoryId && authToken) {
      fetchInventoryData();
    }
  }, [inventoryId, authToken]);

  const toggleWarehouse = (warehouseId) => {
    setExpandedWarehouses((prev) => ({
      ...prev,
      [warehouseId]: !prev[warehouseId],
    }));
  };

  const exportToExcel = () => {
    if (!inventoryData || !inventoryData.inventoryAudits?.length) {
      toast.error('Нет данных для экспорта');
      return;
    }
    try {
      const headers = [
        'ID Инвентаризации',
        'Дата аудита',
        'Статус',
        'Создатель',
        'Создано',
        'Обновлено',
        'ID Склада',
        'Название склада',
        'Дата аудита склада',
        'Статус склада',
        'ID Зоны',
        'Название зоны',
        'ID Номенклатуры',
        'Название номенклатуры',
        'Код номенклатуры',
        'Ожидаемое количество',
        'Фактическое количество',
        'Расхождение',
      ];

      const data = inventoryData.inventoryAudits.flatMap((audit) =>
        audit.inventoryAuditResults.map((result) => ({
          'ID Инвентаризации': inventoryData.id || '-',
          'Дата аудита': inventoryData.auditDate ? new Date(inventoryData.auditDate).toLocaleDateString('ru-RU') : '-',
          'Статус': inventoryData.status || '-',
          'Создатель': inventoryData.createdById || '-',
          'Создано': inventoryData.createdAt ? new Date(inventoryData.createdAt).toLocaleString('ru-RU') : '-',
          'Обновлено': inventoryData.updatedAt ? new Date(inventoryData.updatedAt).toLocaleString('ru-RU') : '-',
          'ID Склада': audit.warehouseId || '-',
          'Название склада': audit.warehouseName || '-',
          'Дата аудита склада': audit.auditDate ? new Date(audit.auditDate).toLocaleDateString('ru-RU') : '-',
          'Статус склада': audit.status || '-',
          'ID Зоны': result.zoneId || '-',
          'Название зоны': result.zoneName || '-',
          'ID Номенклатуры': result.nomenclatureId || '-',
          'Название номенклатуры': result.nomenclatureName || '-',
          'Код номенклатуры': result.nomenclatureCode || '-',
          'Ожидаемое количество': result.expectedQuantity ?? '-',
          'Фактическое количество': result.actualQuantity ?? '-',
          'Расхождение': result.discrepancy ?? '-',
        })
      ));

      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
      worksheet['!cols'] = headers.map(() => ({ wch: 20 })); // Set column widths
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'InventoryReport');
      XLSX.writeFile(workbook, `inventory_report_${inventoryId}_${new Date().toISOString().slice(0, 10)}.xlsx`);

      toast.success('Отчет успешно экспортирован в Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error(`Ошибка экспорта: ${error.message}`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { className: 'bg-green-100 text-green-600', label: 'Завершена', icon: CheckCircleIcon };
      default:
        return { className: 'bg-gray-100 text-gray-600', label: status || 'Неизвестно', icon: null };
    }
  };

  const handleViewTransactions = (nomenclatureCode) => {
    if (!nomenclatureCode) {
      toast.error('Код номенклатуры отсутствует');
      return;
    }
    navigate(`/transaction-history/${nomenclatureCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" autoClose={2000} limit={2} />
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Отчет по системной инвентаризации #{inventoryId}</h1>
          <div className="flex gap-4">
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap transition-colors"
              disabled={loading || !inventoryData}
            >
              <Download size={16} /> Экспорт
            </button>
            <button
              onClick={() => navigate('/warehouse-tabs')}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1 transition-colors"
            >
              Вернуться
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Загрузка...</p>
        ) : !inventoryData ? (
          <p className="text-center text-gray-500">Данные инвентаризации не найдены</p>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Общая информация</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>ID:</strong> {inventoryData.id}</p>
                <p><strong>Дата аудита:</strong> {inventoryData.auditDate ? new Date(inventoryData.auditDate).toLocaleDateString('ru-RU') : '-'}</p>
                <p>
                  <strong>Статус:</strong>{' '}
                  {(() => {
                    const { className, label, icon: Icon } = getStatusStyle(inventoryData.status);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                        {Icon && <Icon className="w-4 h-4" />}
                        {label}
                      </span>
                    );
                  })()}
                </p>
                <p><strong>Создатель:</strong> {inventoryData.createdById || '-'}</p>
                <p><strong>Создано:</strong> {inventoryData.createdAt ? new Date(inventoryData.createdAt).toLocaleString('ru-RU') : '-'}</p>
                <p><strong>Обновлено:</strong> {inventoryData.updatedAt ? new Date(inventoryData.updatedAt).toLocaleString('ru-RU') : '-'}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Детали по складам</h2>
            {inventoryData.inventoryAudits?.length > 0 ? (
              inventoryData.inventoryAudits.map((audit) => (
                <div key={audit.warehouseId} className="mb-4 border rounded-lg">
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 hover:bg-gray-200"
                    onClick={() => toggleWarehouse(audit.warehouseId)}
                  >
                    <h3 className="text-md font-medium">
                      Склад: {audit.warehouseName} (ID: {audit.warehouseId})
                    </h3>
                    <span>{expandedWarehouses[audit.warehouseId] ? 'Свернуть' : 'Развернуть'}</span>
                  </div>
                  {expandedWarehouses[audit.warehouseId] && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <p><strong>Дата аудита:</strong> {audit.auditDate ? new Date(audit.auditDate).toLocaleDateString('ru-RU') : '-'}</p>
                        <p><strong>Статус:</strong> {audit.status}</p>
                        <p><strong>Создатель:</strong> {audit.createdBy || '-'}</p>
                        <p><strong>Создано:</strong> {audit.createdAt ? new Date(audit.createdAt).toLocaleString('ru-RU') : '-'}</p>
                      </div>
                      <h4 className="text-sm font-semibold mb-2">Результаты аудита</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left">ID Зоны</th>
                              <th className="px-4 py-2 text-left">Название зоны</th>
                              <th className="px-4 py-2 text-left">ID Номенклатуры</th>
                              <th className="px-4 py-2 text-left">Название номенклатуры</th>
                              <th className="px-4 py-2 text-left">Код номенклатуры</th>
                              <th className="px-4 py-2 text-left">Ожидаемое количество</th>
                              <th className="px-4 py-2 text-left">Фактическое количество</th>
                              <th className="px-4 py-2 text-left">Расхождение</th>
                              <th className="px-4 py-2 text-left">Создано</th>
                            </tr>
                          </thead>
                          <tbody>
                            {audit.inventoryAuditResults.map((result) => (
                              <tr key={result.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{result.zoneId}</td>
                                <td className="px-4 py-2">{result.zoneName}</td>
                                <td className="px-4 py-2">{result.nomenclatureId}</td>
                                <td className="px-4 py-2">{result.nomenclatureName}</td>
                                <td className="px-4 py-2">
                                  {result.nomenclatureCode ? (
                                    <button
                                      onClick={() => handleViewTransactions(result.nomenclatureCode)}
                                      className="text-blue-500 hover:text-blue-700 underline"
                                      aria-label="Просмотреть историю транзакций"
                                    >
                                      {result.nomenclatureCode}
                                    </button>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="px-4 py-2">{result.expectedQuantity ?? '-'}</td>
                                <td className="px-4 py-2">{result.actualQuantity ?? '-'}</td>
                                <td className="px-4 py-2">
                                  <span className={result.discrepancy !== 0 ? 'text-red-500' : 'text-green-500'}>
                                    {result.discrepancy ?? '-'}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{result.createdAt ? new Date(result.createdAt).toLocaleString('ru-RU') : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Нет данных по складам</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryReportPage;