import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";

const TransactionList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]); // Локальное состояние для списка транзакций

  const fetchTransactionList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8081/api/v1/storekeeper/transaction",
        {
          headers: { "Auth-token": authToken },
        }
      );
      setTransactions(response.data.body); // Записываем в локальный state
      toast.success("Транзакции успешно загружены");
    } catch (error) {
      toast.error("Ошибка загрузки транзакций");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionList();
  }, []);

  const handleCreateTransactionModal = () => {
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
              <h1 className="text-2xl">Транзакции</h1>
              <button
                onClick={fetchTransactionList}
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
                  <th className="text-left px-2">Тип транзакции</th>
                  <th className="text-left px-2">ID номенклатуры</th>
                  <th className="text-left px-2">Название номенклатуры</th>
                  <th className="text-left px-2">Количество</th>
                  <th className="text-left px-2">Дата</th>
                  <th className="text-left px-2">Создатель</th>
                  <th className="text-left px-2">Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="bg-white border-b cursor-pointer hover:bg-gray-200"
                    >
                      <td className="py-3 px-2">{transaction.id}</td>
                      <td className="py-3 px-2">{transaction.transactionType}</td>
                      <td className="py-3 px-2">{transaction.nomenclatureId}</td>
                      <td className="py-3 px-2">{transaction.nomenclatureName}</td>
                      <td className="py-3 px-2">{transaction.quantity}</td>
                      <td className="py-3 px-2">{transaction.date}</td>
                      <td className="py-3 px-2">{transaction.createdBy}</td>
                      <td className="py-3 px-2">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      Данные отсутствуют
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;