import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { API_GET_DASHBOARD_STATS } from '../../../api/API';
import TableHeader from '../../../components/ui/Header';

const DashboardPage = () => {
    // Initialize dates
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const defaultStartDate = lastMonth.toISOString().split('T')[0];

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'zoneName', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const authToken = useSelector((state) => state.token.token);
    const isFetched = useRef(false);

    // Log component mounting
    useEffect(() => {
        console.log('DashboardPage mounted:', { timestamp: new Date().toISOString() });
        return () => {
            console.log('DashboardPage unmounted:', { timestamp: new Date().toISOString() });
        };
    }, []);

    const fetchDashboardStats = async (start, end, controller) => {
        console.log('Sending request to /api/v1/employee/dashboard/stats:', {
            start,
            end,
            authToken: authToken ? 'present' : 'missing',
            timestamp: new Date().toISOString(),
        });
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_GET_DASHBOARD_STATS, {
                params: { startDate: start, endDate: end },
                headers: { 'Auth-token': authToken },
                signal: controller?.signal,
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
            setLoading(false);
            toast.success('Данные загружены');
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request cancelled:', error.message);
                return;
            }
            setError(error.response?.data?.message || 'Ошибка загрузки данных');
            setLoading(false);
            toast.error(error.response?.data?.message || 'Ошибка загрузки данных');
        }
    };

    useEffect(() => {
        if (!authToken) {
            console.log('Auth token missing, skipping fetch:', { timestamp: new Date().toISOString() });
            setError('Токен авторизации отсутствует');
            setLoading(false);
            return;
        }

        if (isFetched.current) {
            console.log('Fetch already initiated, skipping:', { timestamp: new Date().toISOString() });
            return;
        }

        isFetched.current = true;
        const controller = new AbortController();
        console.log('Initiating fetchDashboardStats:', { startDate, endDate, timestamp: new Date().toISOString() });
        fetchDashboardStats(startDate, endDate, controller);

        return () => {
            controller.abort();
            console.log('Cleanup useEffect, resetting isFetched:', { timestamp: new Date().toISOString() });
            isFetched.current = false;
        };
    }, [authToken, startDate, endDate]);

    const handleFilterApply = () => {
        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            isFetched.current = false;
            const controller = new AbortController();
            fetchDashboardStats(startDate, endDate, controller);
        } else {
            toast.error('Выберите корректный диапазон дат');
        }
    };

    // Filter and sort zones
    const filteredZones = useMemo(() => {
        const zones = Array.isArray(dashboardData.zoneStats) ? [...dashboardData.zoneStats] : [];
        if (!searchTerm) return zones;

        return zones.filter(zone =>
            (zone.zoneName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (zone.warehouseName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [dashboardData.zoneStats, searchTerm]);

    const sortedZones = useMemo(() => {
        const zones = [...filteredZones];
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
    }, [filteredZones, sortConfig]);

    const paginatedZones = sortedZones.length > 0
        ? sortedZones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : [];

    // Filter other tables
    const filteredLowStockItems = useMemo(() => {
        if (!searchTerm) return dashboardData.lowStockItems;
        return dashboardData.lowStockItems.filter(item =>
            (item.nomenclatureName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [dashboardData.lowStockItems, searchTerm]);

    const filteredDemandForecast = useMemo(() => {
        if (!searchTerm) return dashboardData.demandForecast;
        return dashboardData.demandForecast.filter(item =>
            (item.nomenclatureName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [dashboardData.demandForecast, searchTerm]);

    const filteredTrendingItems = useMemo(() => {
        if (!searchTerm) return dashboardData.trendingItems;
        return dashboardData.trendingItems.filter(item =>
            (item.nomenclatureName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [dashboardData.trendingItems, searchTerm]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        if (!dashboardData.zoneStats.length && !dashboardData.lowStockItems.length &&
            !dashboardData.demandForecast.length && !dashboardData.trendingItems.length) {
            toast.error('Нет данных для экспорта');
            return;
        }

        const headers = ['Зона', 'Склад', 'Запас', 'Транзакции', 'Заполненность', 'Низкий запас', 'Прогноз спроса', 'Тенденции'];
        const statsRow = [
            'Статистика', '',
            dashboardData.totalInventoryQuantity ?? '0',
            dashboardData.transactionCount ?? 0,
            `${dashboardData.zoneFillPercentage ?? 0}%`,
            filteredLowStockItems.length,
            filteredDemandForecast.length,
            filteredTrendingItems.length,
        ];

        const excelData = [
            headers,
            statsRow,
            ['Низкий запас', '', ''], // Section header
            ...(filteredLowStockItems || []).map(item => [item.nomenclatureName || '-', '', item.totalQuantity ?? 0]),
            ['Прогноз спроса', '', ''], // Section header
            ...(filteredDemandForecast || []).map(item => [item.nomenclatureName || '-', '', item.totalQuantity?.toFixed(1) || 0]),
            ['Тенденции', '', ''], // Section header
            ...(filteredTrendingItems || []).map(item => [item.nomenclatureName || '-', '', item.totalQuantity ?? 0]),
            ['Зоны', '', ''], // Section header
            ...(filteredZones || []).map(zone => [
                zone.zoneName || '-',
                zone.warehouseName || '-',
                '',
                '',
                `${zone.fillPercentage ?? 0}%`,
            ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        worksheet['!cols'] = [
            { wch: 20 }, // Зона
            { wch: 20 }, // Склад
            { wch: 10 }, // Запас
            { wch: 10 }, // Транзакции
            { wch: 15 }, // Заполненность
            { wch: 10 }, // Низкий запас
            { wch: 10 }, // Прогноз спроса
            { wch: 10 }, // Тенденции
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
        XLSX.writeFile(workbook, `dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Данные экспортированы в Excel');
    };

    const stats = [
        { title: 'Запас', value: dashboardData.totalInventoryQuantity, change: `+${(dashboardData.zoneFillPercentage || 0).toFixed(1)}%`, increase: true },
        { title: 'Транзакции', value: dashboardData.transactionCount, change: '0%', increase: false },
        { title: 'Низкий запас', value: filteredLowStockItems.length, change: filteredLowStockItems.length > 0 ? '+10%' : '0%', increase: filteredLowStockItems.length > 0 },
        { title: 'Заполненность', value: `${(dashboardData.zoneFillPercentage || 0).toFixed(1)}%`, change: '+5%', increase: true },
    ];

    return (
        <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
            <TableHeader
                title="Аналитика склада"
                searchQuery={searchTerm}
                setSearchQuery={setSearchTerm}
                onExport={exportToExcel}
                exportDisabled={loading || (!filteredZones.length && !filteredLowStockItems.length &&
                    !filteredDemandForecast.length && !filteredTrendingItems.length)}
                searchPlaceholder="Поиск по зонам, складам, товарам..."
                onAction={handleFilterApply}
                actionLabel={loading ? 'Загрузка...' : 'Применить фильтр'}
                actionDisabled={loading || !startDate || !endDate || new Date(startDate) > new Date(endDate)}
            />

            <div className="flex gap-4 mt-3 w-full sm:w-auto">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Начало
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        disabled={loading}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Конец
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="flex-1 mt-3">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500 text-base">
                        Ошибка: {error}
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-600">{stat.title}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-base sm:text-xl font-bold text-gray-800">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
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
                                    {filteredZones.slice(0, 6).map((zone) => (
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

                        {/* Zones Table */}
                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6">
                            <h2 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Зоны склада</h2>
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
                                        disabled={currentPage === 1 || loading}
                                        className="flex items-center gap-1 p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                        </svg>
                                        Назад
                                    </button>
                                    <span>{currentPage} / {Math.ceil(sortedZones.length / itemsPerPage)}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(sortedZones.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(sortedZones.length / itemsPerPage) || loading}
                                        className="flex items-center gap-1 p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                    >
                                        Вперед
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Low Stock, Demand Forecast, and Trends */}
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
                                            {filteredLowStockItems.length > 0 ? (
                                                filteredLowStockItems.map((item) => (
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
                                            {filteredDemandForecast.length > 0 ? (
                                                filteredDemandForecast.map((item) => (
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
                                            {filteredTrendingItems.length > 0 ? (
                                                filteredTrendingItems.map((item) => (
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
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;