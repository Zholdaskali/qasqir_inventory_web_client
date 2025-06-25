import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSettings } from "react-icons/fi";
import * as XLSX from "xlsx";

import BaseTable from "../../../components/ui/BaseTable";
import SupplierSaveModal from "../../../components/modal-components/supplier-modal/SupplierSaveModal";
import SupplierSettingModal from "../../../components/modal-components/supplier-modal/SupplierSettingModal";
import Notification from "../../../components/notification/Notification";
import AddButton from "../../../components/ui/AddButton";
import TableHeader from "../../../components/ui/Header";

import {
  fetchSuppliersStart,
  fetchSuppliersSuccess,
  fetchSuppliersFailure,
} from "../../../store/slices/layout/setting/supplierSlice";
import { API_GET_ALL_SUPPLIERS } from "../../../api/API";

const SupplierList = () => {
  const dispatch = useDispatch();
  const authToken = useSelector((state) => state.token.token);
  const { suppliers, loading, error } = useSelector(
    (state) => state.supplierList || { suppliers: [], loading: false, error: null }
  );

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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
      setHasFetched(true);
    }
  }, [authToken, dispatch, loading]);

  useEffect(() => {
    if (authToken && suppliers.length === 0 && !hasFetched && !loading) {
      loadSuppliers();
    }
  }, [authToken, suppliers.length, hasFetched, loading, loadSuppliers]);

  const filteredSuppliers = useMemo(() => {
    return Array.isArray(suppliers)
      ? suppliers.filter((supplier) =>
          supplier.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [suppliers, searchQuery]);

  const handleCreateSupplierModal = () => setIsCreateModalOpen(true);

  const handleModalClose = () => {
    setSelectedSupplier(null);
    setHasFetched(false);
    loadSuppliers();
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setHasFetched(false);
    loadSuppliers();
  };

  const handleManualRefresh = () => {
    setHasFetched(false);
    loadSuppliers();
  };

  const exportToExcel = () => {
    if (!filteredSuppliers.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["ID", "Имя", "Контактная информация", "Дата создания", "Последнее изменение"];
    const rows = filteredSuppliers.map((supplier) => ({
      ID: supplier.id || "-",
      Имя: supplier.name || "-",
      "Контактная информация": supplier.contactInfo || "-",
      "Дата создания": supplier.createdAt
        ? new Date(supplier.createdAt).toLocaleDateString()
        : "-",
      "Последнее изменение": supplier.updatedAt
        ? new Date(supplier.updatedAt).toLocaleDateString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    worksheet["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Поставщики");
    XLSX.writeFile(workbook, `suppliers_${new Date().toISOString().slice(0, 10)}).xlsx`);
    toast.success("Список поставщиков экспортирован в Excel");
  };

  const columns = useMemo(() => [
    { title: "ID", field: "id", className: "px-2 text-sm",
      render: (supplier) => supplier.id || "-",
    },
    { title: "Имя", field: "name",
      className: "px-2 text-sm",
      render: (supplier) => supplier.name || "-",
    },
    {
      title: "Контактная информация",
      field: "contactInfo",
      className: "px-2 text-sm",
      render: (supplier) => supplier.contactInfo || "-",
    },
    {
      title: "Дата создания",
      field: "createdAt",
      className: "px-2 text-sm",
      render: (supplier) =>
        supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : "-",
    },
    {
      title: "Последнее изменение",
      field: "updatedAt",
      className: "px-2 text-sm",
      render: (supplier) =>
        supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString() : "-",
    },
    {
      title: "Действия",
      field: "actions",
      className: "px-2 text-sm w-16",
      isSettings: true,
      render: (supplier) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSupplier(supplier);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Настройки поставщика"
        >
          <FiSettings className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ], []);

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
      <TableHeader
        title="Поставщики"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={exportToExcel}
        exportDisabled={!filteredSuppliers.length || loading}
        searchPlaceholder="Поиск по имени поставщика..."
        onAction={handleManualRefresh}
        actionLabel={loading || isRefreshButtonDisabled ? "Загрузка..." : "Обновить"}
        actionDisabled={loading || isRefreshButtonDisabled}
      />

      <div className="flex-1 mt-3">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-lg text-red-500">Ошибка: {error}</div>
        ) : (
          <BaseTable
            columns={columns}
            data={filteredSuppliers.map((supplier) => ({
              ...supplier,
              className: "bg-white hover:bg-gray-50",
            }))}
            maxHeight="500px"
            onRowClick={(supplier) => setSelectedSupplier(supplier)}
          />
        )}
      </div>

      <AddButton onClick={handleCreateSupplierModal} title="Добавить поставщика" disabled={loading} />

      <Notification />

      {selectedSupplier && (
        <SupplierSettingModal supplier={selectedSupplier} onClose={handleModalClose} />
      )}

      {isCreateModalOpen && (
        <SupplierSaveModal onClose={handleCreateModalClose} fetchSupplierList={loadSuppliers} />
      )}
    </div>
  );
};

export default SupplierList;