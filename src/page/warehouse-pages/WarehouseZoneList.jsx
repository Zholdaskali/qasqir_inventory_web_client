import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ZoneCard from '../warehouse-pages/ZoneCard';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import { HiArrowSmDown, HiRefresh, HiOutlineLocationMarker } from "react-icons/hi";

const WarehouseZoneList = () => {
    const location = useLocation();
    const { warehouse } = location.state || {};
    const authToken = useSelector((state) => state.token.token);
    const user = useSelector((state) => state.user);

    const [state, setState] = useState({
        zones: [],
        loading: true,
        error: null,
        isModalOpen: false,
        openChildZones: {}
    });

    const [searchQuery, setSearchQuery] = useState(""); // Состояние для поискового запроса

    const hasRole = (role) => 
        user?.userRoles?.includes(role) ?? false;

    const fetchZones = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/employee/warehouses/${warehouse.id}/zones`,
                { headers: { "Auth-token": authToken } }
            );
            setState(prev => ({
                ...prev,
                zones: response.data.body,
                loading: false
            }));
        } catch (error) {
            console.error("Error loading zones:", error);
            setState(prev => ({
                ...prev,
                error: 'Ошибка загрузки зон',
                loading: false
            }));
        }
    };

    useEffect(() => {
        if (warehouse?.id) {
            fetchZones();
        }
    }, [warehouse?.id]);

    const buildZoneTree = (zones) => {
        const zoneMap = new Map(
            zones.map(zone => [zone.id, { ...zone, children: [] }])
        );

        return zones.reduce((rootZones, zone) => {
            if (zone.parentId) {
                const parent = zoneMap.get(zone.parentId);
                parent?.children.push(zoneMap.get(zone.id));
                return rootZones;
            }
            rootZones.push(zoneMap.get(zone.id));
            return rootZones;
        }, []);
    };

    const toggleChildZones = (zoneId) => {
        setState(prev => ({
            ...prev,
            openChildZones: {
                ...prev.openChildZones,
                [zoneId]: !prev.openChildZones[zoneId]
            }
        }));
    };

    const handleZoneCreated = () => {
        setState(prev => ({ ...prev, isModalOpen: false })); // Закрываем модальное окно
        fetchZones(); // Обновляем список зон
    };

    // Функция для фильтрации зон на основе поискового запроса
    const filterZones = (zones, query) => {
        return zones.filter(zone =>
            zone.name.toLowerCase().includes(query.toLowerCase())
        );
    };

    const filteredZones = filterZones(state.zones, searchQuery);
    const rootZones = buildZoneTree(filteredZones);

    if (!warehouse) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <HiOutlineLocationMarker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">
                        Склад не выбран. Выберите склад, чтобы увидеть зоны.
                    </p>
                </div>
            </div>
        );
    }

    if (state.loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-8">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                        Загружаем зоны...
                    </p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">!</span>
                    </div>
                    <p className="text-red-600 text-lg">
                        {state.error}
                    </p>
                </div>
            </div>
        );
    }

    const renderZoneCard = (zone, isChild = false) => (
        <div key={zone.id} 
             className={`w-full md:w-96 flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md 
                        transition-all duration-300 ${isChild ? 'border border-blue-100' : ''}`}>
            <div className="p-6">
                <ZoneCard zone={zone} warehouse={warehouse} />
                
                {zone.children.length > 0 && (
                    <>
                        <button
                            className="w-full mt-4 py-2 px-4 text-blue-600 bg-blue-50 rounded-lg
                                     hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                            onClick={() => toggleChildZones(zone.id)}
                        >
                            {state.openChildZones[zone.id] ? (
                                <>
                                    <span>Скрыть дочерние зоны</span>
                                    <HiArrowSmDown className="w-5 h-5 transform rotate-180 transition-transform" />
                                </>
                            ) : (
                                <>
                                    <span>Показать дочерние зоны</span>
                                    <HiArrowSmDown className="w-5 h-5" />
                                </>
                            )}
                        </button>
                        
                        {state.openChildZones[zone.id] && (
                            <div className="mt-6 space-y-4 pl-4 border-l-2 border-blue-100">
                                {zone.children.map(childZone => renderZoneCard(childZone, true))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 p-14">
            <div className="max-w-8xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">
                            <HiOutlineLocationMarker className="w-8 h-8 text-blue-600" />
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    {warehouse?.name}
                                </h2>
                                <p className="text-gray-500">
                                    Всего зон: {state.zones.length}
                                </p>
                            </div>
                        </div>
    
                        <div className="flex items-center gap-4">
                            {/* Поле ввода для поиска */}
                            <input
                                type="text"
                                placeholder="Поиск зоны..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
    
                            <button
                                onClick={fetchZones}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 
                                        rounded-lg hover:bg-gray-50 transition-colors"
                                title="Обновить"
                            >
                                <HiRefresh className="w-5 h-5 text-gray-600" />
                                <span>Обновить</span>
                            </button>
                        </div>
                    </div>
    
                    {/* Блок с зонами, добавляем overflow-auto */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14 overflow-auto max-h-[80vh]">
                        {rootZones.map(zone => renderZoneCard(zone))}
                    </div>
                </div>
            </div>
    
            {hasRole("warehouse_manager") && (
                <button
                    className="bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white"
                    onClick={() => setState(prev => ({ ...prev, isModalOpen: true }))}
                >
                    <span className="transform -translate-y-px">+</span>
                </button>
            )}
    
            {state.isModalOpen && (
                <WarehouseZoneSaveModal
                    setIsWarehouseSaveModalOpen={(isOpen) =>
                        setState(prev => ({ ...prev, isModalOpen: isOpen }))}
                    warehouseId={warehouse.id}
                    parentId={null}
                    setIsZoneCreated={handleZoneCreated}
                />
            )}
        </div>
    );
};

export default WarehouseZoneList;