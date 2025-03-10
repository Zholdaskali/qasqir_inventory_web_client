import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReturnRequestPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [loading, setLoading] = useState(false);
    const [returnType, setReturnType] = useState("");
    const [relatedDocumentId, setRelatedDocumentId] = useState("");
    const [inventoryId, setInventoryId] = useState("");
    const [nomenclatureId, setNomenclatureId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [reason, setReason] = useState("");
    const [documents, setDocuments] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [nomenclatures, setNomenclatures] = useState([]);

    // Загрузка документов
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/documents", {
                    headers: { "Auth-token": authToken },
                });
                setDocuments(response.data.body || []);
            } catch (error) {
                toast.error("Ошибка загрузки документов");
                setDocuments([]);
            }
        };
        fetchDocuments();
    }, [authToken]);

    // Загрузка инвентаря
    useEffect(() => {
        const fetchInventories = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/inventories", {
                    headers: { "Auth-token": authToken },
                });
                setInventories(response.data.body || []);
            } catch (error) {
                toast.error("Ошибка загрузки инвентаря");
                setInventories([]);
            }
        };
        fetchInventories();
    }, [authToken]);

    // Загрузка номенклатур
    useEffect(() => {
        const fetchNomenclatures = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/nomenclatures", {
                    headers: { "Auth-token": authToken },
                });
                setNomenclatures(response.data.body || []);
            } catch (error) {
                toast.error("Ошибка загрузки номенклатур");
                setNomenclatures([]);
            }
        };
        fetchNomenclatures();
    }, [authToken]);

    // Обработка отправки возврата
    const handleSubmitReturn = async () => {
        if (!returnType || !relatedDocumentId || !inventoryId || !nomenclatureId || quantity <= 0 || !reason) {
            toast.error("Заполните все поля");
            return;
        }
        try {
            setLoading(true);
            const payload = {
                returnType,
                relatedDocumentId: parseInt(relatedDocumentId, 10),
                inventoryId: parseInt(inventoryId, 10),
                nomenclatureId: parseInt(nomenclatureId, 10),
                quantity: parseFloat(quantity),
                reason,
                createdBy: userId,
            };
            const response = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/return",
                payload,
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message || "Возврат успешно завершен");
            setReturnType("");
            setRelatedDocumentId("");
            setInventoryId("");
            setNomenclatureId("");
            setQuantity(0);
            setReason("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при завершении возврата");
            console.error("Ошибка:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <ToastContainer position="top-center" />
            <div className="flex flex-col gap-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Возврат товаров</h1>

                {/* Выбор типа возврата */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Тип возврата
                    </label>
                    <select
                        value={returnType}
                        onChange={(e) => setReturnType(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите тип возврата</option>
                        <option value="DEFECTIVE">Бракованный товар</option>
                        <option value="WRONG_ITEM">Неверный товар</option>
                        <option value="OTHER">Другое</option>
                    </select>
                </div>

                {/* Выбор связанного документа */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Связанный документ
                    </label>
                    <select
                        value={relatedDocumentId}
                        onChange={(e) => setRelatedDocumentId(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите документ</option>
                        {documents.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                                {doc.documentNumber} - {doc.documentDate}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Выбор инвентаря */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Инвентарь
                    </label>
                    <select
                        value={inventoryId}
                        onChange={(e) => setInventoryId(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите инвентарь</option>
                        {inventories.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                                {inv.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Выбор номенклатуры */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Номенклатура
                    </label>
                    <select
                        value={nomenclatureId}
                        onChange={(e) => setNomenclatureId(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите номенклатуру</option>
                        {nomenclatures.map((nom) => (
                            <option key={nom.id} value={nom.id}>
                                {nom.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ввод количества */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Количество
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Ввод причины возврата */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Причина возврата
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                    />
                </div>

                {/* Кнопка отправки */}
                <button
                    onClick={handleSubmitReturn}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors w-48"
                    disabled={loading}
                >
                    Завершить возврат
                </button>
            </div>
        </div>
    );
};

export default ReturnRequestPage;