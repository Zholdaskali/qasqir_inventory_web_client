import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter, Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_GET_DASHBOARD_STATS, API_GET_CURRENT_DASHBOARD, API_GET_DOCUMENTS_WITH_TRANSACTIONS } from '../../../api/API';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
        totalInventoryQuantity: '0',
        zoneFillPercentage: 0,
        transactionCount: 0,
        topNomenclatures: [],
        lowStockItems: [],
        demandForecast: [],
        trendingItems: [],
        zoneStats: [],
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'zoneName', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const authToken = useSelector((state) => state.token.token);

    // Сортировка зон
    const sortedZones = useMemo(() => {
        const zones = Array.isArray(dashboardData.zoneStats) ? [...dashboardData.zoneStats] : [];
        
        if (searchTerm) {
            return zones.filter(zone => 
                (zone.zoneName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (zone.warehouseName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }
        
        if (sortConfig.key) {
            zones.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? '';
                const bValue = b[sortConfig.key] ?? '';
                
                if (sortConfig.key === 'fillPercentage' || sortConfig.key === 'usedCapacity' || sortConfig.key === 'totalVolume') {
                    return sortConfig.direction === 'asc' 
                        ? (aValue - bValue) 
                        : (bValue - aValue);
                }
                
                return sortConfig.direction === 'asc' 
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(bValue));
            });
        }
        return zones;
    }, [dashboardData.zoneStats, sortConfig, searchTerm]);

    const paginatedZones = sortedZones.length > 0 
        ? sortedZones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const fetchDashboardStats = async (start, end) => {
        try {
            setLoading(true);
            const response = await axios.get(API_GET_DASHBOARD_STATS, {
                params: { startDate: start, endDate: end },
                headers: { 'Auth-token': authToken },
            });
            const data = response.data.body || response.data;
            setDashboardData({
                ...data,
                zoneStats: Array.isArray(data.zoneStats) ? data.zoneStats : [],
                topNomenclatures: Array.isArray(data.topNomenclatures) ? data.topNomenclatures : [],
                lowStockItems: Array.isArray(data.lowStockItems) ? data.lowStockItems : [],
                demandForecast: Array.isArray(data.demandForecast) ? data.demandForecast : [],
                trendingItems: Array.isArray(data.trendingItems) ? data.trendingItems : [],
            });
            await fetchTransactions(start, end);
            setLoading(false);
            toast.success('Данные загружены');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка загрузки');
            setLoading(false);
            toast.error('Ошибка загрузки');
        }
    };

    const fetchCurrentDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_GET_CURRENT_DASHBOARD, {
                headers: { 'Auth-token': authToken },
            });
            const data = response.data.body || response.data;
            setDashboardData({
                ...data,
                zoneStats: Array.isArray(data.zoneStats) ? data.zoneStats : [],
                topNomenclatures: Array.isArray(data.topNomenclatures) ? data.topNomenclatures : [],
                lowStockItems: Array.isArray(data.lowStockItems) ? data.lowStockItems : [],
                demandForecast: Array.isArray(data.demandForecast) ? data.demandForecast : [],
                trendingItems: Array.isArray(data.trendingItems) ? data.trendingItems : [],
            });
            await fetchTransactions();
            setLoading(false);
            toast.success('Текущие данные загружены');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка загрузки');
            setLoading(false);
            toast.error('Ошибка загрузки');
        }
    };

    const fetchTransactions = async (start, end) => {
        try {
            const response = await axios.get(API_GET_DOCUMENTS_WITH_TRANSACTIONS, {
                params: start && end ? { startDate: start, endDate: end } : {},
                headers: { 'Auth-token': authToken },
            });
            const data = response.data.body || response.data;
            const allTransactions = Array.isArray(data) 
                ? data.flatMap(doc => doc.transactions || []) 
                : [];
            setTransactions(allTransactions);
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
            setTransactions([]);
        }
    };

    const exportToCSV = () => {
        const headers = ['Зона', 'Склад', 'Запас', 'Транзакции', 'Заполненность', 'Низкий запас', 'Прогноз спроса', 'Тенденции'];
        const statsRow = [
            'Статистика', '',
            dashboardData.totalInventoryQuantity ?? '0',
            dashboardData.transactionCount ?? 0,
            `${dashboardData.zoneFillPercentage ?? 0}%`,
            (dashboardData.lowStockItems || []).length,
            dashboardData.demandForecast.length,
            dashboardData.trendingItems.length,
        ];

        const csvContent = [
            headers.join(','),
            statsRow.join(','),
            'Низкий запас,,,',
            ...(dashboardData.lowStockItems || []).map(item => [item.nomenclatureName || '-', '', item.totalQuantity ?? 0].join(',')),
            'Прогноз спроса,,,',
            ...(dashboardData.demandForecast || []).map(item => [item.nomenclatureName || '-', '', item.totalQuantity ?? 0].join(',')),
            'Тенденции,,,',
            ...(dashboardData.trendingItems || []).map(item => [item.nomenclatureName || '-', '', item.totalQuantity ?? 0].join(',')),
            'Зоны,,,',
            ...(dashboardData.zoneStats || []).map(zone => [zone.zoneName || '-', zone.warehouseName || '-', '', '', `${zone.fillPercentage ?? 0}%`].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `dashboard_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const defaultStartDate = lastMonth.toISOString().split('T')[0];
        setStartDate(defaultStartDate);
        setEndDate(today);
        fetchDashboardStats(defaultStartDate, today);
    }, [authToken]);

    const handleFilterApply = () => {
        if (startDate && endDate) {
            fetchDashboardStats(startDate, endDate);
        } else {
            toast.error('Выберите даты');
        }
    };

    const stats = [
        { title: 'Запас', value: dashboardData.totalInventoryQuantity, change: `+${(dashboardData.zoneFillPercentage || 0).toFixed(1)}%`, increase: true },
        { title: 'Транзакции', value: dashboardData.transactionCount, change: '0%', increase: false },
        { title: 'Низкий запас', value: dashboardData.lowStockItems.length, change: dashboardData.lowStockItems.length > 0 ? '+10%' : '0%', increase: dashboardData.lowStockItems.length > 0 },
        { title: 'Заполненность', value: `${(dashboardData.zoneFillPercentage || 0).toFixed(1)}%`, change: '+5%', increase: true },
    ];

    if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 text-sm sm:text-base">Загрузка...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-red-600 text-sm sm:text-base">{error}</div>;

    return (
        <div className="w-full p-2 sm:p-4 bg-gray-50 min-h-screen">
            {/* Заголовок и фильтры */}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Аналитика склада</h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-1.5 sm:p-2 border rounded-md text-xs sm:text-sm w-full sm:w-auto"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-1.5 sm:p-2 border rounded-md text-xs sm:text-sm w-full sm:w-auto"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={handleFilterApply} className="flex-1 sm:flex-none p-1.5 sm:p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs sm:text-sm flex items-center justify-center gap-1">
                            <Filter size={12} className="sm:w-4 sm:h-4" /> Фильтр
                        </button>
                        <button onClick={fetchCurrentDashboardStats} className="flex-1 sm:flex-none p-1.5 sm:p-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs sm:text-sm">
                            Обновить
                        </button>
                        <button onClick={exportToCSV} className="flex-1 sm:flex-none p-1.5 sm:p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs sm:text-sm flex items-center justify-center gap-1">
                            <Download size={12} className="sm:w-4 sm:h-4" /> CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-600">{stat.title}</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-base sm:text-xl font-bold text-gray-800">{stat.value}</span>
                            <span className={`text-xs ${stat.increase ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                                {stat.increase ? <ArrowUpRight size={12} className="sm:w-4 sm:h-4" /> : <ArrowDownRight size={12} className="sm:w-4 sm:h-4" />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Графики */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Топ номенклатуры</h2>
                    <div className="h-32 sm:h-48 overflow-x-auto flex items-end gap-1 sm:gap-2">
                        {dashboardData.topNomenclatures.slice(0, 6).map((item) => (
                            <div key={item.id} className="flex-none w-16 sm:flex-1 group relative">
                                <div
                                    className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                    style={{ height: `${((item.totalQuantity || 0) / 100) * 80}px`, minWidth: '16px' }}
                                    title={`${item.nomenclatureName}: ${item.totalQuantity || 0} ед.`}
                                />
                                <p className="text-[10px] sm:text-xs text-center mt-1 text-gray-600 truncate">{item.nomenclatureName || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Заполненность зон</h2>
                    <div className="h-32 sm:h-48 overflow-x-auto flex items-end gap-1 sm:gap-2">
                        {dashboardData.zoneStats.slice(0, 6).map((zone) => (
                            <div key={zone.id} className="flex-none w-16 sm:flex-1 group relative">
                                <div
                                    className={`rounded-t transition-colors ${(zone.fillPercentage || 0) > 80 ? 'bg-red-500 hover:bg-red-600' : (zone.fillPercentage || 0) > 50 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                                    style={{ height: `${(zone.fillPercentage || 0) * 1.2}px`, minWidth: '16px' }}
                                    title={`${zone.zoneName}: ${(zone.fillPercentage || 0).toFixed(1)}%`}
                                />
                                <p className="text-[10px] sm:text-xs text-center mt-1 text-gray-600 truncate">{zone.zoneName || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Таблица зон */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-3 gap-2">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800">Зоны склада</h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-7 sm:pl-8 pr-2 py-1 border rounded-md text-xs w-full"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-gray-600 border-b">
                                <th className="text-left py-1 sm:py-2 cursor-pointer" onClick={() => requestSort('zoneName')}>
                                    Зона {sortConfig.key === 'zoneName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="text-left py-1 sm:py-2 cursor-pointer hidden sm:table-cell" onClick={() => requestSort('warehouseName')}>
                                    Склад {sortConfig.key === 'warehouseName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="text-left py-1 sm:py-2 cursor-pointer" onClick={() => requestSort('fillPercentage')}>
                                    Заполн. {sortConfig.key === 'fillPercentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="text-left py-1 sm:py-2 hidden sm:table-cell">Объем</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedZones.length > 0 ? (
                                paginatedZones.map((zone) => (
                                    <tr key={zone.id} className="border-b hover:bg-gray-50">
                                        <td className="py-1 sm:py-2">{zone.zoneName || '-'}</td>
                                        <td className="py-1 sm:py-2 hidden sm:table-cell">{zone.warehouseName || '-'}</td>
                                        <td className="py-1 sm:py-2">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <div className="w-12 sm:w-16 bg-gray-200 rounded h-1">
                                                    <div 
                                                        className={`h-1 rounded ${(zone.fillPercentage || 0) > 80 ? 'bg-red-500' : (zone.fillPercentage || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                        style={{ width: `${zone.fillPercentage || 0}%` }}
                                                    />
                                                </div>
                                                <span>{(zone.fillPercentage || 0).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="py-1 sm:py-2 hidden sm:table-cell">{(zone.usedCapacity || 0).toFixed(1)}/{(zone.totalVolume || 0).toFixed(1)} м³</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-1 sm:py-2 text-center text-gray-500 text-xs">Нет данных</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {sortedZones.length > itemsPerPage && (
                    <div className="flex justify-between items-center mt-2 sm:mt-3 text-xs">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 p-1 rounded border disabled:opacity-50 text-xs"
                        >
                            <ChevronLeft size={12} className="sm:w-4 sm:h-4" /> Назад
                        </button>
                        <span>{currentPage} / {Math.ceil(sortedZones.length / itemsPerPage)}</span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(sortedZones.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(sortedZones.length / itemsPerPage)}
                            className="flex items-center gap-1 p-1 rounded border disabled:opacity-50 text-xs"
                        >
                            Вперед <ChevronRight size={12} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Низкий запас, транзакции, прогноз спроса и тенденции */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Низкий запас</h2>
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-1 sm:py-2">Название</th>
                                    <th className="text-left py-1 sm:py-2">Кол-во</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.lowStockItems.length > 0 ? (
                                    dashboardData.lowStockItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-1 sm:py-2">{item.nomenclatureName || '-'}</td>
                                            <td className="py-1 sm:py-2 text-red-600">{item.totalQuantity || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-1 sm:py-2 text-center text-gray-500 text-xs">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Последние транзакции</h2>
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-1 sm:py-2">Тип</th>
                                    <th className="text-left py-1 sm:py-2">Кол-во</th>
                                    <th className="text-left py-1 sm:py-2">Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.slice(0, 5).map((txn) => (
                                        <tr key={txn.id} className="border-b hover:bg-gray-50">
                                            <td className="py-1 sm:py-2">{txn.transactionType || '-'}</td>
                                            <td className="py-1 sm:py-2" style={{ color: txn.quantity > 0 ? 'green' : 'red' }}>
                                                {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                                            </td>
                                            <td className="py-1 sm:py-2">{txn.date ? new Date(txn.date).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-1 sm:py-2 text-center text-gray-500 text-xs">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Прогноз спроса (след. месяц)</h2>
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-1 sm:py-2">Название</th>
                                    <th className="text-left py-1 sm:py-2">Кол-во</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.demandForecast.length > 0 ? (
                                    dashboardData.demandForecast.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-1 sm:py-2">{item.nomenclatureName || '-'}</td>
                                            <td className="py-1 sm:py-2">{item.totalQuantity?.toFixed(1) || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-1 sm:py-2 text-center text-gray-500 text-xs">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Тенденции</h2>
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-1 sm:py-2">Название</th>
                                    <th className="text-left py-1 sm:py-2">Изменение</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.trendingItems.length > 0 ? (
                                    dashboardData.trendingItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-1 sm:py-2">{item.nomenclatureName || '-'}</td>
                                            <td className="py-1 sm:py-2" style={{ color: item.totalQuantity > 0 ? 'green' : 'red' }}>
                                                {item.totalQuantity > 0 ? `+${item.totalQuantity}` : item.totalQuantity}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-1 sm:py-2 text-center text-gray-500 text-xs">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;