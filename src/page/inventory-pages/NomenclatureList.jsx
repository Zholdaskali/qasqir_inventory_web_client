import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { saveNomenclatureList } from "../../store/slices/inventorySlice/nomenclatureListSlice";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import NomenclatureSettingsModal from "../../components/modal-components/NomenclatureSettingsModal";

const NomenclatureList = () => {
    const { categoryId } = useParams();
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const nomenclatures = useSelector((state) => state.nomenclatureList);
    const [loading, setLoading] = useState(true);
    const [selectedNomenclature, setSelectedNomenclature] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // состояние для окна создания

    const fetchNomenclatureList = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/api/v1/warehouse-manager/${categoryId}/nomenclatures`, {
                headers: { "Auth-token": authToken },
            });
            dispatch(saveNomenclatureList(response.data.body));
            toast.success("Номенклатуры успешно загружены");
        } catch (error) {
            toast.error("Ошибка загрузки номенклатур");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNomenclatureList();
    }, [categoryId]);

    // Функция для открытия модального окна создания
    const handleCreateNomenclatureModal = () => {
        setIsCreateModalOpen(true);
    };

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl w-full">Номенклатуры</h1>
                        <button
                            onClick={fetchNomenclatureList}
                            className="flex items-center justify-center bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                            title="Обновить"
                        >
                            <HiRefresh className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full">
                        <tr className="text-sm">
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Артикль</th>
                            <th>Код</th>
                            <th>Тип</th>
                            <th>Категория</th>
                            <th>Единица измерения</th>
                            <th>Создатель</th>
                            <th>Дата создания</th>
                            <th>Последнее изменение</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="11" className="text-center py-4">Загрузка...</td>
                            </tr>
                        ) : (
                            nomenclatures.length > 0 ? (
                                nomenclatures.map((nomenclature) => (
                                    <tr key={nomenclature.id} className="bg-white border-b">
                                        <td className="py-4 px-2">{nomenclature.id}</td>
                                        <td className="py-4 px-2">{nomenclature.name}</td>
                                        <td className="py-4 px-2">{nomenclature.article}</td>
                                        <td className="py-4 px-2">{nomenclature.code}</td>
                                        <td className="py-4 px-2">{nomenclature.type}</td>
                                        <td className="py-4 px-2">{nomenclature.category}</td>
                                        <td className="py-4 px-2">{nomenclature.measurement}</td>
                                        <td className="py-4 px-2">{nomenclature.createdBy}</td>
                                        <td className="py-4 px-2">{nomenclature.createdAt}</td>
                                        <td className="py-4 px-2">{nomenclature.updatedAt}</td>
                                        <td className="py-4 px-2">
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-200"
                                                title="Настройки"
                                                onClick={() => setSelectedNomenclature(nomenclature)}
                                            >
                                                <FiSettings className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="text-center py-4">Данные отсутствуют</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                {/* Кнопка создания номенклатуры */}
                <button
                    className={`bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    onClick={handleCreateNomenclatureModal}
                    disabled={loading}
                >
                    +
                </button>
            </div>

            {/* Модальное окно редактирования */}
            {selectedNomenclature && (
                <NomenclatureSettingsModal
                    nomenclature={selectedNomenclature}
                    onClose={() => setSelectedNomenclature(null)}
                />
            )}

            {/* Модальное окно создания */}
            {isCreateModalOpen && (
                <NomenclatureSettingsModal
                    nomenclature={null} // Передаём null, чтобы модалка понимала, что это создание
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </div>
    );
};

export default NomenclatureList;
