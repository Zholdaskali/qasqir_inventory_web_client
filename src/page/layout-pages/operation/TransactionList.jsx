import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh, HiDownload } from "react-icons/hi";
import Notification from "../../../components/notification/Notification";

const TransactionList = () => {
  const authToken = useSelector((state) => state.token.token);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchDocumentsWithTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8081/api/v1/storekeeper/document/transaction",
        {
          headers: { "Auth-token": authToken },
          params: { startDate, endDate },
        }
      );
      const sortedDocuments = (Array.isArray(response.data.body) ? response.data.body : [])
        .map(doc => ({
          ...doc,
          transactions: doc.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)) // Сортировка транзакций по убыванию
        }))
        .sort((a, b) => new Date(b.document.documentDate) - new Date(a.document.documentDate)); // Сортировка документов по убыванию
      setDocuments(sortedDocuments);
      toast.success("Документы с транзакциями успешно загружены");
    } catch (error) {
      toast.error("Ошибка загрузки данных");
      console.error("Ошибка загрузки документов с транзакциями:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsWithTransactions();
  }, [startDate, endDate]);

  const handleRefresh = () => {
    fetchDocumentsWithTransactions();
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/v1/storekeeper/document/${documentId}/download`,
        {
          headers: { "Auth-token": authToken },
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error("Сервер не вернул PDF-файл");
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `document_${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Документ успешно скачан");
    } catch (error) {
      toast.error("Ошибка при скачивании документа");
      console.error("Ошибка скачивания PDF:", error.message || error);
    }
  };

  const exportDocumentToCSV = (docWithTransactions) => {
    try {
      const document = docWithTransactions.document; // Извлекаем объект document
      const transactions = docWithTransactions.transactions; // Извлекаем массив transactions

      // Проверка входных данных
      if (!document || !transactions || !Array.isArray(transactions)) {
        throw new Error("Некорректные данные документа или транзакции отсутствуют");
      }

      // Заголовки CSV
      const headers = [
        "Номер документа",
        "Тип документа",
        "Дата документа",
        "Статус",
        "Поставщик",
        "Клиент",
        "ID транзакции",
        "Тип транзакции",
        "Номенклатура",
        "Количество",
        "Дата транзакции",
        "Создатель",
        "Дата создания",
      ];

      // Формирование строк с безопасной обработкой данных
      const rows = transactions.map((transaction) => [
        `"${document.documentNumber || "N/A"}"`,
        `"${document.documentType || "N/A"}"`,
        document.documentDate ? `"${new Date(document.documentDate).toLocaleString()}"` : '"N/A"',
        `"${document.status || "N/A"}"`,
        `"${document.supplier?.name || "N/A"}"`,
        `"${document.customer?.name || "N/A"}"`,
        `"${transaction.id || "N/A"}"`,
        `"${transaction.transactionType || "N/A"}"`,
        `"${transaction.nomenclatureName || "N/A"}"`,
        transaction.quantity != null ? transaction.quantity.toString() : "N/A",
        transaction.date ? `"${new Date(transaction.date).toLocaleString()}"` : '"N/A"',
        `"${transaction.createdBy || "N/A"}"`,
        transaction.createdAt ? `"${new Date(transaction.createdAt).toLocaleString()}"` : '"N/A"',
      ]);

      // Создание CSV-контента
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((row) => row.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a"); // Используем глобальный document
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `document_${document.documentNumber || "unknown"}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Экспорт документа #${document.documentNumber || "unknown"} выполнен успешно`);
    } catch (error) {
      toast.error("Ошибка при экспорте в CSV: " + (error.message || "Неизвестная ошибка"));
      console.error("Ошибка экспорта CSV:", error);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "CANCELED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTransactionTypeStyles = (type) => {
    switch (type) {
      case "INCOMING": return { className: "bg-blue-100 text-blue-600", label: "Поступление" };
      case "TRANSFER": return { className: "bg-purple-100 text-purple-600", label: "Перемещение" };
      case "WRITE-OFF": return { className: "bg-red-100 text-red-600", label: "Списание" };
      case "RETURN": return { className: "bg-orange-100 text-orange-600", label: "Возврат" };
      case "PRODUCTION": return { className: "bg-indigo-100 text-indigo-600", label: "Производство" };
      case "SALES": return { className: "bg-green-100 text-green-600", label: "Продажа" };
      default: return { className: "bg-gray-100 text-gray-600", label: "Неизвестно" };
    }
  };

  return (
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto bg-gray-50">
      {loading ? (
        <div className="text-center text-lg text-gray-600">Загрузка...</div>
      ) : (
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Отчет по транзакциям</h1>
              <button
                onClick={handleRefresh}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Обновить"
              >
                <HiRefresh className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div>
                <label className="text-sm font-medium text-gray-700">С:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ml-2 p-1 border rounded-md shadow-sm focus:ring focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">По:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-2 p-1 border rounded-md shadow-sm focus:ring focus:ring-blue-200"
                />
              </div>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-6">
              {documents.map((docWithTransactions) => {
                const { document, transactions } = docWithTransactions;
                return (
                  <div
                    key={document.id}
                    className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          Документ #{document.documentNumber}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Тип:</span> {document.documentType}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Дата:</span>{" "}
                          {new Date(document.documentDate).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Поставщик:</span> {document.supplier?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Клиент:</span> {document.customer?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Создан:</span>{" "}
                          {new Date(document.createdAt).toLocaleString()} (ID: {document.createdBy})
                        </p>
                      </div>
                      <div className="flex items-center justify-start md:justify-end gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(
                            document.status
                          )}`}
                        >
                          {document.status || "Неизвестно"}
                        </span>
                        <button
                          onClick={() => handleDownloadDocument(document.id)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="Скачать документ (PDF)"
                        >
                          <HiDownload className="w-6 h-6 text-gray-600" />
                        </button>
                        <button
                          onClick={() => exportDocumentToCSV(docWithTransactions)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          Экспорт в CSV
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium text-gray-700 mb-3">Принятые товары</h3>
                    {transactions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transactions.map((transaction) => {
                          const typeStyles = getTransactionTypeStyles(transaction.transactionType);
                          return (
                            <div
                              key={transaction.id}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-md font-semibold text-gray-700">
                                  Транзакция #{transaction.id}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles.className}`}
                                >
                                  {typeStyles.label}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <span className="font-medium">Номенклатура:</span>{" "}
                                  {transaction.nomenclatureName} (ID: {transaction.nomenclatureId})
                                </p>
                                <p>
                                  <span className="font-medium">Количество:</span>{" "}
                                  {transaction.quantity}
                                </p>
                                <p>
                                  <span className="font-medium">Дата транзакции:</span>{" "}
                                  {new Date(transaction.date).toLocaleString()}
                                </p>
                                <p>
                                  <span className="font-medium">Создатель:</span>{" "}
                                  {transaction.createdBy}
                                </p>
                                <p>
                                  <span className="font-medium">Создано:</span>{" "}
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Транзакции отсутствуют</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Документы с транзакциями отсутствуют за выбранный период
            </div>
          )}
        </div>
      )}
      <Notification />
    </div>
  );
};

export default TransactionList;