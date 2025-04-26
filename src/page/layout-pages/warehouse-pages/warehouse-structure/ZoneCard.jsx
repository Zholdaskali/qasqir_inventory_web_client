import React, { useState, useCallback, useMemo } from 'react';
import { BiDotsVerticalRounded, BiPlus, BiTrash, BiCog } from 'react-icons/bi';
import { HiArrowSmDown } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ContainerCard from './ContainerCard';
import WarehouseContainerSaveModal from '../../../../components/modal-components/warehouse-modal/WarehouseContainerSaveModal';
import WarehouseZoneCreateModal from '../../../../components/modal-components/WarehouseZoneCreateModal';
import ZoneSettingModal from '../../../../components/modal-components/warehouse-modal/ZoneSettingModal';
import ConfirmationWrapper from '../../../../components/ui/ConfirmationWrapper';
import { toast } from 'react-toastify';
import {
  FaRulerCombined,
  FaCube,
  FaInfoCircle,
  FaLayerGroup,
  FaPercentage,
} from 'react-icons/fa';
import { API_DELETE_WAREHOUSE_ZONE, API_DELETE_WAREHOUSE_CONTAINER } from '../../../../api/API';

const ZoneCard = ({ zone, warehouse, allZones }) => {
  const authToken = useSelector((state) => state.token.token);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shelves, setShelves] = useState([]);
  const [containers, setContainers] = useState({});
  const [openShelves, setOpenShelves] = useState(false);
  const [openContainers, setOpenContainers] = useState({});
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchShelves = useCallback(() => {
    const subZones = allZones.filter((z) => z.parentId === zone.id);
    setShelves(subZones);
  }, [allZones, zone.id]);

  const initializeContainers = useCallback(
    (zoneId) => {
      if (!containers[zoneId]) {
        const zoneData = allZones.find((z) => z.id === zoneId);
        setContainers((prev) => ({
          ...prev,
          [zoneId]: zoneData?.containers || [],
        }));
      }
    },
    [allZones, containers]
  );

  const toggleShelves = useCallback(() => {
    if (!openShelves && !shelves.length) fetchShelves();
    setOpenShelves((prev) => !prev);
  }, [openShelves, shelves.length, fetchShelves]);

  const toggleContainers = useCallback(
    (zoneId) => {
      initializeContainers(zoneId);
      setOpenContainers((prev) => ({ ...prev, [zoneId]: !prev[zoneId] }));
    },
    [initializeContainers]
  );

  const handleDeleteZone = useCallback(
    async (zoneId) => {
      try {
        await axios.delete(
          API_DELETE_WAREHOUSE_ZONE.replace('{warehouseZoneId}', zoneId),
          { headers: { 'Auth-token': authToken } }
        );
        toast.success('Зона удалена');
        fetchShelves();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка удаления зоны');
      }
    },
    [authToken, fetchShelves]
  );

  const handleDeleteContainer = useCallback(
    async (zoneId, containerId) => {
      try {
        await axios.delete(
          API_DELETE_WAREHOUSE_CONTAINER.replace('{containerId}', containerId),
          { headers: { 'Auth-token': authToken } }
        );
        setContainers((prev) => ({
          ...prev,
          [zoneId]: prev[zoneId].filter((c) => c.id !== containerId),
        }));
        toast.success('Контейнер удалён');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка удаления контейнера');
      }
    },
    [authToken]
  );

  const freeCapacity = useMemo(() => {
    const totalCapacity = zone.capacity || 0;
    const zoneContainers = containers[zone.id] || zone.containers || [];
    const occupied = zoneContainers.reduce((sum, c) => sum + (c.capacity || 0), 0);
    return Math.max(totalCapacity - occupied, 0);
  }, [zone.capacity, zone.containers, containers]);

  const fillPercentage = useMemo(() => {
    const totalCapacity = zone.capacity || 0;
    return totalCapacity > 0
      ? Math.round(((totalCapacity - freeCapacity) / totalCapacity) * 100)
      : 0;
  }, [zone.capacity, freeCapacity]);

  const dimensions = `${zone.length || '-'} × ${zone.width || '-'} × ${zone.height || '-'}`;

  const ZoneMenu = ({ zoneObj, isParent }) => (
    <div className="relative flex items-center gap-1 sm:gap-2">
      <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-100 px-1.5 sm:px-2 py-0.5 rounded-full">
        #{zoneObj.id}
      </span>
      <button
        className="p-0.5 sm:p-1 hover:bg-gray-200 rounded-full transition-colors duration-150"
        onClick={() => setMenuOpen(menuOpen === zoneObj.id ? null : zoneObj.id)}
      >
        <BiDotsVerticalRounded size={14} className="sm:w-4 sm:h-4 text-gray-500" />
      </button>
      {menuOpen === zoneObj.id && (
        <div className="absolute right-0 top-full mt-1 w-32 sm:w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-1">
          {isParent && (
            <button
              className="flex items-center gap-1 sm:gap-2 w-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150"
              onClick={() => {
                setSelectedZone(zoneObj);
                setIsZoneModalOpen(true);
                setMenuOpen(false);
              }}
            >
              <BiPlus size={12} className="sm:w-3.5 sm:h-3.5 text-blue-500" /> Подзона
            </button>
          )}
          <button
            className="flex items-center gap-1 sm:gap-2 w-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150"
            onClick={() => {
              setSelectedZone(zoneObj);
              setIsContainerModalOpen(true);
              setMenuOpen(false);
            }}
          >
            <BiPlus size={12} className="sm:w-3.5 sm:h-3.5 text-green-500" /> Контейнер
          </button>
          <button
            className="flex items-center gap-1 sm:gap-2 w-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150"
            onClick={() => {
              setSelectedZone(zoneObj);
              setIsSettingsModalOpen(true);
              setMenuOpen(false);
            }}
          >
            <BiCog size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500" /> Настройки
          </button>
          <ConfirmationWrapper
            title="Подтверждение удаления"
            message={`Вы уверены, что хотите удалить зону "${zoneObj.name}"?`}
            onConfirm={() => {
              handleDeleteZone(zoneObj.id);
              setMenuOpen(false);
            }}
          >
            <button
              className="flex items-center gap-1 sm:gap-2 w-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
            >
              <BiTrash size={12} className="sm:w-3.5 sm:h-3.5" /> Удалить
            </button>
          </ConfirmationWrapper>
        </div>
      )}
    </div>
  );

  const ShelfCard = ({ shelf }) => {
    const shelfFreeCapacity = useMemo(() => {
      const totalCapacity = shelf.capacity || 0;
      const shelfContainers = containers[shelf.id] || shelf.containers || [];
      const occupied = shelfContainers.reduce((sum, c) => sum + (c.capacity || 0), 0);
      return Math.max(totalCapacity - occupied, 0);
    }, [shelf.capacity, shelf.containers, containers[shelf.id]]);

    const shelfFillPercentage = useMemo(() => {
      const totalCapacity = shelf.capacity || 0;
      return totalCapacity > 0
        ? Math.round(((totalCapacity - shelfFreeCapacity) / totalCapacity) * 100)
        : 0;
    }, [shelf.capacity, shelfFreeCapacity]);

    const shelfDimensions = `${shelf.length || '-'} × ${shelf.width || '-'} × ${shelf.height || '-'}`;

    return (
      <div className="p-2 sm:p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => toggleContainers(shelf.id)}
              className="p-0.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
            >
              <HiArrowSmDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 ${
                  openContainers[shelf.id] ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div>
              <div className="text-xs sm:text-sm font-medium text-gray-800 flex items-center gap-1">
                <FaLayerGroup size={10} className="sm:w-3 sm:h-3 text-gray-400" /> {shelf.name}
                <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                  ({(containers[shelf.id] || shelf.containers || []).length} конт.)
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 flex flex-wrap gap-1 sm:gap-2">
                <span className="flex items-center gap-1">
                  <FaRulerCombined size={9} className="sm:w-2.5 sm:h-2.5" /> {shelfDimensions}
                </span>
                <span className="flex items-center gap-1">
                  <FaCube size={9} className="sm:w-2.5 sm:h-2.5" /> {shelf.capacity || '-'} м³
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <FaInfoCircle
                    size={9}
                    className={`sm:w-2.5 sm:h-2.5 ${
                      shelfFreeCapacity > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  {shelfFreeCapacity} м³
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <FaPercentage size={9} className="sm:w-2.5 sm:h-2.5 text-purple-500" />{' '}
                  {shelfFillPercentage}%
                </span>
              </div>
            </div>
          </div>
          <ZoneMenu zoneObj={shelf} isParent={false} />
        </div>
        {openContainers[shelf.id] && (
          <div className="mt-1 sm:mt-2 pl-4 sm:pl-6">
            {containers[shelf.id]?.length > 0 || shelf.containers?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                {(containers[shelf.id] || shelf.containers || []).map((container) => (
                  <ContainerCard
                    key={container.id}
                    container={container}
                    onDelete={() => handleDeleteContainer(shelf.id, container.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-[10px] sm:text-xs text-gray-400 text-center py-1 bg-gray-50 rounded">
                Нет контейнеров
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-2 sm:mb-3 p-2 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggleShelves}
            className="p-0.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <HiArrowSmDown
              className={`w-4 h-4 sm:w-6 sm:h-6 text-gray-500 ${openShelves ? 'rotate-180' : ''}`}
            />
          </button>
          <div>
            <div className="text-sm sm:text-base font-medium text-gray-900 flex items-center gap-1">
              <FaLayerGroup size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400" /> {zone.name}
              <span className="text-[10px] sm:text-xs text-gray-500 ml-1">
                ({shelves.length} подзон)
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 flex flex-wrap gap-1 sm:gap-2">
              <span className="flex items-center gap-1">
                <FaRulerCombined size={10} className="sm:w-3 sm:h-3" /> {dimensions}
              </span>
              <span className="flex items-center gap-1">
                <FaCube size={10} className="sm:w-3 sm:h-3" /> {zone.capacity || '-'} м³
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <FaInfoCircle
                  size={10}
                  className={`sm:w-3 sm:h-3 ${freeCapacity > 0 ? 'text-green-500' : 'text-red-500'}`}
                />
                {freeCapacity} м³
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <FaPercentage size={10} className="sm:w-3 sm:h-3 text-purple-500" />{' '}
                {fillPercentage}%
              </span>
            </div>
          </div>
        </div>
        <ZoneMenu zoneObj={zone} isParent={true} />
      </div>

      {openShelves && (
        <div className="mt-2 sm:mt-3 pl-4 sm:pl-6">
          {shelves.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3">
              {shelves.map((shelf) => (
                <ShelfCard key={shelf.id} shelf={shelf} />
              ))}
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs text-gray-400 text-center py-1 sm:py-2 bg-gray-50 rounded">
              Нет подзон
            </div>
          )}
        </div>
      )}

      {isContainerModalOpen && (
        <WarehouseContainerSaveModal
          setIsContainerSaveModalOpen={setIsContainerModalOpen}
          warehouseZoneId={selectedZone?.id}
          onClose={() => {
            setIsContainerModalOpen(false);
            initializeContainers(selectedZone?.id);
          }}
        />
      )}
      {isZoneModalOpen && (
        <WarehouseZoneCreateModal
          setIsWarehouseSaveModalOpen={setIsZoneModalOpen}
          warehouseId={warehouse.id}
          parentId={zone.id}
          width={zone.width}
          height={zone.height}
          length={zone.length}
          setIsZoneCreated={() => {
            setIsZoneModalOpen(false);
            fetchShelves();
          }}
        />
      )}
      {isSettingsModalOpen && (
        <ZoneSettingModal
          zone={selectedZone}
          setIsSettingModalOpen={setIsSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            fetchShelves();
          }}
          warehouseId={warehouse.id}
          onSave={() => {
            fetchShelves();
          }}
        />
      )}
    </div>
  );
};

export default ZoneCard;  