import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { API_GET_NOMENCLATURES_BY_CATEGORY } from "../../../api/API"; // Добавляем импорт
import { saveNomenclatureList } from "../../../store/slices/inventorySlice/nomenclatureListSlice";
import { HiOutlineRefresh } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import NomenclatureSaveModal from "../../../components/modal-components/nomenclature-modal/NomenclatureSaveModal";
import NomenclatureSettingModal from "../../../components/modal-components/nomenclature-modal/NomenclatureSettingModal";

const NomenclatureList = () => {
  const { categoryId } = useParams();
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const nomenclatures = useSelector((state) => state.nomenclatureList);

  const [loading, setLoading] = useState(true);
  const [selectedNomenclature, setSelectedNomenclature] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localNomenclatures, setLocalNomenclatures] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNomenclatureList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        API_GET_NOMENCLATURES_BY_CATEGORY.replace("{categoryId}", categoryId), // Используем импорт с заменой параметра
        {
          headers: { "Auth-token": authToken },
        }
      );
      setLocalNomenclatures(response.data.body);
      dispatch(saveNomenclatureList(response.data.body));
      toast.success("Номенклатуры успешно загружены");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки номенклатур");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!localNomenclatures.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Имя",
      "Артикль",
      "Код",
      "Тип",
      "Единица измерения",
      "Объем (м³)",
      "Высота (м)",
      "Длина (м)",
      "Ширина (м)",
      "Создатель",
      "Дата создания",
      "Последнее изменение",
    ];

    const rows = localNomenclatures.map((nomenclature) => [
      nomenclature.id,
      `"${nomenclature.name}"`,
      `"${nomenclature.article}"`,
      `"${nomenclature.code}"`,
      `"${nomenclature.type}"`,
      `"${nomenclature.measurement}"`,
      nomenclature.volume || "Не указано",
      nomenclature.height || "Не указано",
      nomenclature.length || "Не указано",
      nomenclature.width || "Не указано",
      `"${nomenclature.createdBy}"`,
      `"${nomenclature.createdAt}"`,
      `"${nomenclature.updatedAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nomenclature_list_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Данные экспортированы в CSV");
  };

  useEffect(() => {
    fetchNomenclatureList();
  }, [categoryId]);

  const handleCreateNomenclatureModal = () => {
    setIsCreateModalOpen(true);
  };

  const filteredNomenclatures = localNomenclatures.filter((nomenclature) =>
    nomenclature.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[90vh] w-full flex flex-col p-4">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
        <h1 className="text-xl font-semibold">Номенклатуры</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Кнопки */}
          <div className="flex gap-2 items-end">
            <button
              onClick={exportToCSV}
              className="bg-green-600 px-5 py-2 text-sm text-white rounded-md shadow-md hover:bg-green-700 transition-all duration-200"
            >
              Экспорт в CSV
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск номенклатуры..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-2 py-1 rounded-md w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-auto mt-4 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <table className="w-full table-auto border-separate border-spacing-y-1">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 text-sm">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Имя</th>
              <th className="text-left px-3 py-2">Артикль</th>
              <th className="text-left px-3 py-2">Код</th>
              <th className="text-left px-3 py-2">Тип</th>
              <th className="text-left px-3 py-2">Единица измерения</th>
              <th className="text-left px-3 py-2">Объем (м³)</th>
              <th className="text-left px-3 py-2">Высота (м)</th>
              <th className="text-left px-3 py-2">Длина (м)</th>
              <th className="text-left px-3 py-2">Ширина (м)</th>
              <th className="text-left px-3 py-2">Создатель</th>
              <th className="text-left px-3 py-2">Дата создания</th>
              <th className="text-left px-3 py-2">Последнее изменение</th>
              <th className="text-left px-3 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {filteredNomenclatures.map((nomenclature) => (
              <tr key={nomenclature.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{nomenclature.id}</td>
                <td className="px-3 py-2">{nomenclature.name}</td>
                <td className="px-3 py-2">{nomenclature.article}</td>
                <td className="px-3 py-2">{nomenclature.code}</td>
                <td className="px-3 py-2">{nomenclature.type}</td>
                <td className="px-3 py-2">{nomenclature.measurement}</td>
                <td className="px-3 py-2">
                  {nomenclature.volume || "Не указано"}
                </td>
                <td className="px-3 py-2">
                  {nomenclature.height || "Не указано"}
                </td>
                <td className="px-3 py-2">
                  {nomenclature.length || "Не указано"}
                </td>
                <td className="px-3 py-2">
                  {nomenclature.width || "Не указано"}
                </td>
                <td className="px-3 py-2">{nomenclature.createdBy}</td>
                <td className="px-3 py-2">{nomenclature.createdAt}</td>
                <td className="px-3 py-2">{nomenclature.updatedAt}</td>
                <td className="px-3 py-2">
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Кнопка создания */}
      <button
        className="fixed bottom-6 right-6 w-10 h-10 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center"
        onClick={handleCreateNomenclatureModal}
      >
        +
      </button>

      {/* Модальные окна */}
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