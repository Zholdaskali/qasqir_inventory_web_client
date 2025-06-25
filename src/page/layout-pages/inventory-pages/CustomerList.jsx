import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { FiSettings } from "react-icons/fi";
import * as XLSX from "xlsx";
import CustomerSaveModal from "../../../components/modal-components/customer-modal/CustomerSaveModal";
import CustomerSettingModal from "../../../components/modal-components/customer-modal/CustomerSettingModal";
import Notification from "../../../components/notification/Notification";
import BaseTable from "../../../components/ui/BaseTable";
import AddButton from "../../../components/ui/AddButton";
import TableHeader from "../../../components/ui/Header";

import {
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
} from "../../../store/slices/layout/setting/customerSlice";
import { API_GET_ALL_CUSTOMERS } from "../../../api/API";

const CustomerList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector(
    (state) => state.customerList || { customers: [], loading: false, error: null }
  );

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchCustomerList = useCallback(async () => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }

    if (loading) return;

    setIsRefreshButtonDisabled(true);
    dispatch(fetchCustomersStart());
    try {
      const response = await axios.get(API_GET_ALL_CUSTOMERS, {
        headers: { "Auth-token": authToken },
      });
      dispatch(fetchCustomersSuccess(response.data.body || []));
      toast.success(response.data.message || "Список заказчиков успешно обновлен");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ошибка при загрузке заказчиков";
      dispatch(fetchCustomersFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Error fetching customers:", err);
    } finally {
      setIsRefreshButtonDisabled(false);
      setHasFetched(true);
    }
  }, [authToken, dispatch, loading]);

  useEffect(() => {
    if (authToken && customers.length === 0 && !hasFetched && !loading) {
      fetchCustomerList();
    }
  }, [authToken, customers.length, hasFetched, loading, fetchCustomerList]);

  const filteredCustomers = useMemo(() => {
    return Array.isArray(customers)
      ? customers.filter((customer) =>
          customer.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [customers, searchQuery]);

  const handleCreateCustomerModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedCustomer(null);
    setHasFetched(false);
    fetchCustomerList();
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setHasFetched(false);
    fetchCustomerList();
  };

  const handleManualRefresh = () => {
    setHasFetched(false);
    fetchCustomerList();
  };

  const exportToExcel = () => {
    if (!filteredCustomers.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["ID", "Имя", "Контактная информация", "Дата создания", "Последнее изменение"];
    const rows = filteredCustomers.map((customer) => ({
      ID: customer.id || "-",
      Имя: customer.name || "-",
      "Контактная информация": customer.contactInfo || "-",
      "Дата создания": customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString()
        : "-",
      "Последнее изменение": customer.updatedAt
        ? new Date(customer.updatedAt).toLocaleDateString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    worksheet["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Заказчики");
    XLSX.writeFile(workbook, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Список заказчиков экспортирован в Excel");
  };

  const columns = [
    { title: "ID", field: "id", className: "px-2 text-sm" },
    { title: "Имя", field: "name", className: "px-2 text-sm" },
    {
      title: "Контактная информация",
      field: "contactInfo",
      className: "px-2 text-sm",
      render: (customer) => customer.contactInfo || "-",
    },
    {
      title: "Дата создания",
      field: "createdAt",
      className: "px-2 text-sm",
      render: (customer) =>
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-",
    },
    {
      title: "Последнее изменение",
      field: "updatedAt",
      className: "px-2 text-sm",
      render: (customer) =>
        customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : "-",
    },
    {
      title: "Действия",
      field: "actions",
      className: "px-2 text-sm w-16",
      render: (customer) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(customer);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FiSettings className="w-5 h-5 text-gray-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
      <TableHeader
        title="Заказчики"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={exportToExcel}
        exportDisabled={!filteredCustomers.length || loading}
        searchPlaceholder="Поиск по имени заказчика..."
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
            data={filteredCustomers.map((customer) => ({
              ...customer,
              className: "bg-white hover:bg-gray-50",
            }))}
            maxHeight="500px"
            onRowClick={(customer) => setSelectedCustomer(customer)}
          />
        )}
      </div>

      <AddButton onClick={handleCreateCustomerModal} title="Добавить заказчика" disabled={loading} />

      <Notification />

      {selectedCustomer && (
        <CustomerSettingModal
          customer={selectedCustomer}
          onClose={handleModalClose}
        />
      )}

      {isCreateModalOpen && (
        <CustomerSaveModal
          onClose={handleCreateModalClose}
          fetchSupplierList={fetchCustomerList}
        />
      )}
    </div>
  );
};

export default CustomerList;