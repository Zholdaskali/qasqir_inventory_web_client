import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import CustomerSaveModal from "../../../components/modal-components/customer-modal/CustomerSaveModal";
import CustomerSettingModal from "../../../components/modal-components/customer-modal/CustomerSettingModal";
import Notification from "../../../components/notification/Notification";
import { 
  fetchCustomersStart, 
  fetchCustomersSuccess, 
  fetchCustomersFailure 
} from "../../../store/slices/layout/setting/customerSlice";

const CustomerList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customerList || { customers: [], loading: false, error: null });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Флаг для отслеживания выполнения запроса

  const fetchCustomerList = useCallback(async () => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }

    if (loading) return;

    setIsRefreshButtonDisabled(true);
    dispatch(fetchCustomersStart());
    try {
      const response = await axios.get("http://localhost:8081/api/v1/employee/customers", {
        headers: { "Auth-token": authToken },
      });
      dispatch(fetchCustomersSuccess(response.data.body || [])); // Устанавливаем пустой массив по умолчанию
      toast.success(response.data.message || "Список заказчиков успешно обновлен");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ошибка при загрузке заказчиков";
      dispatch(fetchCustomersFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Error fetching customers:", err);
    } finally {
      setIsRefreshButtonDisabled(false);
      setHasFetched(true); // Устанавливаем флаг после завершения запроса
    }
  }, [authToken, dispatch, loading]);

  useEffect(() => {
    // Выполняем запрос только если:
    // 1. Есть токен
    // 2. Данные еще не загружены (customers пустой)
    // 3. Запрос еще не выполнялся (hasFetched === false)
    // 4. Нет активной загрузки
    if (authToken && customers.length === 0 && !hasFetched && !loading) {
      fetchCustomerList();
    }
  }, [authToken, customers.length, hasFetched, loading, fetchCustomerList]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const handleCreateCustomerModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedCustomer(null);
    setHasFetched(false); // Сбрасываем флаг для обновления данных
    fetchCustomerList();
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    setHasFetched(false); // Сбрасываем флаг для обновления данных
    fetchCustomerList();
  };

  const handleManualRefresh = () => {
    setHasFetched(false); // Сбрасываем флаг для повторного запроса
    fetchCustomerList();
  };

  const exportToCSV = () => {
    if (!filteredCustomers.length) {
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

    const rows = filteredCustomers.map((customer) => [
      customer.id,
      customer.name,
      customer.contactInfo || "",
      customer.createdAt,
      customer.updatedAt,
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((item) => `"${item}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Список заказчиков экспортирован в CSV");
  };

  return (
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
      <div className="flex flex-col gap-y-5 overflow-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Заказчики</h1>
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
              placeholder="Поиск заказчика..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
            <button
              onClick={exportToCSV}
              disabled={!filteredCustomers.length}
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
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Имя</th>
                  <th className="text-left px-3 py-2">Контактная информация</th>
                  <th className="text-left px-3 py-2">Дата создания</th>
                  <th className="text-left px-3 py-2">Последнее изменение</th>
                  <th className="text-left px-3 py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="bg-white hover:bg-gray-50 border-t transition cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="py-3 px-2 text-sm">{customer.id}</td>
                      <td className="py-3 px-2 text-sm">{customer.name}</td>
                      <td className="py-3 px-2 text-sm">{customer.contactInfo || "-"}</td>
                      <td className="py-3 px-2 text-sm">{customer.createdAt}</td>
                      <td className="py-3 px-2 text-sm">{customer.updatedAt}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
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
                      {searchQuery ? "Заказчики не найдены" : "Нет доступных заказчиков"}
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
          onClick={handleCreateCustomerModal}
          disabled={loading}
          aria-label="Добавить заказчика"
        >
          +
        </button>
      </div>

      <Notification />

      {selectedCustomer && (
        <CustomerSettingModal
          supplier={selectedCustomer} // Здесь возможно нужно изменить на customer, если это опечатка
          onClose={handleModalClose}
        />
      )}

      {isCreateModalOpen && (
        <CustomerSaveModal
          onClose={handleCreateModalClose}
          fetchSupplierList={fetchCustomerList} // Возможно, стоит переименовать в fetchCustomerList для ясности
        />
      )}
    </div>
  );
};

export default CustomerList;