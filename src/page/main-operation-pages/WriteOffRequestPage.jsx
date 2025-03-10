import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

const WriteOffRequestPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const [documentNumber, setDocumentNumber] = useState("");
    const [documentDate, setDocumentDate] = useState("");
    const [relatedDocumentId, setRelatedDocumentId] = useState("");
    const [nomenclatureId, setNomenclatureId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");
    const [nomenclatureOptions, setNomenclatureOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    useEffect(() => {
        const fetchNomenclatureList = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/nomenclatures", {
                    headers: { "Auth-token": authToken },
                });
                setNomenclatureOptions(response.data.body.map(n => ({
                    value: n.id,
                    label: n.name,
                })));
            } catch (error) {
                toast.error("Ошибка загрузки номенклатуры");
            }
        };
        fetchNomenclatureList();
    }, [authToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!documentNumber || !documentDate || !relatedDocumentId || !nomenclatureId || !quantity || !reason) {
            toast.error("Заполните все обязательные поля");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                returnType: "write-off",
                relatedDocumentId: parseInt(relatedDocumentId, 10),
                nomenclatureId: parseInt(nomenclatureId, 10),
                quantity: parseFloat(quantity),
                reason,
                createdBy: userId,
            };
            const response = await axios.post("http://localhost:8081/api/v1/storekeeper/write-off", payload, {
                headers: { "Auth-token": authToken },
            });
            toast.success(response?.data?.message || "Заявка на списание успешно создана");
            setRequestSuccess(true);
            setTimeout(() => {
                setRequestSuccess(false);
                setDocumentNumber("");
                setDocumentDate("");
                setRelatedDocumentId("");
                setNomenclatureId("");
                setQuantity(1);
                setReason("");
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 w-full bg-main-light-gray rounded-lg shadow-md space-y-4">
            {requestSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
                        <FaCheckCircle className="text-green-500 text-4xl" />
                        <h2 className="text-lg font-semibold text-main-dull-gray">Заявка успешно создана</h2>
                        <p className="text-sm text-gray-500">Форма будет очищена через 2 секунды</p>
                    </div>
                </div>
            )}

            <h2 className="text-lg font-semibold text-main-dull-gray text-center">
                Создание заявки на списание
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Номер документа *
                        </label>
                        <input
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            placeholder="WR-2025-001"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Дата документа *
                        </label>
                        <input
                            type="date"
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={documentDate}
                            onChange={(e) => setDocumentDate(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Связанный документ ID *
                        </label>
                        <input
                            type="number"
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={relatedDocumentId}
                            onChange={(e) => setRelatedDocumentId(e.target.value)}
                            placeholder="ID документа"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Номенклатура *
                        </label>
                        <Select
                            options={nomenclatureOptions}
                            value={nomenclatureOptions.find(option => option.value === nomenclatureId)}
                            onChange={(option) => setNomenclatureId(option ? option.value : "")}
                            placeholder="Выберите номенклатуру"
                            isClearable
                            isDisabled={isLoading}
                            className="text-sm"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Количество *
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="0.1"
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-main-dull-blue font-medium mb-1">
                            Причина списания *
                        </label>
                        <input
                            className="w-full border border-main-dull-blue rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-main-purp-dark transition"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Укажите причину"
                            required
                            disabled={isLoading}
                        />
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
                                Создание...
                            </>
                        ) : (
                            "Создать заявку"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WriteOffRequestPage;