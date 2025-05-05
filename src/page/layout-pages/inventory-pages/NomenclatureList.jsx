import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { API_GET_NOMENCLATURES_BY_CATEGORY } from "../../../api/API";
import {
  fetchNomenclaturesStart,
  fetchNomenclaturesSuccess,
  fetchNomenclaturesFailure
} from "../../../store/slices/inventorySlice/nomenclatureListSlice";
import { HiOutlineRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import NomenclatureSaveModal from "../../../components/modal-components/nomenclature-modal/NomenclatureSaveModal";
import NomenclatureSettingModal from "../../../components/modal-components/nomenclature-modal/NomenclatureSettingModal";

const NomenclatureList = () => {
  const { categoryId } = useParams();
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const { nomenclatures, loading, error } = useSelector((state) => state.nomenclatureList || { nomenclatures: [], loading: false, error: null });

  const [selectedNomenclature, setSelectedNomenclature] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Флаг для отслеживания выполнения запроса

  const fetchNomenclatureList = useCallback(async () => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }

    setIsRefreshButtonDisabled(true);
    dispatch(fetchNomenclaturesStart());
    try {
      const response = await axios.get(
        API_GET_NOMENCLATURES_BY_CATEGORY.replace("{categoryId}", categoryId),
        {
          headers: { "Auth-token": authToken },
        }
      );
      dispatch(fetchNomenclaturesSuccess(response.data.body || [])); // Устанавливаем пустой массив, если данных нет
      toast.success(response.data.message || "Номенклатуры успешно загружены");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ошибка загрузки номенклатур";
      dispatch(fetchNomenclaturesFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Error fetching nomenclatures:", error);
    } finally {
      setIsRefreshButtonDisabled(false);
      setHasFetched(true); // Устанавливаем флаг после завершения запроса
    }
  }, [authToken, categoryId, dispatch]);

  useEffect(() => {
    if (authToken && nomenclatures.length === 0 && !hasFetched && !loading) {
      fetchNomenclatureList();
    }
  }, [authToken, nomenclatures.length, hasFetched, loading, fetchNomenclatureList]);

  const handleManualRefresh = () => {
    setHasFetched(false); // Сбрасываем флаг для повторного запроса
    fetchNomenclatureList();
  };

  const filteredNomenclatures = useMemo(() => {
    return nomenclatures.filter((nomenclature) =>
      nomenclature.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nomenclatures, searchQuery]);

  const handleCreateNomenclatureModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedNomenclature(null);
    setHasFetched(false); // Сбрасываем флаг для обновления данных
    fetchNomenclatureList();
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setHasFetched(false); // Сбрасываем флаг для обновления данных
    fetchNomenclatureList();
  };

  const exportToCSV = () => {
    if (!filteredNomenclatures.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Имя",
      "Артикль",
      "Код",
      "Тип",
      "Единица измерения",
      "Объем (м³)",
      "Высота (м)",
      "Длина (м)",
      "Ширина (м)",
      "Создатель",
      "Дата создания",
      "Последнее изменение",
      "Дата синхронизации"
    ];

    const rows = filteredNomenclatures.map((nomenclature) => [
      nomenclature.id,
      nomenclature.name,
      nomenclature.article || "",
      nomenclature.code || "",
      nomenclature.type || "",
      nomenclature.measurement || "",
      nomenclature.volume || "Не указано",
      nomenclature.height || "Не указано",
      nomenclature.length || "Не указано",
      nomenclature.width || "Не указано",
      nomenclature.createdBy || "",
      nomenclature.createdAt || "",
      nomenclature.updatedAt || "",
      nomenclature.syncDate || "Синхронизации не было",
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((item) => `"${item}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nomenclatures_${categoryId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Данные экспортированы в CSV");
  };

  return (
    <div className="h-[90vh] w-full flex flex-col p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Номенклатуры</h1>
          <button
            onClick={handleManualRefresh} // Изменено на handleManualRefresh
            disabled={loading || isRefreshButtonDisabled}
            className={`p-2 rounded-full ${loading || isRefreshButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            title="Обновить"
          >
            <HiOutlineRefresh className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Поиск номенклатуры..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded-md w-full sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={exportToCSV}
            disabled={!filteredNomenclatures.length}
            className="bg-green-600 px-5 py-2 text-sm text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Экспорт в CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto mt-4 rounded-lg bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-lg text-red-500">Ошибка: {error}</div>
        ) : (
          <table className="w-full table-auto border-separate border-spacing-y-1 min-w-max">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10 text-sm">
              <tr>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Имя</th>
                <th className="text-left px-3 py-2">Артикуль</th>
                <th className="text-left px-3 py-2">Код</th>
                <th className="text-left px-3 py-2">Тип</th>
                <th className="text-left px-3 py-2">Ед.изм</th>
                <th className="text-left px-3 py-2">Объем (м³)</th>
                <th className="text-left px-3 py-2">Высота (м)</th>
                <th className="text-left px-3 py-2">Длина (м)</th>
                <th className="text-left px-3 py-2">Ширина (м)</th>
                <th className="text-left px-3 py-2">Создатель</th>
                <th className="text-left px-3 py-2">Дата создания</th>
                <th className="text-left px-3 py-2">Последнее изменение</th>
                <th className="text-left px-3 py-2">Дата синхронизации</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredNomenclatures.length > 0 ? (
                filteredNomenclatures.map((nomenclature) => (
                  <tr
                    key={nomenclature.id}
                    className="hover:bg-gray-50 border-t transition cursor-pointer"
                    onClick={() => setSelectedNomenclature(nomenclature)}
                  >
                    <td className="px-3 py-2">{nomenclature.id}</td>
                    <td className="px-3 py-2">{nomenclature.name}</td>
                    <td className="px-3 py-2">{nomenclature.article || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.code || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.type || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.measurement || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.volume || "Не указано"}</td>
                    <td className="px-3 py-2">{nomenclature.height || "Не указано"}</td>
                    <td className="px-3 py-2">{nomenclature.length || "Не указано"}</td>
                    <td className="px-3 py-2">{nomenclature.width || "Не указано"}</td>
                    <td className="px-3 py-2">{nomenclature.createdBy || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.createdAt || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.updatedAt || "-"}</td>
                    <td className="px-3 py-2">{nomenclature.syncDate || "Синхронизации не было"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="text-center py-4 text-sm">
                    {searchQuery ? "Номенклатуры не найдены" : "Нет доступных номенклатур"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <button
        className={`fixed bottom-6 right-6 w-12 h-12 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          } transition-all`}
        onClick={handleCreateNomenclatureModal}
        disabled={loading}
        aria-label="Добавить номенклатуру"
      >
        +
      </button>

      {selectedNomenclature && (
        <NomenclatureSettingModal
          nomenclature={selectedNomenclature}
          onClose={handleModalClose}
        />
      )}

      {isCreateModalOpen && (
        <NomenclatureSaveModal
          onClose={handleCreateModalClose}
          categoryId={categoryId}
          fetchNomenclatureList={fetchNomenclatureList}
        />
      )}
    </div>
  );
};

export default NomenclatureList;