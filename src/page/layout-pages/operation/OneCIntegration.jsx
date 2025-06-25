import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import Notification from '../../../components/notification/Notification';
import {
    fetchNomenclaturesStart,
    fetchSyncedNomenclaturesSuccess,
    fetchNotSyncedNomenclaturesSuccess,
    fetchNomenclaturesFailure,
} from '../../../store/slices/inventorySlice/nomenclatureOneCListSlice';
import { SYNCED, NOT_SYNCED } from "../../../api/API";
import * as XLSX from 'xlsx';
import TableHeader from '../../../components/ui/Header';

const OneCSyncNomenclaturePage = () => {
    const authToken = useSelector((state) => state.token.token);
    const { syncedNomenclatures = [], notSyncedNomenclatures = [], loading, error } = useSelector(
        (state) => state.inventory?.nomenclatureOneCList || {}
    );
    const dispatch = useDispatch();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(tomorrow.toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('synced');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNomenclatures = async (type) => {
        if (!authToken) {
            toast.error('Токен авторизации отсутствует');
            dispatch(fetchNomenclaturesFailure('Токен авторизации отсутствует'));
            return;
        }

        const endpoint = type === 'synced' ? SYNCED : NOT_SYNCED;

        try {
            dispatch(fetchNomenclaturesStart());
            const response = await axios.get(endpoint, {
                headers: { 'Auth-token': authToken },
                params: { startDate, endDate },
            });

            const nomenclatures = Array.isArray(response.data.body) ? response.data.body : [];
            const sortedNomenclatures = nomenclatures.sort(
                (a, b) => new Date(b.lastSyncDate || b.createdAt) - new Date(a.lastSyncDate || a.createdAt)
            );

            if (type === 'synced') {
                dispatch(fetchSyncedNomenclaturesSuccess(sortedNomenclatures));
            } else {
                dispatch(fetchNotSyncedNomenclaturesSuccess(sortedNomenclatures));
            }
            toast.success(`Номенклатуры (${type === 'synced' ? 'синхронизированные' : 'несинхронизированные'}) успешно загружены`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Ошибка загрузки номенклатур (${type === 'synced' ? 'синхронизированных' : 'несинхронизированных'})`;
            dispatch(fetchNomenclaturesFailure(errorMessage));
            toast.error(errorMessage);
            console.error(`Ошибка загрузки номенклатур (${type}):`, error);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchNomenclatures('synced');
            fetchNomenclatures('not-synced');
        }
    }, [authToken, startDate, endDate]);

    const filteredNomenclatures = useMemo(() => {
        const nomenclatures = activeTab === 'synced' ? syncedNomenclatures : notSyncedNomenclatures;
        if (!searchQuery) return nomenclatures;

        return nomenclatures.filter((nom) =>
            [
                nom.id?.toString(),
                nom.name,
                nom.lastSyncDate ? new Date(nom.lastSyncDate).toLocaleString() : '',
                nom.createdAt ? new Date(nom.createdAt).toLocaleString() : '',
            ].some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [syncedNomenclatures, notSyncedNomenclatures, activeTab, searchQuery]);

    const exportNomenclaturesToExcel = () => {
        const nomenclatures = filteredNomenclatures;
        if (!nomenclatures.length) {
            toast.error('Нет данных для экспорта');
            return;
        }

        const headers = [
            'ID номенклатуры',
            'Название',
            'Статус синхронизации',
            'Дата последней синхронизации',
            'Дата создания',
        ];

        const data = nomenclatures.map((nom) => ({
            'ID номенклатуры': nom.id || 'N/A',
            Название: nom.name || 'N/A',
            'Статус синхронизации': nom.syncStatus || 'N/A',
            'Дата последней синхронизации': nom.lastSyncDate ? new Date(nom.lastSyncDate).toLocaleString() : 'N/A',
            'Дата создания': nom.createdAt ? new Date(nom.createdAt).toLocaleString() : 'N/A',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'synced' ? 'Синхронизированные' : 'Несинхронизированные');
        XLSX.writeFile(workbook, `${activeTab}_nomenclatures_${new Date().toISOString().split('T')[0]}.xlsx`);

        toast.success(`Экспорт ${activeTab === 'synced' ? 'синхронизированных' : 'несинхронизированных'} номенклатур выполнен`);
    };

    const getSyncStatusStyles = (status) => {
        switch (status) {
            case 'SYNCED':
                return 'bg-green-100 text-green-700';
            case 'NOT_SYNCED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleRefresh = () => {
        fetchNomenclatures(activeTab);
    };

    const renderTabs = () => (
        <div className="flex gap-2">
            <button
                onClick={() => setActiveTab('synced')}
                className={`px-3 py-1 rounded-md text-sm ${activeTab === 'synced' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700 hover:text-white transition-colors`}
            >
                Синхронизированные
            </button>
            <button
                onClick={() => setActiveTab('not-synced')}
                className={`px-3 py-1 rounded-md text-sm ${activeTab === 'not-synced' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700 hover:text-white transition-colors`}
            >
                Несинхронизированные
            </button>
        </div>
    );

    return (
        <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
            <TableHeader
                title="Синхронизация номенклатур с 1С"
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExport={exportNomenclaturesToExcel}
                exportDisabled={loading || !filteredNomenclatures.length}
                searchPlaceholder="Поиск по ID, названию, датам..."
                onAction={handleRefresh}
                actionLabel={loading ? 'Загрузка...' : 'Обновить'}
                actionDisabled={loading || !startDate || !endDate || new Date(startDate) > new Date(endDate)}
                customActionComponent={renderTabs()}
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
                ) : filteredNomenclatures.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
                        <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
                            {activeTab === 'synced' ? 'Синхронизированные номенклатуры' : 'Несинхронизированные номенклатуры'}
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            {filteredNomenclatures.map((nom) => (
                                <div
                                    key={nom.id}
                                    className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                                        <h4 className="text-sm sm:text-md font-semibold text-gray-700">
                                            Номенклатура #{nom.id}
                                        </h4>
                                        <span
                                            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${getSyncStatusStyles(nom.syncStatus)}`}
                                        >
                                            {nom.syncStatus === 'SYNCED' ? 'Синхронизировано' : 'Не синхронизировано'}
                                        </span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                                        <p>
                                            <span className="font-medium">Название:</span> {nom.name || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Дата последней синхронизации:</span>{' '}
                                            {nom.lastSyncDate ? new Date(nom.lastSyncDate).toLocaleString() : 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Дата создания:</span>{' '}
                                            {nom.createdAt ? new Date(nom.createdAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 text-base">
                        Номенклатуры за выбранный период отсутствуют
                    </div>
                )}
            </div>
            <Notification />
        </div>
    );
};

export default OneCSyncNomenclaturePage;