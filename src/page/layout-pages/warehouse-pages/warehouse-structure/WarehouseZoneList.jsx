import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import ZoneCard from './ZoneCard';
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import WarehouseZoneCreateModal from '../../../../components/modal-components/WarehouseZoneCreateModal';
import { HiOutlineCube, HiRefresh, HiPlus, HiViewGrid, HiCube } from "react-icons/hi";
import { toast } from 'react-toastify';
import Notification from '../../../../components/notification/Notification';
import Warehouse3DViewer from './Warehouse3DViewer';

// Импорт API-путей
import { API_GET_WAREHOUSE_STRUCTURE_BY_ID } from "../../../../api/API";

const WarehouseZoneList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { warehouse } = location.state || {};
  const authToken = useSelector((state) => state.token.token);
  const user = useSelector((state) => state.user);

  const [warehouseData, setWarehouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('list');

  const hasRole = (role) => user?.userRoles?.includes(role) ?? false;

  const fetchWarehouseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_GET_WAREHOUSE_STRUCTURE_BY_ID.replace("{warehouseId}", warehouse.id)}`,
        { headers: { "Auth-token": authToken } }
      );
      setWarehouseData(response.data.body);
      setLoading(false);
    } catch (error) {
      console.error("Error loading warehouse data:", error);
      setError('Ошибка загрузки данных склада');
      setLoading(false);
      toast.error("Не удалось загрузить данные склада");
    }
  }, [warehouse?.id, authToken]);

  useEffect(() => {
    if (warehouse?.id) {
      fetchWarehouseData();
    }
  }, [warehouse?.id, fetchWarehouseData]);

  const filteredCabinets = useMemo(() => {
    if (!warehouseData?.zones || !Array.isArray(warehouseData.zones)) return [];
    const cabinets = warehouseData.zones.filter(zone => !zone.parentId);
    return cabinets.map(cabinet => {
      const subZones = warehouseData.zones.filter(zone => zone.parentId === cabinet.id);
      const cabinetVolume = (cabinet.width || 2) * (cabinet.height || 4) * (cabinet.length || 2);
      const occupiedVolume = subZones.reduce((sum, zone) => {
        const containers = warehouseData.zones.filter(c => c.parentId === zone.id);
        const containerVolume = containers.reduce((acc, cont) => {
          return acc + ((cont.width || 1) * (cont.height || 1) * (cont.length || 1));
        }, 0);
        return sum + ((zone.width || 2) * (zone.height || 1) * (zone.length || 2)) + containerVolume;
      }, 0);
      const freeVolume = cabinetVolume - occupiedVolume;
      return { ...cabinet, freeVolume, cabinetVolume, subZones };
    }).filter(cabinet =>
      cabinet.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    );
  }, [warehouseData, searchQuery]);

  const exportZonesToCSV = () => {
    if (!warehouseData?.zones) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Название",
      "Тип",
      "Родительский ID",
      "Ширина",
      "Высота",
      "Длина",
      "Свободный объем",
      "Общий объем",
    ];

    const rows = filteredCabinets.flatMap(cabinet => {
      const cabinetRow = [
        `"${cabinet.id}"`,
        `"${cabinet.name}"`,
        '"Шкаф"',
        '"—"',
        cabinet.width || 2,
        cabinet.height || 4,
        cabinet.length || 2,
        cabinet.freeVolume.toFixed(2),
        cabinet.cabinetVolume.toFixed(2),
      ];

      const subZoneRows = cabinet.subZones.flatMap(subZone => {
        const subZoneRow = [
          `"${subZone.id}"`,
          `"${subZone.name}"`,
          '"Подзона"',
          `"${cabinet.id}"`,
          subZone.width || 2,
          subZone.height || 1,
          subZone.length || 2,
          "—",
          "—",
        ];

        const containerRows = warehouseData.zones
          .filter(container => container.parentId === subZone.id)
          .map(container => [
            `"${container.id}"`,
            `"${container.name}"`,
            '"Контейнер"',
            `"${subZone.id}"`,
            container.width || 1,
            container.height || 1,
            container.length || 1,
            "—",
            "—",
          ]);

        return [subZoneRow, ...containerRows];
      });

      return [cabinetRow, ...subZoneRows];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zones_${warehouseData?.name || 'unknown'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Список зон экспортирован в CSV");
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full flex flex-col ">
      <div className="flex-grow max-w-full mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
          {/* Шапка с управлением */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <HiOutlineCube className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Шкафы склада: {warehouseData?.name || warehouse?.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Всего шкафов: {filteredCabinets.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Поиск шкафа..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={fetchWarehouseData}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                  disabled={loading}
                >
                  <HiRefresh className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                  Обновить
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? '3d' : 'list')}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm"
                >
                  {viewMode === 'list' ? <HiCube className="w-4 h-4" /> : <HiViewGrid className="w-4 h-4" />}
                  {viewMode === 'list' ? '3D Вид' : 'Список'}
                </button>
                <button
                  onClick={exportZonesToCSV}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Экспорт в CSV
                </button>
                <button
                  onClick={() => navigate('/warehouse-list')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Вернуться
                </button>
              </div>
            </div>
          </div>

          {/* Основное содержимое */}
          <div className="flex-grow w-full h-full overflow-auto p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 mt-2">Загрузка...</p>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && viewMode === 'list' && (
              <div className="flex flex-col gap-4 h-full overflow-y-auto">
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
                        onClose={fetchWarehouseData}
                        allZones={warehouseData.zones}
                        freeVolume={cabinet.freeVolume}
                        cabinetVolume={cabinet.cabinetVolume}
                        subZones={cabinet.subZones}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Шкафов не найдено
                  </div>
                )}
              </div>
            )}

            {!loading && !error && viewMode === '3d' && warehouseData && (
              <div className="h-full w-full">
                <Warehouse3DViewer warehouseData={warehouseData} />
              </div>
            )}
          </div>
        </div>

        {/* Кнопка добавления шкафа */}
        {hasRole("warehouse_manager") && (
          <button
            className="fixed bottom-6 right-6 w-12 h-12 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center"
            onClick={() => setIsModalOpen(true)}
            title="Добавить шкаф"
          >
            +
          </button>
        )}

        {/* Модальное окно */}
        {isModalOpen && (
          <WarehouseZoneCreateModal
            setIsWarehouseSaveModalOpen={setIsModalOpen}
            warehouseId={warehouse.id}
            parentId={null}
            width={Infinity}
            height={Infinity}
            length={Infinity}
            setIsZoneCreated={fetchWarehouseData}
          />
        )}
      </div>
      <Notification />
    </div>
  );
};

export default WarehouseZoneList;