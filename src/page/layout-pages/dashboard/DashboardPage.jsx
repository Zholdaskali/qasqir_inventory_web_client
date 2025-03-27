import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter, Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { toast } from 'react-toastify';

const API_DASHBOARD_STATS = 'http://localhost:8081/api/v1/employee/dashboard/stats';
const API_DASHBOARD_CURRENT = 'http://localhost:8081/api/v1/employee/dashboard/current';
const API_TRANSACTIONS = 'http://localhost:8081/api/v1/employee/transactions'; // Предполагаемый эндпоинт для транзакций

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
        totalInventoryQuantity: '0',
        zoneFillPercentage: 0,
        transactionCount: 0,
        topNomenclatures: [],
        lowStockItems: [],
        demandForecast: [], // Добавлено
        trendingItems: [],  // Добавлено
        zoneStats: [],
    });
    const [transactions, setTransactions] = useState([]); // Состояние для транзакций
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
                    : String(bValue).localeCompare(String(aValue));
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
            const response = await axios.get(API_DASHBOARD_STATS, {
                params: { startDate: start, endDate: end },
                headers: { 'Auth-token': authToken },
            });
            const data = response.data.body || response.data;
            setDashboardData({
                ...data,
                zoneStats: Array.isArray(data.zoneStats) ? data.zoneStats : [],
                topNomenclatures: Array.isArray(data.topNomenclatures) ? data.topNomenclatures : [],
                lowStockItems: Array.isArray(data.lowStockItems) ? data.lowStockItems : [],
                demandForecast: Array.isArray(data.demandForecast) ? data.demandForecast : [], // Добавлено
                trendingItems: Array.isArray(data.trendingItems) ? data.trendingItems : [],   // Добавлено
            });
            fetchTransactions(start, end); // Загружаем транзакции
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
            const response = await axios.get(API_DASHBOARD_CURRENT, {
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
            fetchTransactions(); // Загружаем текущие транзакции
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
            const response = await axios.get(API_TRANSACTIONS, {
                params: start && end ? { startDate: start, endDate: end } : {},
                headers: { 'Auth-token': authToken },
            });
            const data = response.data.body || response.data;
            setTransactions(Array.isArray(data) ? data : []);
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
            ...(dashboardData.lowStockItems || []).map(item => [item.name, '', item.totalQuantity ?? 0].join(',')),
            'Прогноз спроса,,,',
            ...(dashboardData.demandForecast || []).map(item => [item.name, '', item.totalQuantity ?? 0].join(',')),
            'Тенденции,,,',
            ...(dashboardData.trendingItems || []).map(item => [item.name, '', item.totalQuantity ?? 0].join(',')),
            'Зоны,,,',
            ...(dashboardData.zoneStats || []).map(zone => [zone.zoneName, zone.warehouseName, '', '', `${zone.fillPercentage ?? 0}%`].join(','))
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

    if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Загрузка...</div>;
    if (error) return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            {/* Заголовок и фильтры */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Аналитика склада</h1>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded-md text-sm"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded-md text-sm"
                    />
                    <button onClick={handleFilterApply} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1">
                        <Filter size={16} /> Фильтр
                    </button>
                    <button onClick={fetchCurrentDashboardStats} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
                        Обновить
                    </button>
                    <button onClick={exportToCSV} className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center gap-1">
                        <Download size={16} /> CSV
                    </button>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-600">{stat.title}</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xl font-bold text-gray-800">{stat.value}</span>
                            <span className={`text-xs ${stat.increase ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                                {stat.increase ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Графики */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Топ номенклатуры</h2>
                    <div className="h-48 flex items-end gap-2">
                        {dashboardData.topNomenclatures.slice(0, 6).map((item) => (
                            <div key={item.id} className="flex-1 group relative">
                                <div
                                    className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                    style={{ height: `${((item.totalQuantity || 0) / 100) * 100}px` }}
                                    title={`${item.nomenclatureName}: ${item.totalQuantity || 0} ед.`}
                                />
                                <p className="text-xs text-center mt-1 text-gray-600 truncate">{item.nomenclatureName || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Заполненность зон</h2>
                    <div className="h-48 flex items-end gap-2">
                        {dashboardData.zoneStats.slice(0, 6).map((zone) => (
                            <div key={zone.id} className="flex-1 group relative">
                                <div
                                    className={`rounded-t transition-colors ${(zone.fillPercentage || 0) > 80 ? 'bg-red-500 hover:bg-red-600' : (zone.fillPercentage || 0) > 50 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                                    style={{ height: `${(zone.fillPercentage || 0) * 1.5}px` }}
                                    title={`${zone.zoneName}: ${(zone.fillPercentage || 0).toFixed(1)}%`}
                                />
                                <p className="text-xs text-center mt-1 text-gray-600 truncate">{zone.zoneName || '-'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Таблица зон */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-gray-800">Зоны склада</h2>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-2 py-1 border rounded-md text-sm w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-gray-600 border-b">
                                <th className="text-left py-2 cursor-pointer" onClick={() => requestSort('zoneName')}>
                                    Зона {sortConfig.key === 'zoneName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="text-left py-2 cursor-pointer" onClick={() => requestSort('warehouseName')}>
                                    Склад {sortConfig.key === 'warehouseName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="text-left py-2 cursor-pointer" onClick={() => requestSort('fillPercentage')}>
                                    Заполн. {sortConfig.key === 'fillPercentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="text-left py-2">Объем</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedZones.length > 0 ? (
                                paginatedZones.map((zone) => (
                                    <tr key={zone.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">{zone.zoneName || '-'}</td>
                                        <td className="py-2">{zone.warehouseName || '-'}</td>
                                        <td className="py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded h-1.5">
                                                    <div 
                                                        className={`h-1.5 rounded ${(zone.fillPercentage || 0) > 80 ? 'bg-red-500' : (zone.fillPercentage || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                        style={{ width: `${zone.fillPercentage || 0}%` }}
                                                    />
                                                </div>
                                                <span>{(zone.fillPercentage || 0).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="py-2">{(zone.usedCapacity || 0).toFixed(1)}/{(zone.totalVolume || 0).toFixed(1)} м³</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-2 text-center text-gray-500">Нет данных</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {sortedZones.length > itemsPerPage && (
                    <div className="flex justify-between items-center mt-3 text-xs">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 p-1 rounded border disabled:opacity-50"
                        >
                            <ChevronLeft size={14} /> Назад
                        </button>
                        <span>{currentPage} / {Math.ceil(sortedZones.length / itemsPerPage)}</span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(sortedZones.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(sortedZones.length / itemsPerPage)}
                            className="flex items-center gap-1 p-1 rounded border disabled:opacity-50"
                        >
                            Вперед <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Низкий запас, транзакции, прогноз спроса и тенденции */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Низкий запас</h2>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-2">Название</th>
                                    <th className="text-left py-2">Кол-во</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.lowStockItems.length > 0 ? (
                                    dashboardData.lowStockItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2">{item.nomenclatureName || '-'}</td>
                                            <td className="py-2 text-red-600">{item.totalQuantity || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-2 text-center text-gray-500">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Последние транзакции</h2>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-2">Тип</th>
                                    <th className="text-left py-2">Кол-во</th>
                                    <th className="text-left py-2">Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.slice(0, 5).map((txn) => (
                                        <tr key={txn.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2">{txn.transactionType || '-'}</td>
                                            <td className="py-2" style={{ color: txn.quantity > 0 ? 'green' : 'red' }}>
                                                {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
                                            </td>
                                            <td className="py-2">{new Date(txn.date).toLocaleDateString() || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-2 text-center text-gray-500">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Прогноз спроса (след. месяц)</h2>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-2">Название</th>
                                    <th className="text-left py-2">Кол-во</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.demandForecast.length > 0 ? (
                                    dashboardData.demandForecast.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2">{item.nomenclatureName || '-'}</td>
                                            <td className="py-2">{item.totalQuantity.toFixed(1) || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-2 text-center text-gray-500">Нет данных</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">Тенденции</h2>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-600 border-b">
                                    <th className="text-left py-2">Название</th>
                                    <th className="text-left py-2">Изменение</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.trendingItems.length > 0 ? (
                                    dashboardData.trendingItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2">{item.nomenclatureName || '-'}</td>
                                            <td className="py-2" style={{ color: item.totalQuantity > 0 ? 'green' : 'red' }}>
                                                {item.totalQuantity > 0 ? `+${item.totalQuantity}` : item.totalQuantity}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-2 text-center text-gray-500">Нет данных</td>
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