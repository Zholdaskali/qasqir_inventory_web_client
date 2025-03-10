import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { FaFileUpload, FaSpinner, FaCheckCircle } from "react-icons/fa";

const DocumentGenerator = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [documentNumber, setDocumentNumber] = useState("");
    const [documentDate, setDocumentDate] = useState("");
    const [supplierId, setSupplierId] = useState(""); // Добавлено поле supplierId
    const [file, setFile] = useState(null);
    const [suppliers, setSuppliers] = useState([]); // Список поставщиков
    const [isLoading, setIsLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    // Загрузка списка поставщиков
    useState(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/suppliers", {
                    headers: { "Auth-token": authToken },
                });
                setSuppliers(response.data.body);
            } catch (error) {
                toast.error("Ошибка загрузки поставщиков");
            }
        };
        fetchSuppliers();
    }, [authToken]);

    const handleDocumentNumberChange = (e) => setDocumentNumber(e.target.value);
    const handleDocumentDateChange = (e) => setDocumentDate(e.target.value);
    const handleSupplierChange = (option) => setSupplierId(option ? option.value : "");
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!documentNumber || !documentDate || !file) {
            toast.error("Заполните все обязательные поля и выберите файл");
            return;
        }

        setIsLoading(true);
        try {
            const documentPayload = {
                documentType: "GENERATED",
                documentNumber,
                documentDate, // Оставляем, если бэкенд его использует
                supplierId: supplierId ? parseInt(supplierId, 10) : null, // Опционально
                createdBy: userId,
            };

            const documentResponse = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/document/add",
                documentPayload,
                { headers: { "Auth-token": authToken } }
            );

            const documentId = documentResponse.data.body.id;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("documentId", documentId);

            await axios.post(
                "http://localhost:8081/api/v1/storekeeper/file/upload",
                formData,
                {
                    headers: {
                        "Auth-token": authToken,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success("Документ создан и файл загружен");
            setRequestSuccess(true);
            setTimeout(() => {
                setRequestSuccess(false);
                setDocumentNumber("");
                setDocumentDate("");
                setSupplierId("");
                setFile(null);
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании документа");
        } finally {
            setIsLoading(false);
        }
    };

    const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name }));

    return (
        <div className="p-4 w-full bg-main-light-gray rounded-lg shadow-md space-y-4">
            {requestSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-2">
                        <FaCheckCircle className="text-green-500 text-3xl" />
                        <h2 className="text-lg font-semibold text-main-dull-gray">Документ создан</h2>
                        <p className="text-sm text-gray-500">Форма очистится через 2 сек.</p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
                        <FaSpinner className="animate-spin text-main-dull-gray" />
                        <span className="text-main-dull-gray">Загрузка...</span>
                    </div>
                </div>
            )}

            <h2 className="text-lg font-semibold text-main-dull-gray text-center">
                Генерация документа
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                    <div className="flex-1">
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Номер документа *
                        </label>
                        <input
                            type="text"
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={documentNumber}
                            onChange={handleDocumentNumberChange}
                            placeholder="DOC-2025-001"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Дата документа *
                        </label>
                        <input
                            type="date"
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={documentDate}
                            onChange={handleDocumentDateChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Поставщик
                        </label>
                        <Select
                            options={supplierOptions}
                            value={supplierOptions.find(option => option.value === parseInt(supplierId, 10))}
                            onChange={handleSupplierChange}
                            placeholder="Выберите поставщика"
                            isClearable
                            isDisabled={isLoading}
                            className="text-sm"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Файл *
                        </label>
                        <input
                            type="file"
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm text-main-dull-gray file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-main-dull-blue file:text-white hover:file:bg-main-purp-dark transition"
                            onChange={handleFileChange}
                            required
                            disabled={isLoading}
                        />
                        {file && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                                {file.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`flex items-center px-3 py-1 bg-main-dull-blue text-white text-sm rounded-md hover:bg-main-purp-dark transition ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-1" />
                                Загрузка
                            </>
                        ) : (
                            <>
                                <FaFileUpload className="mr-1" />
                                Создать
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentGenerator;