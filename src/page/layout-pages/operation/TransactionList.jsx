import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { HiRefresh, HiDownload } from "react-icons/hi";
import Notification from "../../../components/notification/Notification";
import { API_GET_DOCUMENTS_WITH_TRANSACTIONS } from "../../../api/API";
import {
  fetchDocumentsStart,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  downloadDocumentStart,
  downloadDocumentSuccess,
  downloadDocumentFailure,
  clearDocuments,
} from "../../../store/slices/layout/operation/transactionListSlice";

const TransactionList = () => {
  const authToken = useSelector((state) => state.token.token);
  const { documents, loading, error, downloadLoading } = useSelector((state) => state.transactionList);
  const dispatch = useDispatch();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(tomorrow.toISOString().split("T")[0]);

  const fetchDocumentsWithTransactions = async () => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }

    try {
      dispatch(fetchDocumentsStart());
      console.log("Запрос с датами:", { startDate, endDate });
      const response = await axios.get(API_GET_DOCUMENTS_WITH_TRANSACTIONS, {
        headers: { "Auth-token": authToken },
        params: { startDate, endDate },
      });
      const sortedDocuments = (Array.isArray(response.data.body) ? response.data.body : [])
        .map((doc) => ({
          ...doc,
          transactions: doc.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        }))
        .sort((a, b) => new Date(b.document.createdAt) - new Date(a.document.createdAt));
      dispatch(fetchDocumentsSuccess(sortedDocuments));
      toast.success("Документы с транзакциями успешно загружены");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ошибка загрузки данных";
      dispatch(fetchDocumentsFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Ошибка загрузки документов с транзакциями:", error);
    }
  };

  useEffect(() => {
    console.log("useEffect вызван с датами:", { startDate, endDate });
    if (Array.isArray(documents) && documents.length === 0) {
      fetchDocumentsWithTransactions();
    }
  }, [authToken, startDate, endDate]);

  const handleRefresh = () => {
    fetchDocumentsWithTransactions();
  };

  const handleDownloadDocument = async (documentId) => {
    if (!authToken) {
      toast.error("Токен авторизации отсутствует");
      return;
    }
    try {
      dispatch(downloadDocumentStart());
      const response = await axios.get(
        `http://localhost:8081/api/v1/warehouse-manager/document/${documentId}/download`,
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
      dispatch(downloadDocumentSuccess());
      toast.success("Документ успешно скачан");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ошибка при скачивании документа";
      dispatch(downloadDocumentFailure(errorMessage));
      toast.error(errorMessage);
      console.error("Ошибка скачивания PDF:", error.message || error);
    }
  };

  const exportDocumentToCSV = (docWithTransactions) => {
    try {
      const doc = docWithTransactions.document;
      const transactions = docWithTransactions.transactions;

      if (!doc || !transactions || !Array.isArray(transactions)) {
        throw new Error("Некорректные данные документа или транзакции отсутствуют");
      }

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

      const rows = transactions.map((transaction) => [
        `"${doc.documentNumber || "N/A"}"`,
        `"${doc.documentType || "N/A"}"`,
        doc.documentDate ? `"${new Date(doc.documentDate).toLocaleString()}"` : '"N/A"',
        `"${doc.status || "N/A"}"`,
        `"${doc.supplier?.name || "N/A"}"`,
        `"${doc.customer?.name || "N/A"}"`,
        `"${transaction.id || "N/A"}"`,
        `"${transaction.transactionType || "N/A"}"`,
        `"${transaction.nomenclatureName || "N/A"}"`,
        transaction.quantity != null ? transaction.quantity.toString() : "N/A",
        transaction.date ? `"${new Date(transaction.date).toLocaleString()}"` : '"N/A"',
        `"${transaction.createdBy || "N/A"}"`,
        transaction.createdAt ? `"${new Date(transaction.createdAt).toLocaleString()}"` : '"N/A"',
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," + [headers, ...rows].map((row) => row.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `document_${doc.documentNumber || "unknown"}_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Экспорт документа #${doc.documentNumber || "unknown"} выполнен успешно`);
    } catch (error) {
      toast.error("Ошибка при экспорте в CSV: " + (error.message || "Неизвестная ошибка"));
      console.error("Ошибка экспорта CSV:", error);
    }
  };

  const exportAllDocumentsToCSV = () => {
    try {
      if (!documents || !Array.isArray(documents) || documents.length === 0) {
        throw new Error("Нет данных для экспорта");
      }

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

      const rows = documents.flatMap((docWithTransactions) => {
        const doc = docWithTransactions.document;
        const transactions = docWithTransactions.transactions || [];

        return transactions.map((transaction) => [
          `"${doc.documentNumber || "N/A"}"`,
          `"${doc.documentType || "N/A"}"`,
          doc.documentDate ? `"${new Date(doc.documentDate).toLocaleString()}"` : '"N/A"',
          `"${doc.status || "N/A"}"`,
          `"${doc.supplier?.name || "N/A"}"`,
          `"${doc.customer?.name || "N/A"}"`,
          `"${transaction.id || "N/A"}"`,
          `"${transaction.transactionType || "N/A"}"`,
          `"${transaction.nomenclatureName || "N/A"}"`,
          transaction.quantity != null ? transaction.quantity.toString() : "N/A",
          transaction.date ? `"${new Date(transaction.date).toLocaleString()}"` : '"N/A"',
          `"${transaction.createdBy || "N/A"}"`,
          transaction.createdAt ? `"${new Date(transaction.createdAt).toLocaleString()}"` : '"N/A"',
        ]);
      });

      if (rows.length === 0) {
        throw new Error("Нет транзакций для экспорта");
      }

      const csvContent =
        "data:text/csv;charset=utf-8," + [headers, ...rows].map((row) => row.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `transaction_list_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Экспорт всего списка выполнен успешно");
    } catch (error) {
      toast.error("Ошибка при экспорте списка: " + (error.message || "Неизвестная ошибка"));
      console.error("Ошибка экспорта всего списка CSV:", error);
    }
  };

  const handleShowDates = () => {
    const datesInfo = `Start Date: ${startDate}, End Date: ${endDate}`;
    console.log(datesInfo);
    toast.info(datesInfo);
    dispatch(clearDocuments());
    fetchDocumentsWithTransactions();
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTransactionTypeStyles = (type) => {
    switch (type) {
      case "1C-SALES":
        return { className: "bg-green-100 text-green-600", label: "1С-Продажа" };
      case "INCOMING":
        return { className: "bg-blue-100 text-blue-600", label: "Поступление" };
      case "TRANSFER":
        return { className: "bg-purple-100 text-purple-600", label: "Перемещение" };
      case "WRITE-OFF":
        return { className: "bg-red-100 text-red-600", label: "Утилизация" };
      case "RETURN":
        return { className: "bg-orange-100 text-orange-600", label: "Возврат" };
      case "PRODUCTION":
        return { className: "bg-indigo-100 text-indigo-600", label: "Производство" };
      case "SALES":
        return { className: "bg-green-100 text-green-600", label: "Продажа" };
      default:
        return { className: "bg-gray-100 text-gray-600", label: "Неизвестно" };
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
                disabled={loading}
              >
                <HiRefresh className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={handleShowDates}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                title="Вывести даты и обновить"
                disabled={loading}
              >
                Вывод
              </button>
              <button
                onClick={exportAllDocumentsToCSV}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                title="Экспорт всего списка в CSV"
                disabled={loading || documents.length === 0}
              >
                Экспорт списка
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">По:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-2 p-1 border rounded-md shadow-sm focus:ring focus:ring-blue-200"
                  disabled={loading}
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
                          {new Date(document.documentDate).toLocaleString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Поставщик:</span>{" "}
                          {document.supplier?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Клиент:</span> {document.customer?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Создан:</span>{" "}
                          {new Date(document.createdAt).toLocaleString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })} (ID: {document.createdBy})
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
                          disabled={downloadLoading}
                        >
                          <HiDownload className="w-6 h-6 text-gray-600" />
                        </button>
                        <button
                          onClick={() => exportDocumentToCSV(docWithTransactions)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          disabled={downloadLoading}
                        >
                          Экспорт в CSV
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium text-gray-700 mb-3">Список транзакций</h3>
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
              {error ? `Ошибка: ${error}` : "Документы с транзакциями отсутствуют за выбранный период"}
            </div>
          )}
        </div>
      )}
      <Notification />
    </div>
  );
};

export default TransactionList;