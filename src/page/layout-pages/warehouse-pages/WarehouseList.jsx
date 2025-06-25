import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import { API_GET_WAREHOUSE_LIST } from "../../../api/API";
import { 
  fetchWarehousesStart, 
  fetchWarehousesSuccess, 
  fetchWarehousesFailure 
} from "../../../store/slices/warehouseSlice/warehouseListSlice";
import WarehouseDetailPanel from "./WarehouseDetailPanel";
import WarehouseSaveModal from "../../../components/modal-components/warehouse-modal/WarehouseSaveModal";
import AddButton from "../../../components/ui/AddButton";

const WarehouseList = () => {
  const authToken = useSelector((state) => state.token.token);
  const { warehouses, loading, error } = useSelector((state) => state.warehouseList || { warehouses: [], loading: false, error: null });
  const dispatch = useDispatch();

  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isWarehouseSaveModalOpen, setIsWarehouseSaveModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchWarehouseList = useCallback(async () => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }

    setIsRefreshButtonDisabled(true);
    dispatch(fetchWarehousesStart());
    try {
      const response = await axios.get(API_GET_WAREHOUSE_LIST, {
        headers: { "Auth-token": authToken },
      });
      if (response.data && Array.isArray(response.data.body)) {
        const validatedData = response.data.body.map((warehouse) => ({
          ...warehouse,
          warehouseCapacity: parseFloat(warehouse.warehouseCapacity) || 0,
          latitude: warehouse.latitude || null,
          longitude: warehouse.longitude || null,
        }));
        dispatch(fetchWarehousesSuccess(validatedData));
        toast.success(response.data?.message || "Склады успешно загружены");
      } else {
        throw new Error("Некорректные данные от сервера");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Ошибка загрузки складов";
      dispatch(fetchWarehousesFailure(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsRefreshButtonDisabled(false);
      setHasFetched(true);
    }
  }, [authToken, dispatch]);

  useEffect(() => {
    if (authToken && warehouses.length === 0 && !hasFetched && !loading) {
      fetchWarehouseList();
    }
  }, [authToken, warehouses.length, hasFetched, loading, fetchWarehouseList]);

  const handleManualRefresh = () => {
    setHasFetched(false);
    fetchWarehouseList();
  };

  const handleOpenSaveModal = () => {
    setIsWarehouseSaveModalOpen(true);
  };

  const handleModalClose = () => {
    setIsWarehouseSaveModalOpen(false);
    setHasFetched(false);
    fetchWarehouseList();
  };

  const handleWarehouseClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setHasFetched(false);
    fetchWarehouseList();
    setTimeout(() => setSelectedWarehouse(null), 300);
  };

  const exportToExcel = () => {
    if (!filteredWarehouses.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["Название", "Заполненность", "Местоположение", "Координаты", "Дата создания", "Зоны"];
    const rows = filteredWarehouses.map((warehouse) => ({
      Название: warehouse.name,
      Заполненность: warehouse.warehouseCapacity.toFixed(1),
      Местоположение: warehouse.location || "—",
      Координаты:
        warehouse.latitude && warehouse.longitude
          ? `${warehouse.latitude.toFixed(4)}, ${warehouse.longitude.toFixed(4)}`
          : "—",
      "Дата создания": warehouse.createdAt || "—",
      Зоны: warehouse.zonesCount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Склады");
    XLSX.writeFile(workbook, `warehouses_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Склады экспортированы в Excel");
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen p-2 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-1.5">
              <IoIosNotificationsOutline size={22} className="text-blue-600" />
              <span>Склады ({filteredWarehouses.length})</span>
            </h1>
            <button
              onClick={handleManualRefresh}
              disabled={loading || isRefreshButtonDisabled}
              className={`p-2 rounded-full ${
                loading || isRefreshButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
              title="Обновить"
            >
              <IoIosNotificationsOutline size={22} className="text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Найти склад..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 shadow-sm transition-all duration-200 hover:shadow-md placeholder-gray-400"
            />
            <button
              onClick={exportToExcel}
              disabled={!filteredWarehouses.length}
              className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
            >
              Экспорт в Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">Ошибка: {error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full">
            {filteredWarehouses.length > 0 ? (
              filteredWarehouses.map((warehouse) => {
                const capacity = warehouse.warehouseCapacity || 0;
                const hasCoordinates = warehouse.latitude !== null && warehouse.longitude !== null;
                return (
                  <div
                    key={warehouse.id}
                    className="relative bg-white shadow-lg rounded-xl p-4 border border-gray-50 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden group"
                    onClick={() => handleWarehouseClick(warehouse)}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-bold text-gray-800 truncate max-w-[70%] leading-tight">
                        {warehouse.name}
                      </h2>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                          capacity < 50
                            ? "bg-red-50 text-red-700"
                            : capacity < 80
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {capacity.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(capacity, 100)}%`,
                          background: `linear-gradient(to right, ${
                            capacity < 50 ? "#ef4444" : capacity < 80 ? "#f59e0b" : "#10b981"
                          }, ${capacity < 50 ? "#dc2626" : capacity < 80 ? "#d97706" : "#059669"})`,
                        }}
                      />
                    </div>

                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2 truncate">
                        <FaMapMarkerAlt size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{warehouse.location || "—"}</span>
                      </li>
                      {hasCoordinates && (
                        <li className="flex items-center gap-2 truncate">
                          <FaMapMarkerAlt size={12} className="text-blue-400 flex-shrink-0" />
                          <span className="truncate">
                            {warehouse.latitude.toFixed(4)}, {warehouse.longitude.toFixed(4)}
                          </span>
                        </li>
                      )}
                      <li className="truncate">
                        <span className="font-semibold text-gray-700">Создан:</span>{" "}
                        {warehouse.createdAt || "—"}
                      </li>
                      <li>
                        <span className="font-semibold text-gray-700">Зон:</span>{" "}
                        {warehouse.zonesCount || 0}
                      </li>
                    </ul>

                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-gray-600 text-base">
                  {searchQuery ? "Склады не найдены" : "Нет доступных складов"}
                </p>
                <p className="text-gray-500 text-xs mt-1">Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AddButton onClick={handleOpenSaveModal} />

      {isWarehouseSaveModalOpen && (
        <WarehouseSaveModal
          authToken={authToken}
          setIsWarehouseSaveModalOpen={setIsWarehouseSaveModalOpen}
          onClose={handleModalClose}
        />
      )}

      <WarehouseDetailPanel
        warehouse={selectedWarehouse}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
};

export default WarehouseList;