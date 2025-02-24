import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import CustomerSaveModal from "../../components/modal-components/customer-modal/CustomerSaveModal";
import CustomerSettingModal from "../../components/modal-components/customer-modal/CustomerSettingModal";
import Notification from "../../components/notification/Notification";


const CustomerList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.supplierList);

  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localSuppliers, setLocalSuppliers] = useState([]); // Локальное состояние для списка поставщиков

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
      toast.success("Поставщики успешно загружены");
    } catch (error) {
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

  return (
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
      {loading ? (
        <div className="text-center text-lg">Загрузка...</div>
      ) : (
        <div className="flex flex-col gap-y-5 overflow-auto">
          <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl">Заказщики</h1>
              <button
                onClick={fetchSupplierList}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Обновить"
              >
                <HiRefresh className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4 min-w-max">
              <thead className="text-gray-500 bg-gray-100 h-12">
                <tr className="text-sm">
                  <th className="text-left px-2">ID</th>
                  <th className="text-left px-2">Имя</th>
                  <th className="text-left px-2">Контактная информация</th>
                  <th className="text-left px-2">Дата создания</th>
                  <th className="text-left px-2">Последнее изменение</th>
                  <th className="text-left px-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {localSuppliers.length > 0 ? (
                  localSuppliers.map((supplier) => (
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
            className="bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white"
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