import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const InventoryResultPage = () => {
    const { auditId } = useParams();
    const authToken = useSelector((state) => state.token.token);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventoryResults = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8081/api/v1/storekeeper/inventory-check/result/${auditId}`,
                    {
                        headers: { "Auth-token": authToken },
                    }
                );
                setResults(response.data.body);
                console.log(response.data.message || "Результаты инвентаризации успешно загружены");
            } catch (error) {
                console.error("Ошибка загрузки результатов инвентаризации");
            } finally {
                setLoading(false);
            }
        };
        fetchInventoryResults();
    }, [auditId, authToken]);

    return (
        <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">
                Результаты инвентаризации #{auditId}
            </h2>

            {loading ? (
                <div className="text-center text-lg">Загрузка...</div>
            ) : (
                <div className="space-y-6">
                    {results.length > 0 ? (
                        <table className="w-full border-separate border-spacing-y-4 min-w-max">
                            <thead className="text-gray-500 bg-gray-100 h-12">
                                <tr className="text-sm">
                                    <th className="text-left px-2">ID</th>
                                    <th className="text-left px-2">Номенклатура</th>
                                    <th className="text-left px-2">Зона</th>
                                    <th className="text-left px-2">Ожидаемое кол-во</th>
                                    <th className="text-left px-2">Фактическое кол-во</th>
                                    <th className="text-left px-2">Расхождение</th>
                                    <th className="text-left px-2">Дата создания</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result) => (
                                    <tr
                                        key={result.id}
                                        className="bg-white border-b cursor-pointer hover:bg-gray-200"
                                    >
                                        <td className="py-3 px-2">{result.id}</td>
                                        <td className="py-3 px-2">
                                            {result.nomenclatureName} (ID: {result.nomenclatureId})
                                        </td>
                                        <td className="py-3 px-2">
                                            {result.zoneName} (ID: {result.zoneId})
                                        </td>
                                        <td className="py-3 px-2">{result.expectedQuantity}</td>
                                        <td className="py-3 px-2">{result.actualQuantity}</td>
                                        <td className="py-3 px-2">{result.discrepancy}</td>
                                        <td className="py-3 px-2">{new Date(result.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center text-lg">Нет данных о результатах</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryResultPage;