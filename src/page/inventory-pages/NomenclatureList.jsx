import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { saveNomenclatureList } from "../../store/slices/inventorySlice/nomenclatureListSlice";
import { HiRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import NomenclatureSaveModal from "../../components/modal-components/nomenclature-modal/NomenclatureSaveModal";
import NomenclatureSettingModal from "../../components/modal-components/nomenclature-modal/NomenclatureSettingModal";

const NomenclatureList = () => {
  const { categoryId } = useParams();
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const nomenclatures = useSelector((state) => state.nomenclatureList);
  
  const [loading, setLoading] = useState(true);
  const [selectedNomenclature, setSelectedNomenclature] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localNomenclatures, setLocalNomenclatures] = useState([]); // Локальное состояние для списка номенклатур

  const fetchNomenclatureList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8081/api/v1/warehouse-manager/${categoryId}/nomenclatures`,
        {
          headers: { "Auth-token": authToken },
        }
      );
      setLocalNomenclatures(response.data.body); // Записываем в локальный state
      dispatch(saveNomenclatureList(response.data.body)); // Сохраняем в Redux
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

  const handleCreateNomenclatureModal = () => {
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
              <h1 className="text-2xl">Номенклатуры</h1>
              <button
                onClick={fetchNomenclatureList}
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
                  <th className="text-left px-2">Имя</th>
                  <th className="text-left px-2">Артикль</th>
                  <th className="text-left px-2">Код</th>
                  <th className="text-left px-2">Тип</th>
                  <th className="text-left px-2">Единица измерения</th>
                  <th className="text-left px-2">Создатель</th>
                  <th className="text-left px-2">Дата создания</th>
                  <th className="text-left px-2">Последнее изменение</th>
                  <th className="text-left px-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {localNomenclatures.length > 0 ? (
                  localNomenclatures.map((nomenclature) => (
                    <tr
                      key={nomenclature.id}
                      className="bg-white border-b cursor-pointer hover:bg-gray-200"
                    >
                      <td className="py-3 px-2">{nomenclature.id}</td>
                      <td className="py-3 px-2">{nomenclature.name}</td>
                      <td className="py-3 px-2">{nomenclature.article}</td>
                      <td className="py-3 px-2">{nomenclature.code}</td>
                      <td className="py-3 px-2">{nomenclature.type}</td>
                      <td className="py-3 px-2">{nomenclature.measurement}</td>
                      <td className="py-3 px-2">{nomenclature.createdBy}</td>
                      <td className="py-3 px-2">{nomenclature.createdAt}</td>
                      <td className="py-3 px-2">{nomenclature.updatedAt}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNomenclature(nomenclature);
                          }}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FiSettings className="w-5 h-5 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      Данные отсутствуют
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            className="bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white"
            onClick={handleCreateNomenclatureModal}
          >
            +
          </button>
        </div>
      )}

      {selectedNomenclature && (
        <NomenclatureSettingModal
          nomenclature={selectedNomenclature}
          onClose={() => setSelectedNomenclature(null)}
        />
      )}

      {isCreateModalOpen && (
        <NomenclatureSaveModal
          onClose={() => setIsCreateModalOpen(false)}
          categoryId={categoryId}
        />
      )}
    </div>
  );
};

export default NomenclatureList;
