import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BiDotsVerticalRounded, BiCog, BiTrash, BiPlus } from "react-icons/bi";
import { HiArrowSmDown } from "react-icons/hi";
import { useSelector } from "react-redux";
import axios from "axios";
import ContainerOrSubzoneCard from './ContainerOrSubzoneCard';
import WarehouseContainerSaveModal from './WarehouseContainerSaveModal';
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import ZoneSettingModal from '../../components/modal-components/warehouse-modal/ZoneSettingModal';
import { toast } from 'react-toastify';

const ZoneCard = ({ zone, warehouse, isCabinet = false, onClose }) => {
    const authToken = useSelector((state) => state.token.token);
    const [menuOpen, setMenuOpen] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [containers, setContainers] = useState({});
    const [openShelves, setOpenShelves] = useState(false);
    const [openContainers, setOpenContainers] = useState(false);
    const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
    const [isContainerHover, setIsContainerHover] = useState(null);
    const menuRef = useRef(null);
    const subzoneMenuRef = useRef(null);

    // Загрузка подзон
    const fetchShelves = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/employee/warehouses/${warehouse.id}/zones`,
                { headers: { "Auth-token": authToken } }
            );
            const updatedShelves = response.data.body.filter(z => z.parentId === zone.id);
            setShelves(updatedShelves);
        } catch (error) {
            console.error("Ошибка загрузки подзон:", error);
            toast.error("Ошибка загрузки подзон");
        }
    };

    // Загрузка контейнеров
    const fetchContainers = async (zoneId) => {
        if (containers[zoneId]) return;
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/warehouse-manager/warehouse/container/${zoneId}`,
                { headers: { "Auth-token": authToken } }
            );
            setContainers(prev => ({ ...prev, [zoneId]: response.data.body }));
        } catch (error) {
            console.error("Ошибка загрузки контейнеров:", error);
            toast.error("Ошибка загрузки контейнеров");
        }
    };

    const toggleShelves = async () => {
        if (!openShelves && shelves.length === 0) await fetchShelves();
        setOpenShelves(!openShelves);
    };

    const toggleContainers = async () => {
        if (!openContainers && !containers[zone.id]) await fetchContainers(zone.id);
        setOpenContainers(!openContainers);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `http://localhost:8081/api/v1/warehouse-manager/warehouses/${id}/zones`,
                { headers: { "Auth-token": authToken } }
            );
            toast.success("Успешно удалено");
            if (isCabinet) onClose();
            else fetchShelves();
        } catch (error) {
            toast.error("Ошибка при удалении");
        }
    };

    const handleSettingModalOpen = () => {
        setIsSettingModalOpen(true);
        setMenuOpen(null);
    };

    const handleSettingModalClose = () => {
        setIsSettingModalOpen(false);
        onClose();
    };

    const handleZoneModalOpen = () => {
        setIsZoneModalOpen(true);
        setMenuOpen(null);
    };

    const handleZoneModalClose = () => {
        setIsZoneModalOpen(false);
        fetchShelves();
        onClose();
    };

    const calculateFreeCapacity = useMemo(() => {
        const totalCapacity = zone.capacity || 0;
        const zoneContainers = containers[zone.id] || [];
        const occupiedCapacity = zoneContainers.reduce((sum, container) => sum + (container.capacity || 0), 0);
        return totalCapacity - occupiedCapacity >= 0 ? totalCapacity - occupiedCapacity : 0;
    }, [zone.capacity, containers[zone.id]]);

    const dimensions = `${zone.length || '-'}×${zone.width || '-'}×${zone.height || '-'}`;
    const freeCapacity = calculateFreeCapacity;

    return (
        <div className={`mb-6 rounded-xl shadow-lg transition-all duration-300 ${isCabinet ? 'bg-white p-6' : 'bg-gray-50 p-4'}`}>
            {/* Заголовок зоны */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={isCabinet ? toggleShelves : toggleContainers}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <HiArrowSmDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${openShelves || openContainers ? 'rotate-180' : ''}`} />
                    </button>
                    <div>
                        <span className="text-xl font-bold text-gray-800">
                            {isCabinet ? `Зона: ${zone.name}` : `Подзона: ${zone.name}`}
                        </span>
                        <div className="text-sm text-gray-500">
                            <span>ID: {zone.id} | </span>
                            <span>Размеры: {dimensions} м | </span>
                            <span>Объём: {zone.capacity || '-'} м³ | </span>
                            <span className={freeCapacity > 0 ? 'text-green-600' : 'text-red-600'}>
                                Свободно: {freeCapacity} м³
                            </span>
                        </div>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
                    <button
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={() => setMenuOpen(menuOpen === zone.id ? null : zone.id)}
                    >
                        <BiDotsVerticalRounded size={24} className="text-gray-600" />
                    </button>
                    {menuOpen === zone.id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-lg z-30 border border-gray-100">
                            <button
                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                onClick={handleSettingModalOpen}
                            >
                                <BiCog size={18} /> Настройки
                            </button>
                            {isCabinet && (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    onClick={handleZoneModalOpen}
                                >
                                    <BiPlus size={18} /> Добавить подзону
                                </button>
                            )}
                            {!isCabinet && (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    onClick={() => setIsContainerModalOpen(true)}
                                >
                                    <BiPlus size={18} /> Добавить контейнер
                                </button>
                            )}
                            <button
                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                                onClick={() => handleDelete(zone.id)}
                            >
                                <BiTrash size={18} /> Удалить
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Подзоны */}
            {isCabinet && openShelves && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-300">
                    {shelves.map(shelf => (
                        <div
                            key={shelf.id}
                            className="relative bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group border border-gray-200"
                            onMouseEnter={() => {
                                setIsContainerHover(shelf.id);
                                fetchContainers(shelf.id);
                            }}
                            onMouseLeave={() => setIsContainerHover(null)}
                        >
                            <div className="flex flex-col items-center text-center">
                                <span className="text-md font-semibold text-gray-800">
                                    Подзона: {shelf.name}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Контейнеры: {containers[shelf.id]?.length || 0}
                                </span>
                            </div>
                            <div className="absolute top-2 right-2" ref={subzoneMenuRef}>
                                <button
                                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                    onClick={() => setMenuOpen(menuOpen === shelf.id ? null : shelf.id)}
                                >
                                    <BiDotsVerticalRounded size={18} className="text-gray-600" />
                                </button>
                                {menuOpen === shelf.id && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-lg z-30 border border-gray-100">
                                        <button
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                            onClick={handleSettingModalOpen}
                                        >
                                            <BiCog size={18} /> Настройки
                                        </button>
                                        <button
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                            onClick={() => setIsContainerModalOpen(true)}
                                        >
                                            <BiPlus size={18} /> Добавить контейнер
                                        </button>
                                        <button
                                            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                                            onClick={() => handleDelete(shelf.id)}
                                        >
                                            <BiTrash size={18} /> Удалить
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Контейнеры при наведении */}
                            {shelf.id === isContainerHover && containers[shelf.id] && (
                                <div
                                    className="absolute top-full left-0 mt-2 w-64 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                >
                                    <div className="text-sm font-semibold text-gray-800 mb-2">Контейнеры:</div>
                                    {containers[shelf.id].length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {containers[shelf.id].map(container => (
                                                <ContainerOrSubzoneCard
                                                    key={container.id}
                                                    item={container}
                                                    type="контейнер"
                                                    onDelete={(id) => {
                                                        setContainers(prev => ({
                                                            ...prev,
                                                            [shelf.id]: prev[shelf.id].filter(c => c.id !== id)
                                                        }));
                                                    }}
                                                    onSetting={(item) => console.log("Настройки контейнера:", item)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm">Контейнеров нет</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Контейнеры в подзоне */}
            {!isCabinet && openContainers && containers[zone.id] && containers[zone.id].length > 0 && (
                <div className="mt-4 space-y-3">
                    {containers[zone.id].map(container => (
                        <ContainerOrSubzoneCard
                            key={container.id}
                            item={container}
                            type="контейнер"
                            onDelete={(id) => {
                                setContainers(prev => ({
                                    ...prev,
                                    [zone.id]: prev[zone.id].filter(c => c.id !== id)
                                }));
                            }}
                            onSetting={(item) => console.log("Настройки контейнера:", item)}
                        />
                    ))}
                </div>
            )}

            {/* Модальные окна */}
            {isContainerModalOpen && (
                <WarehouseContainerSaveModal
                    setIsContainerSaveModalOpen={setIsContainerModalOpen}
                    warehouseZoneId={zone.id}
                    onClose={() => {
                        setIsContainerModalOpen(false);
                        fetchContainers(zone.id);
                    }}
                />
            )}
            {isSettingModalOpen && (
                <ZoneSettingModal
                    setIsSettingModalOpen={setIsSettingModalOpen}
                    zone={zone}
                    onClose={handleSettingModalClose}
                    warehouseId={warehouse.id}
                />
            )}
            {isZoneModalOpen && (
                <WarehouseZoneSaveModal
                    setIsWarehouseSaveModalOpen={setIsZoneModalOpen}
                    warehouseId ={warehouse.id}
                    parentId={zone.id}
                    setIsZoneCreated={handleZoneModalClose}
                />
            )}
        </div>
    );
};

export default ZoneCard;