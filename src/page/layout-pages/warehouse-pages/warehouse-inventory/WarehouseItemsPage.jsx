import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronDownIcon,
  CubeIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { API_GET_INVENTORY_ITEMS_BY_WAREHOUSE } from "../../../../api/API";
import {
  fetchWarehouseItemsStart,
  fetchWarehouseItemsSuccess,
  fetchWarehouseItemsFailure
} from "../../../../store/slices/warehouseSlice/warehouse-structure/warehouseItemsSlice";

const WarehouseItemsPage = () => {
  const { warehouseId } = useParams();
  const { state: { warehouse } = {} } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const warehouseItems = useSelector((state) => state.warehouseItems || {});
  const { zones = [], currentWarehouseId, loading } = warehouseItems;
  const [filteredZones, setFilteredZones] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const authToken = useSelector((state) => state.token?.token || "");

  useEffect(() => {
    const fetchItems = async () => {
      if (!warehouseId || !authToken) {
        dispatch(fetchWarehouseItemsFailure("Отсутствует warehouseId или authToken"));
        return;
      }

      // Проверяем, есть ли данные для текущего склада
      if (currentWarehouseId === warehouseId && Array.isArray(zones) && zones.length > 0) {
        setFilteredZones(zones);
        return;
      }

      dispatch(fetchWarehouseItemsStart());
      try {
        const { data: { body: { inventory = [] } = {} } = {} } = await axios.get(
          API_GET_INVENTORY_ITEMS_BY_WAREHOUSE.replace("{warehouseId}", warehouseId),
          { headers: { "Auth-token": authToken } }
        );
        const groupedZones = groupItemsByZones(inventory);
        dispatch(fetchWarehouseItemsSuccess({
          zones: groupedZones,
          warehouseId
        }));
        setFilteredZones(groupedZones);
      } catch (err) {
        console.error("Ошибка при загрузке элементов склада:", err);
        dispatch(fetchWarehouseItemsFailure(err.message));
      }
    };
    fetchItems();
  }, [warehouseId, authToken, dispatch, currentWarehouseId]); // Убрали zones из зависимостей

  useEffect(() => {
    if (!Array.isArray(zones)) return;
    setFilteredZones(
      zones
        .map((zone) => ({
          ...zone,
          items: zone.items.filter(
            (item) =>
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.code?.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(
          (zone) =>
            zone.items.length > 0 ||
            zone.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery, zones]);

  const groupItemsByZones = (inventory) => {
    if (!Array.isArray(inventory)) return [];
    const zoneMap = new Map();
    inventory.forEach((item) => {
      const { warehouseZone: zone, warehouseContainer: container } = item;
      if (!zone?.id) return;
      if (!zoneMap.has(zone.id)) {
        zoneMap.set(zone.id, {
          id: zone.id,
          name: zone.name || "Без названия",
          capacity: zone.capacity || 0,
          dimensions: `${zone.length || 0}x${zone.width || 0}x${zone.height || 0}`,
          createdAt: zone.createAt || "Не указано",
          items: [],
        });
      }
      zoneMap.get(zone.id).items.push({
        id: item.id,
        name: item.nomenclatureName || "Без названия",
        code: item.code || "Без кода",
        quantity: item.quantity || 0,
        unit: item.measurementUnit || "",
        containerSerial: container?.serialNumber || "Нет контейнера",
        containerCapacity: container?.capacity || 0,
        createdAt: item.warehouseContainer?.createdAt || "Не указано",
      });
    });
    return Array.from(zoneMap.values());
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <header className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CubeIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold">{warehouse?.name || "Склад"}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />{" "}
                {warehouse?.location || "Не указан"} | Зон:{" "}
                {warehouse?.zonesCount || zones.length}
              </p>
              <p className="text-xs text-gray-500">
                Вместимость: {warehouse?.warehouseCapacity || 0} м³ | Создан:{" "}
                {new Date(warehouse?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию или коду..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2 py-1 rounded border focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => navigate('/warehouse-list')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Вернуться
          </button>
        </div>
      </header>

      <div className="space-y-2">
        {filteredZones.length ? (
          filteredZones.map((zone) => <ZoneCard key={zone.id} zone={zone} />)
        ) : (
          <p className="text-center text-gray-500">Нет данных</p>
        )}
      </div>
    </div>
  );
};

// ZoneCard остается без изменений
const ZoneCard = ({ zone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(zone.items.length / itemsPerPage);
  const paginatedItems = zone.items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-indigo-50 cursor-pointer hover:bg-indigo-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 rounded-full bg-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold">
              {zone.name} ({zone.items.length})
            </h2>
            <p className="text-xs text-gray-600">
              Вместимость: {zone.capacity} м³ | Размеры: {zone.dimensions} м |
              Создано: {new Date(zone.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {paginatedItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded p-2 text-sm">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-gray-600">Код: {item.code}</p>
                <p className="text-gray-600">
                  {item.quantity} {item.unit}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Контейнер: {item.containerSerial} ({item.containerCapacity} м³)
                </p>
                <p className="text-xs text-gray-400">
                  Создан: {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-2 py-1 rounded bg-indigo-600 text-white disabled:bg-gray-300"
              >
                ←
              </button>
              <span>
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-2 py-1 rounded bg-indigo-600 text-white disabled:bg-gray-300"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WarehouseItemsPage;