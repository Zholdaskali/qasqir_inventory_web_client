import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

import { API_GET_NOMENCLATURES_BY_CATEGORY } from "../../../api/API";
import {
  fetchNomenclaturesStart,
  fetchNomenclaturesSuccess,
  fetchNomenclaturesFailure,
} from "../../../store/slices/inventorySlice/nomenclatureListSlice";

import NomenclatureSaveModal from "../../../components/modal-components/nomenclature-modal/NomenclatureSaveModal";
import NomenclatureSettingModal from "../../../components/modal-components/nomenclature-modal/NomenclatureSettingModal";
import Notification from "../../../components/notification/Notification";

import BaseTable from "../../../components/ui/BaseTable";
import AddButton from "../../../components/ui/AddButton";

const NomenclatureList = () => {
  const { categoryId } = useParams();
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const { nomenclatures, loading, error } = useSelector(
    (state) =>
      state.nomenclatureList || { nomenclatures: [], loading: false, error: null }
  );

  const [selectedNomenclature, setSelectedNomenclature] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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
      dispatch(fetchNomenclaturesSuccess(response.data.body || []));
      toast.success(response.data.message || "Номенклатуры успешно загружены");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ошибка загрузки номенклатур";
      dispatch(fetchNomenclaturesFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Error fetching nomenclatures:", error);
    } finally {
      setIsRefreshButtonDisabled(false);
      setHasFetched(true);
    }
  }, [authToken, categoryId, dispatch]);

  useEffect(() => {
    if (authToken && nomenclatures.length === 0 && !hasFetched && !loading) {
      fetchNomenclatureList();
    }
  }, [authToken, nomenclatures.length, hasFetched, loading, fetchNomenclatureList]);

  const handleManualRefresh = () => {
    setHasFetched(false);
    fetchNomenclatureList();
  };

  const { largeNomenclatures, smallNomenclatures } = useMemo(() => {
    const large = nomenclatures.filter(
      (n) => n.height || n.length || n.width
    );
    const small = nomenclatures.filter(
      (n) => !n.height && !n.length && !n.width
    );
    const filterFn = (n) => n.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return {
      largeNomenclatures: large.filter(filterFn),
      smallNomenclatures: small.filter(filterFn),
    };
  }, [nomenclatures, searchQuery]);

  const handleCreateNomenclatureModal = () => setIsCreateModalOpen(true);

  const handleModalClose = () => {
    setSelectedNomenclature(null);
    setHasFetched(false);
    fetchNomenclatureList();
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setHasFetched(false);
    fetchNomenclatureList();
  };

  const exportToCSV = () => {
    const dataToExport = [...largeNomenclatures, ...smallNomenclatures];
    if (dataToExport.length === 0) {
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
      "Дата синхронизации",
    ];

    const rows = dataToExport.map((n) => [
      n.id || "",
      n.name || "",
      n.article || "",
      n.code || "",
      n.type || "",
      n.measurement || "",
      n.volume || "Не указано",
      n.height || "Не указано",
      n.length || "Не указано",
      n.width || "Не указано",
      n.createdBy || "",
      n.createdAt || "",
      n.updatedAt || "",
      n.syncDate || "Синхронизации не было",
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((item) => `"${item}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nomenclatures_${categoryId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Данные экспортированы в CSV");
  };

  // Объединённые колонки для обеих таблиц с учетом различий
  // Для маленькой номенклатуры просто не выводим колонки с размерами
  const columnsLarge = [
    { title: "ID", field: "id", className: "w-10" },
    { title: "Имя", field: "name" },
    { title: "Артикль", field: "article" },
    {
      title: "Код",
      field: "code",
      isLink: true,
      linkField: "code",
      linkPrefix: "/inventory-item-list/",
    },
    { title: "Тип", field: "type" },
    { title: "Ед.изм", field: "measurement" },
    { title: "Объем (м³)", field: "volume" },
    { title: "Высота (м)", field: "height" },
    { title: "Длина (м)", field: "length" },
    { title: "Ширина (м)", field: "width" },
    { title: "Создатель", field: "createdBy" },
    { title: "Дата создания", field: "createdAt" },
    { title: "Последнее изменение", field: "updatedAt" },
    { title: "Дата синхронизации", field: "syncDate" },
  ];

  const columnsSmall = [
    { title: "ID", field: "id", className: "w-10" },
    { title: "Имя", field: "name" },
    { title: "Артикль", field: "article" },
    {
      title: "Код",
      field: "code",
      isLink: true,
      linkField: "code",
      linkPrefix: "/inventory-item-list/",
    },
    { title: "Тип", field: "type" },
    { title: "Ед.изм", field: "measurement" },
    { title: "Объем (м³)", field: "volume" },
    { title: "Создатель", field: "createdBy" },
    { title: "Дата создания", field: "createdAt" },
    { title: "Последнее изменение", field: "updatedAt" },
    { title: "Дата синхронизации", field: "syncDate" },
  ];

  const onRowClick = (nomenclature) => {
    setSelectedNomenclature(nomenclature);
  };

  return (
    <div>
      <div className="flex items-center mb-4 space-x-4">
        <AddButton onClick={handleCreateNomenclatureModal} />
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshButtonDisabled}
          className="btn btn-secondary"
          title="Обновить список"
        >
          Обновить
        </button>
        <button onClick={exportToCSV} className="btn btn-outline" title="Экспорт CSV">
          Экспорт CSV
        </button>
        <input
          type="search"
          placeholder="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered ml-auto max-w-xs"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">Номенклатуры с размерами</h2>
      <BaseTable
        columns={columnsLarge}
        data={largeNomenclatures}
        maxHeight={400}
        onRowClick={onRowClick}
      />

      <h2 className="text-xl font-semibold my-4">Номенклатуры без размеров</h2>
      <BaseTable
        columns={columnsSmall}
        data={smallNomenclatures}
        maxHeight={300}
        onRowClick={onRowClick}
      />

      {selectedNomenclature && (
        <NomenclatureSettingModal
          id={selectedNomenclature.id}
          onClose={handleModalClose}
        />
      )}

      {isCreateModalOpen && (
        <NomenclatureSaveModal onClose={handleCreateModalClose} />
      )}

      {error && <Notification message={error} />}
      {loading && <Notification message="Загрузка..." />}
    </div>
  );
};

export default NomenclatureList;
