import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ZoneCard from './ZoneCard';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import { HiOutlineCube, HiRefresh, HiPlus } from "react-icons/hi";
import { toast } from 'react-toastify';

const WarehouseZoneList = () => {
    const location = useLocation();
    const { warehouse } = location.state || {};
    const authToken = useSelector((state) => state.token.token);
    const user = useSelector((state) => state.user);

    const [cabinets, setCabinets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const hasRole = (role) => user?.userRoles?.includes(role) ?? false;

    const fetchCabinets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/employee/warehouses/${warehouse.id}/zones`,
                { headers: { "Auth-token": authToken } }
            );
            setCabinets(response.data.body.filter(zone => !zone.parentId));
            setLoading(false);
        } catch (error) {
            console.error("Error loading cabinets:", error);
            setError('Ошибка загрузки шкафов');
            setLoading(false);
            toast.error("Не удалось загрузить шкафы");
        }
    }, [warehouse?.id, authToken]);

    useEffect(() => {
        if (warehouse?.id) {
            fetchCabinets();
        }
    }, [warehouse?.id, fetchCabinets]);

    const filteredCabinets = useMemo(() => {
        return cabinets.filter(cabinet =>
            cabinet.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [cabinets, searchQuery]);

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineCube className="w-6 h-6 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Шкафы склада: {warehouse?.name}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Всего шкафов: {cabinets.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Поиск шкафа..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                onClick={fetchCabinets}
                                className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                                disabled={loading}
                            >
                                <HiRefresh className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                                Обновить
                            </button>
                        </div>
                    </div>

                    {/* Индикатор загрузки или ошибка */}
                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="text-gray-500 mt-2">Загрузка...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-4 text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Сетка шкафов */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCabinets.length > 0 ? (
                                filteredCabinets.map(cabinet => (
                                    <div
                                        key={cabinet.id}
                                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                        <ZoneCard
                                            zone={cabinet}
                                            warehouse={warehouse}
                                            isCabinet={true}
                                            onClose={fetchCabinets}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-4 text-gray-500">
                                    Шкафов не найдено
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {hasRole("warehouse_manager") && (
                    <button
                        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl transition-transform duration-200 hover:scale-105"
                        onClick={() => setIsModalOpen(true)}
                        title="Добавить шкаф"
                    >
                        <HiPlus size={24} />
                    </button>
                )}

                {isModalOpen && (
                    <WarehouseZoneSaveModal
                        setIsWarehouseSaveModalOpen={setIsModalOpen}
                        warehouseId={warehouse.id}
                        parentId={null}
                        setIsZoneCreated={fetchCabinets}
                    />
                )}
            </div>
        </div>
    );
};

export default WarehouseZoneList;