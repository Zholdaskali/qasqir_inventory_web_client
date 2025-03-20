import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import CustomerSaveModal from "../../../components/modal-components/customer-modal/CustomerSaveModal"
import CustomerSettingModal from "../../../components/modal-components/customer-modal/CustomerSettingModal";
import Notification from "../../../components/notification/Notification";

const CustomerList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.supplierList);

  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localSuppliers, setLocalSuppliers] = useState([]); // Локальное состояние для списка поставщиков
  const [searchQuery, setSearchQuery] = useState(""); // Состояние для поискового запроса

  const fetchSupplierList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8081/api/v1/warehouse-manager/customers",
        {
          headers: { "Auth-token": authToken },
        }
      );
      setLocalSuppliers(response.data.body); // Записываем в локальный state
      dispatch(saveSupplierList(response.data.body)); // Сохраняем в Redux
      toast.success(response.data.message || "Успешно");
    } catch (error) {
      console.error("Ошибка при загрузке поставщиков:", error);
      error.response?.data?.message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierList();
  }, []);

  const handleCreateSupplierModal = () => {
    setIsCreateModalOpen(true);
  };

  // Функция для фильтрации заказчиков на основе поискового запроса
  const filteredSuppliers = localSuppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
      {loading ? (
        <div className="text-center text-lg">Загрузка...</div>
      ) : (
        <div className="flex flex-col gap-y-5 overflow-auto">
          <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl">Заказчики</h1>
              <button
                onClick={fetchSupplierList}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Обновить"
              >
                <HiRefresh className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Поле ввода для поиска */}
            <input
              type="text"
              placeholder="Поиск заказчика..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-auto mt-4 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <table className="w-full table-auto border-separate border-spacing-y-1">
              <thead className="bg-gray-100 text-gray-600 sticky top-0 text-sm">
                <tr className="text-sm">
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Имя</th>
                  <th className="text-left px-3 py-2">Контактная информация</th>
                  <th className="text-left px-3 py-2">Дата создания</th>
                  <th className="text-left px-3 py-2">Последнее изменение</th>
                  <th className="text-left px-3 py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="bg-white border-b cursor-pointer hover:bg-gray-200"
                    >
                      <td className="py-3 px-2">{supplier.id}</td>
                      <td className="py-3 px-2">{supplier.name}</td>
                      <td className="py-3 px-2">{supplier.contactInfo}</td>
                      <td className="py-3 px-2">{supplier.createdAt}</td>
                      <td className="py-3 px-2">{supplier.updatedAt}</td>
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
                    <td colSpan="6" className="text-center py-4">
                      Данные отсутствуют
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            className="fixed bottom-6 right-6 w-10 h-10 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center"
            onClick={handleCreateSupplierModal}
          >
            +
          </button>
        </div>
      )}

      <Notification />

      {selectedSupplier && (
        <CustomerSettingModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {isCreateModalOpen && (
        <CustomerSaveModal
          onClose={() => setIsCreateModalOpen(false)}
          fetchSupplierList={fetchSupplierList}
        />
      )}
    </div>
  );
};

export default CustomerList;