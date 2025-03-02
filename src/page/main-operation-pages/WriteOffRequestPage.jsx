import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import successIcon from '../../assets/success.svg';

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
    const [requestSuccess, setRequestSuccess] = useState(false);

    // Загрузка номенклатуры
    useEffect(() => {
        const fetchNomenclatureList = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/v1/warehouse-manager/nomenclatures", {
                    headers: { "Auth-token": authToken },
                });
                setNomenclatureOptions(response.data.body);
            } catch (error) {
                toast.error("Ошибка загрузки номенклатуры");
            }
        };
        fetchNomenclatureList();
    }, [authToken]);

    // Отправка заявки на списание
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                returnType: "write-off",
                relatedDocumentId: parseInt(relatedDocumentId, 10),
                nomenclatureId: parseInt(nomenclatureId, 10),
                quantity: parseFloat(quantity),
                reason,
                createdBy: userId,
            };
            console.log("Отправляемый payload:", JSON.stringify(payload, null, 2));
            const response = await axios.post("http://localhost:8081/api/v1/storekeeper/write-off", payload, {
                headers: { "Auth-token": authToken },
            });
            toast.success(response?.data?.message || "Заявка на списание успешно создана");
            setRequestSuccess(true); // Показываем сообщение об успехе
            setTimeout(() => {
                setRequestSuccess(false); // Скрываем сообщение через 2 секунды
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки на списание");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-main-light-gray rounded-xl shadow-lg space-y-6">
            {/* Сообщение об успешном создании заявки */}
            {requestSuccess && (
                <div className="absolute h-screen w-full top-1/3 left-0 text-black">
                    <div className='flex justify-center items-center w-full'>
                        <div className='bg-white w-2/5 md:w-1/5 px-4 py-8 md:px-2 rounded-xl'>
                            <div className='flex flex-col items-center gap-y-8 md:gap-y-16'>
                                <img src={successIcon} className='w-1/2 md:w-1/3' alt="Успех" />
                                <h2>Заявка на списание успешно создана</h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">Создание заявки на списание</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-main-dull-blue">Номер документа</label>
                    <input
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-main-dull-blue">Дата документа</label>
                    <input
                        type="date"
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={documentDate}
                        onChange={(e) => setDocumentDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-main-dull-blue">Связанный документ ID</label>
                    <input
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={relatedDocumentId}
                        onChange={(e) => setRelatedDocumentId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-main-dull-blue">Номенклатура</label>
                    <select
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={nomenclatureId}
                        onChange={(e) => setNomenclatureId(e.target.value)}
                        required
                    >
                        <option value="">Выберите номенклатуру</option>
                        {nomenclatureOptions.map((nomenclature) => (
                            <option key={nomenclature.id} value={nomenclature.id}>
                                {nomenclature.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-main-dull-blue">Количество</label>
                    <input
                        type="number"
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-main-dull-blue">Причина списания</label>
                    <input
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                    >
                        Создать заявку на списание
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WriteOffRequestPage;