import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const IncomingRequestPage = () => {
    const authToken = useSelector((state) => state.token.token);
    
    const [documentNumber, setDocumentNumber] = useState("");
    const [documentDate, setDocumentDate] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState([]);
    
    const handleAddItem = () => {
        setItems([...items, { nomenclatureId: "", quantity: 1, warehouseZoneId: "", containerSerial: "", returnable: false }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8081/api/v1/warehouse-manager/incoming", {
                documentType: "INCOMING",
                documentNumber,
                documentDate,
                supplierId,
                items,
            }, {
                headers: { "Auth-token": authToken },
            });
            toast.success("Заявка успешно создана");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании заявки");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-main-light-gray rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">Создание заявки INCOMING</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-main-dull-blue">Номер документа</label>
                    <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-main-dull-blue">Дата документа</label>
                    <input type="date" className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-main-dull-blue">ID Поставщика</label>
                    <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required />
                </div>
                
                <h3 className="text-lg font-semibold text-main-dull-gray">Товары</h3>
                {items.map((item, index) => (
                    <div key={index} className="border border-main-dull-blue p-4 rounded-lg space-y-4">
                        <h4 className="text-md font-medium text-main-dull-blue">Товар #{index + 1}</h4>
                        <div>
                            <label className="block text-main-dull-blue">ID Номенклатуры</label>
                            <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={item.nomenclatureId} onChange={(e) => handleItemChange(index, "nomenclatureId", e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-main-dull-blue">Количество</label>
                            <input type="number" className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-main-dull-blue">ID Зоны склада</label>
                            <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={item.warehouseZoneId} onChange={(e) => handleItemChange(index, "warehouseZoneId", e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-main-dull-blue">Серийный номер контейнера</label>
                            <input className="w-full border border-main-dull-blue rounded-lg px-4 py-2" value={item.containerSerial} onChange={(e) => handleItemChange(index, "containerSerial", e.target.value)} />
                        </div>
                        <div>
                            <label className="inline-flex items-center text-main-dull-blue">
                                <input type="checkbox" checked={item.returnable} onChange={(e) => handleItemChange(index, "returnable", e.target.checked)} className="mr-2" />
                                Возвратный товар
                            </label>
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(index)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                            Удалить
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddItem} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    Добавить товар
                </button>
                
                <div className="flex justify-end space-x-4">
                    <button type="submit" className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition">
                        Создать заявку
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IncomingRequestPage;
        