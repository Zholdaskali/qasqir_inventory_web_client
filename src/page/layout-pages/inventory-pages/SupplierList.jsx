import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import { API_GET_ALL_SUPPLIERS } from "../../../api/API";
import SupplierSaveModal from "../../../components/modal-components/supplier-modal/SupplierSaveModal";
import SupplierSettingModal from "../../../components/modal-components/supplier-modal/SupplierSettingModal";
import Notification from "../../../components/notification/Notification";
import { 
  fetchSuppliersStart, 
  fetchSuppliersSuccess, 
  fetchSuppliersFailure 
} from "../../../store/slices/layout/setting/supplierSlice";

const SupplierList = () => {
  const dispatch = useDispatch();
  const { suppliers, loading, error } = useSelector((state) => state.supplierList || { suppliers: [], loading: false, error: null });
  const authToken = useSelector((state) => state.token.token);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Флаг для отслеживания выполнения запроса

  const loadSuppliers = useCallback(async () => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }

    if (loading) return;

    setIsRefreshButtonDisabled(true);
    dispatch(fetchSuppliersStart());
    try {
      const response = await axios.get(API_GET_ALL_SUPPLIERS, {
        headers: { "Auth-token": authToken },
      });
      dispatch(fetchSuppliersSuccess(response.data.body || [])); 
      toast.success(response.data.message || "Список поставщиков успешно обновлен");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ошибка при загрузке поставщиков";
      dispatch(fetchSuppliersFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Error fetching suppliers:", err);
    } finally {
      setIsRefreshButtonDisabled(false);
      setHasFetched(true); // Устанавливаем флаг после завершения запроса
    }
  }, [authToken, dispatch, loading]);

  useEffect(() => {
    // Выполняем запрос только если:
    // 1. Есть токен
    // 2. Данные еще не загружены (suppliers пустой)
    // 3. Запрос еще не выполнялся (hasFetched === false)
    // 4. Нет активной загрузки
    if (authToken && suppliers.length === 0 && !hasFetched && !loading) {
      loadSuppliers();
    }
  }, [authToken, suppliers.length, hasFetched, loading, loadSuppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const handleCreateSupplierModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedSupplier(null);
    setHasFetched(false); // Сбрасываем флаг для обновления данных
    loadSuppliers();
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setHasFetched(false); // Сбрасываем флаг для обновления данных
    loadSuppliers();
  };

  const handleManualRefresh = () => {
    setHasFetched(false); // Сбрасываем флаг для повторного запроса
    loadSuppliers();
  };

  const exportToCSV = () => {
    if (!filteredSuppliers.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Имя",
      "Контактная информация",
      "Дата создания",
      "Последнее изменение",
    ];

    const rows = filteredSuppliers.map((supplier) => [
      supplier.id,
      supplier.name,
      supplier.contactInfo || "",
      supplier.createdAt,
      supplier.updatedAt,
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((item) => `"${item}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Список поставщиков экспортирован в CSV");
  };

  return (
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
      <div className="flex flex-col gap-y-5 overflow-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Поставщики</h1>
            <button
              onClick={handleManualRefresh}
              disabled={loading || isRefreshButtonDisabled}
              className={`p-2 rounded-full ${
                loading || isRefreshButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
              title="Обновить"
            >
              <HiRefresh className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Поиск поставщика..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <button
              onClick={exportToCSV}
              disabled={!filteredSuppliers.length}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Экспорт в CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-lg text-red-500">Ошибка: {error}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full border-separate border-spacing-y-2 min-w-max">
              <thead className="text-gray-500 bg-gray-50 sticky top-0 z-10">
                <tr className="text-sm h-10">
                  <th className="text-left px-2">ID</th>
                  <th className="text-left px-2">Имя</th>
                  <th className="text-left px-2">Контактная информация</th>
                  <th className="text-left px-2">Дата создания</th>
                  <th className="text-left px-2">Последнее изменение</th>
                  <th className="text-left px-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="bg-white hover:bg-gray-50 border-t transition cursor-pointer"
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <td className="py-3 px-2 text-sm">{supplier.id}</td>
                      <td className="py-3 px-2 text-sm">{supplier.name}</td>
                      <td className="py-3 px-2 text-sm">{supplier.contactInfo || "-"}</td>
                      <td className="py-3 px-2 text-sm">{supplier.createdAt}</td>
                      <td className="py-3 px-2 text-sm">{supplier.updatedAt}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupplier(supplier);
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FiSettings className="w-5 h-5 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-sm">
                      {searchQuery ? "Поставщики не найдены" : "Нет доступных поставщиков"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <button
          className={`fixed bottom-6 right-6 w-12 h-12 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          } transition-all`}
          onClick={handleCreateSupplierModal}
          disabled={loading}
          aria-label="Добавить поставщика"
        >
          +
        </button>
      </div>

      <Notification />

      {selectedSupplier && (
        <SupplierSettingModal
          supplier={selectedSupplier}
          onClose={handleModalClose}
        />
      )}

      {isCreateModalOpen && (
        <SupplierSaveModal
          onClose={handleCreateModalClose}
          fetchSupplierList={loadSuppliers}
        />
      )}
    </div>
  );
};

export default SupplierList;