import React, { useState, useCallback, useMemo } from 'react';
import { BiDotsVerticalRounded, BiCog, BiTrash, BiPlus } from "react-icons/bi";
import { HiArrowSmDown } from "react-icons/hi";
import { useSelector } from "react-redux";
import axios from "axios";
import ContainerOrSubzoneCard from './ContainerOrSubzoneCard';
import WarehouseContainerSaveModal from './WarehouseContainerSaveModal';
import WarehouseZoneSaveModal from '../../components/modal-components/WarehouseZoneCreateModal';
import ZoneSettingModal from '../../components/modal-components/warehouse-modal/ZoneSettingModal';
import { toast } from 'react-toastify';
import Notification from "../../components/notification/Notification";
import { FaRulerCombined, FaCube } from "react-icons/fa";

const ZoneCard = ({ zone, warehouse, isCabinet = false, onClose }) => {
    const authToken = useSelector((state) => state.token.token);
    const [menuOpen, setMenuOpen] = useState(null);
    const [shelves, setShelves] = useState([]);
    const [containers, setContainers] = useState({});
    const [openShelves, setOpenShelves] = useState(false);
    const [openContainers, setOpenContainers] = useState({});
    const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
    const [selectedZoneId, setSelectedZoneId] = useState(null);

    const fetchShelves = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/employee/warehouses/${warehouse.id}/zones`,
                { headers: { "Auth-token": authToken } }
            );
            setShelves(response.data.body.filter(z => z.parentId === zone.id));
        } catch (error) {
            console.error("Ошибка загрузки подзон:", error);
            toast.error("Ошибка загрузки подзон");
        }
    }, [authToken, warehouse.id, zone.id]);

    const fetchContainers = useCallback(async (zoneId) => {
        if (containers[zoneId]) return;
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/warehouse-manager/warehouse/container/${zoneId}`,
                { headers: { "Auth-token": authToken } }
            );
            setContainers(prev => ({ ...prev, [zoneId]: response.data.body }));
        } catch (error) {
            console.error("Ошибка загрузки контейнеров:", error);
            toast.error(response.data.body || "Ошибка загрузки контейнеров");
        }
    }, [authToken, containers]);

    const toggleShelves = useCallback(() => {
        if (!openShelves && !shelves.length) fetchShelves();
        setOpenShelves(prev => !prev);
    }, [openShelves, shelves.length, fetchShelves]);

    const toggleContainers = useCallback((zoneId) => {
        if (!containers[zoneId]) fetchContainers(zoneId);
        setOpenContainers(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
    }, [containers, fetchContainers]);

    const handleDelete = useCallback(async (id) => {
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
    }, [authToken, isCabinet, onClose, fetchShelves]);

    const handleModalOpen = (setter, zoneId = zone.id) => () => {
        setSelectedZoneId(zoneId);
        setter(true);
        setMenuOpen(null);
    };

    const handleModalClose = (setter, callback) => () => {
        setter(false);
        callback?.();
    };

    const freeCapacity = useMemo(() => {
        const totalCapacity = zone.capacity || 0;
        const zoneContainers = containers[zone.id] || [];
        const occupied = zoneContainers.reduce((sum, c) => sum + (c.capacity || 0), 0);
        return Math.max(totalCapacity - occupied, 0);
    }, [zone.capacity, containers[zone.id]]);

    const dimensions = `${zone.length || '-'} × ${zone.width || '-'} × ${zone.height || '-'}`;

    const ZoneMenu = ({ isCabinet, zoneId }) => (
        <div className="relative flex items-center gap-2">
            <span className="text-xs text-[#1A73E8]">ID: {zoneId}</span>
            <button
                className="p-1 hover:bg-gray-100 rounded-full"
                onClick={() => setMenuOpen(menuOpen === zoneId ? null : zoneId)}
            >
                <BiDotsVerticalRounded size={20} className="text-gray-500" />
            </button>
            {menuOpen === zoneId && (
                <div className="absolute right-0 mt-1 top-full w-40 bg-white shadow-md rounded border border-gray-200 z-10">
                    <button className="flex items-center gap-1 w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-50" onClick={handleModalOpen(setIsSettingModalOpen)}>
                        <BiCog size={16} /> Настройки
                    </button>
                    <button
                        className="flex items-center gap-1 w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={isCabinet ? handleModalOpen(setIsZoneModalOpen) : handleModalOpen(setIsContainerModalOpen)}
                    >
                        <BiPlus size={16} /> {isCabinet ? "Подзона" : "Контейнер"}
                    </button>
                    <button className="flex items-center gap-1 w-full px-2 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => handleDelete(zoneId)}>
                        <BiTrash size={16} /> Удалить
                    </button>
                </div>
            )}
        </div>
    );

    const ShelfCard = ({ shelf }) => {
        const shelfFreeCapacity = useMemo(() => {
            const totalCapacity = shelf.capacity || 0;
            const shelfContainers = containers[shelf.id] || [];
            const occupied = shelfContainers.reduce((sum, c) => sum + (c.capacity || 0), 0);
            return Math.max(totalCapacity - occupied, 0);
        }, [shelf.capacity, containers[shelf.id]]);

        const shelfDimensions = `${shelf.length || '-'} × ${shelf.width || '-'} × ${shelf.height || '-'}`;

        return (
            <div className="bg-white p-2 rounded border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => toggleContainers(shelf.id)} className="p-1 hover:bg-gray-100 rounded-full">
                            <HiArrowSmDown className={`w-5 h-5 text-gray-500 ${openContainers[shelf.id] ? 'rotate-180' : ''}`} />
                        </button>
                        <div>
                            <div className="text-sm font-medium text-gray-800">{isCabinet ? `Подзона: ${shelf.name}` : shelf.name}</div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                                <FaRulerCombined size={10} className="text-gray-400" />
                                <span>{shelfDimensions} м</span>
                                <span className="text-gray-400">|</span>
                                <FaCube size={10} className="text-gray-400" />
                                <span>{shelf.capacity || '-'} м³</span>
                                <span className="text-gray-400">|</span>
                                <span className={shelfFreeCapacity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {shelfFreeCapacity} м³ свободно
                                </span>
                            </div>
                        </div>
                    </div>
                    <ZoneMenu isCabinet={false} zoneId={shelf.id} />
                </div>
                {openContainers[shelf.id] && (
                    <div className="mt-1">
                        {containers[shelf.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {containers[shelf.id].map(container => (
                                    <ContainerOrSubzoneCard
                                        key={container.id}
                                        item={container}
                                        type="контейнер"
                                        onDelete={(id) => setContainers(prev => ({ ...prev, [shelf.id]: prev[shelf.id].filter(c => c.id !== id) }))}
                                        onSetting={(item) => console.log("Настройки контейнера:", item)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500 text-center py-1">Контейнеров нет</div>
                        )}
                    </div>
                )}
                <button
                    className="mt-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    onClick={handleModalOpen(setIsContainerModalOpen, shelf.id)}
                >
                    <BiPlus size={16} /> Добавить контейнер
                </button>
            </div>
        );
    };

    return (
        <div className={`mb-4 rounded border border-gray-200 shadow-sm ${isCabinet ? 'bg-white p-3 w-full max-w-10xl' : 'bg-gray-50 p-2'}`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={isCabinet ? toggleShelves : () => toggleContainers(zone.id)} className="p-1 hover:bg-gray-100 rounded-full">
                        <HiArrowSmDown className={`w-5 h-5 text-gray-500 ${isCabinet ? openShelves : openContainers[zone.id] ? 'rotate-180' : ''}`} />
                    </button>
                    <div>
                        <div className="text-sm font-medium text-gray-800">
                            {isCabinet ? `Зона: ${zone.name}` : zone.name}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                            <FaRulerCombined size={10} className="text-gray-400" />
                            <span>{dimensions} м</span>
                            <span className="text-gray-400">|</span>
                            <FaCube size={10} className="text-gray-400" />
                            <span>{zone.capacity || '-'} м³</span>
                            <span className="text-gray-400">|</span>
                            <span className={freeCapacity > 0 ? 'text-green-600' : 'text-red-600'}>
                                {freeCapacity} м³ свободно
                            </span>
                        </div>
                    </div>
                </div>
                <ZoneMenu isCabinet={isCabinet} zoneId={zone.id} />
            </div>

            {isCabinet && openShelves && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {shelves.map(shelf => <ShelfCard key={shelf.id} shelf={shelf} />)}
                </div>
            )}

            {!isCabinet && openContainers[zone.id] && (
                <div className="mt-1">
                    {containers[zone.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {containers[zone.id].map(container => (
                                <ContainerOrSubzoneCard
                                    key={container.id}
                                    item={container}
                                    type="контейнер"
                                    onDelete={(id) => setContainers(prev => ({ ...prev, [zone.id]: prev[zone.id].filter(c => c.id !== id) }))}
                                    onSetting={(item) => console.log("Настройки контейнера:", item)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 text-center py-1">Контейнеров нет</div>
                    )}
                </div>
            )}

            {isContainerModalOpen && (
                <WarehouseContainerSaveModal
                    setIsContainerSaveModalOpen={setIsContainerModalOpen}
                    warehouseZoneId={selectedZoneId}
                    freeCapacity={selectedZoneId === zone.id ? freeCapacity : shelves.find(s => s.id === selectedZoneId)?.capacity - (containers[selectedZoneId]?.reduce((sum, c) => sum + (c.capacity || 0), 0) || 0) || 0}
                    onClose={handleModalClose(setIsContainerModalOpen, () => fetchContainers(selectedZoneId))}
                />
            )}
            {isSettingModalOpen && (
                <ZoneSettingModal
                    setIsSettingModalOpen={setIsSettingModalOpen}
                    zone={zone}
                    onClose={handleModalClose(setIsSettingModalOpen, onClose)}
                    warehouseId={warehouse.id}
                />
            )}
            {isZoneModalOpen && (
                <WarehouseZoneSaveModal
                    setIsWarehouseSaveModalOpen={setIsZoneModalOpen}
                    warehouseId={warehouse.id}
                    parentId={zone.id}
                    setIsZoneCreated={handleModalClose(setIsZoneModalOpen, () => { fetchShelves(); onClose(); })}
                />
            )}
            <Notification />
        </div>
    );
};

export default ZoneCard;