import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { HiRefresh } from 'react-icons/hi';
import Notification from '../../../components/notification/Notification';
import {
    fetchNomenclaturesStart,
    fetchSyncedNomenclaturesSuccess,
    fetchNotSyncedNomenclaturesSuccess,
    fetchNomenclaturesFailure,
} from '../../../store/slices/inventorySlice/nomenclatureOneCListSlice';

const NomenclatureList = () => {
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
    const [activeTab, setActiveTab] = useState('synced'); // 'synced' или 'not-synced'

    const fetchNomenclatures = async (type) => {
        if (!authToken) {
            toast.error('Токен авторизации отсутствует');
            return;
        }

        const endpoint =
            type === 'synced'
                ? 'http://localhost:8081/api/v1/1C/nomenclatures/synced'
                : 'http://localhost:8081/api/v1/1C/nomenclatures/not-synced';

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
            const errorMessage = error.response?.data?.message || 'Ошибка загрузки номенклатур';
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

    const handleRefresh = () => {
        fetchNomenclatures(activeTab);
    };

    const exportNomenclaturesToCSV = (nomenclatures, type) => {
        try {
            if (!nomenclatures || !Array.isArray(nomenclatures) || nomenclatures.length === 0) {
                throw new Error('Нет данных для экспорта');
            }

            const headers = [
                'ID номенклатуры',
                'Название',
                'Статус синхронизации',
                'Дата последней синхронизации',
                'Дата создания',
            ];

            const rows = nomenclatures.map((nom) => [
                `"${nom.id || 'N/A'}"`,
                `"${nom.name || 'N/A'}"`,
                `"${nom.syncStatus || 'N/A'}"`,
                nom.lastSyncDate ? `"${new Date(nom.lastSyncDate).toLocaleString()}"` : '"N/A"',
                nom.createdAt ? `"${new Date(nom.createdAt).toLocaleString()}"` : '"N/A"',
            ]);

            const csvContent =
                'data:text/csv;charset=utf-8,' + [headers, ...rows].map((row) => row.join(',')).join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute(
                'download',
                `${type}_nomenclatures_${new Date().toISOString().split('T')[0]}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Экспорт ${type === 'synced' ? 'синхронизированных' : 'несинхронизированных'} номенклатур выполнен успешно`);
        } catch (error) {
            toast.error('Ошибка при экспорте в CSV: ' + (error.message || 'Неизвестная ошибка'));
            console.error('Ошибка экспорта CSV:', error);
        }
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

    return (
        <div className="w-full h-full px-2 py-2 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
            {loading ? (
                <div className="text-center text-sm sm:text-lg text-gray-600">Загрузка...</div>
            ) : (
                <div className="flex flex-col gap-y-4 sm:gap-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Список номенклатур</h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRefresh}
                                    className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    title="Обновить"
                                    disabled={loading}
                                >
                                    <HiRefresh className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => exportNomenclaturesToCSV(activeTab === 'synced' ? syncedNomenclatures : notSyncedNomenclatures, activeTab)}
                                    className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm"
                                    title="Экспорт в CSV"
                                    disabled={loading || !(activeTab === 'synced' ? syncedNomenclatures : notSyncedNomenclatures).length}
                                >
                                    Экспорт в CSV
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-3 sm:mt-0">
                            <div className="flex items-center gap-1 w-full sm:w-auto">
                                <label className="text-xs sm:text-sm font-medium text-gray-700">С:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="p-1 sm:p-1 border rounded-md shadow-sm focus:ring focus:ring-blue-200 text-xs sm:text-sm w-full"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex items-center gap-1 w-full sm:w-auto">
                                <label className="text-xs sm:text-sm font-medium text-gray-700">По:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="p-1 sm:p-1 border rounded-md shadow-sm focus:ring focus:ring-blue-200 text-xs sm:text-sm w-full"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4">
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

                    {error ? (
                        <div className="text-center py-4 text-gray-500 text-xs sm:text-sm">
                            Ошибка: {error}
                        </div>
                    ) : (activeTab === 'synced' ? syncedNomenclatures : notSyncedNomenclatures).length > 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
                            <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
                                {activeTab === 'synced' ? 'Синхронизированные номенклатуры' : 'Несинхронизированные номенклатуры'}
                            </h3>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                {(activeTab === 'synced' ? syncedNomenclatures : notSyncedNomenclatures).map((nom) => (
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
                        <div className="text-center py-4 text-gray-500 text-xs sm:text-sm">
                            Номенклатуры за выбранный период отсутствуют
                        </div>
                    )}
                </div>
            )}
            <Notification />
        </div>
    );
};

export default NomenclatureList;