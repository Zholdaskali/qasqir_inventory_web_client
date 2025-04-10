import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi";

import { API_GET_CATEGORIES } from "../../../api/API"; // Убедитесь, что путь правильный
import {
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
} from "../../../store/slices/inventorySlice/categoryListSlice"; // Путь к вашему slice
import CategorySaveModal from "../../../components/modal-components/category-modal/CategorySaveModal";
import CategorySettingsModal from "../../../components/modal-components/category-modal/CategorySettingsModal";

const CategoryList = () => {
  // Получаем token из Redux (предполагается, что он хранится в state.token.token)
  const authToken = useSelector((state) => state.token?.token || "");
  // Получаем состояние категорий
  const { categories, loading, error } = useSelector((state) => {
    console.log("Redux state.categoryList:", state.categoryList); // Отладка
    return state.categoryList || { categories: [], loading: false, error: null };
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Функция для загрузки категорий
  const fetchCategoryList = async () => {
    if (Array.isArray(categories) && categories.length > 0) {
      console.log("Данные категорий уже загружены:", categories);
      return;
    }

    console.log("Загружаем категории...");
    dispatch(fetchCategoriesStart());
    try {
      const response = await axios.get(API_GET_CATEGORIES, {
        headers: { "Auth-token": authToken },
      });
      console.log("API response:", response.data); // Отладка
      const categoryData = response.data.body || response.data.categories || []; // Гибкость для структуры API
      dispatch(fetchCategoriesSuccess(categoryData));
      toast.success(response.data.message || "Категории успешно загружены");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Ошибка загрузки категорий";
      dispatch(fetchCategoriesFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  // Загружаем категории при монтировании или изменении authToken
  useEffect(() => {
    if (!authToken) {
      console.log("Auth token отсутствует, загрузка отменена");
      return;
    }
    fetchCategoryList();
  }, [authToken, dispatch]);

  // Открытие модального окна для создания категории
  const handleCreateCategoryModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Открытие настроек категории
  const handleSettingsClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Переход к номенклатуре по клику на категорию
  const handleCategoryClick = (categoryId) => {
    navigate(`/nomenclature/${categoryId}`);
  };

  // Закрытие модального окна с возможным обновлением данных
  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    if (shouldRefresh) {
      fetchCategoryList();
    }
  };

  // Фильтрация категорий по поисковому запросу
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((category) =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Отладка перед рендерингом
  console.log("Rendering with categories:", categories, "filtered:", filteredCategories);

  // Рендеринг состояния загрузки
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-main-dull-blue"></div>
      </div>
    );
  }

  // Основной рендеринг
  return (
    <div className="h-[90vh] w-full flex flex-col p-4">
      {/* Заголовок и поиск */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
        <h1 className="text-xl font-semibold">Категории</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Поиск категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-2 py-1 rounded-md w-full text-sm"
          />
        </div>
      </div>

      {/* Таблица категорий */}
      <div className="flex-1 overflow-auto mt-4 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <table className="w-full table-auto border-separate border-spacing-y-1">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 text-sm">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Имя</th>
              <th className="text-left px-3 py-2">Создатель</th>
              <th className="text-left px-3 py-2">Последнее изменение</th>
              <th className="text-left px-3 py-2">Дата создания</th>
              <th className="text-left px-3 py-2">Дата изменения</th>
              <th className="text-left px-3 py-2">Настройки</th>
            </tr>
            <tr>
              <th colSpan="7" className="text-left px-3 py-2 text-sm text-gray-400">
                Нажмите на строку, чтобы перейти к списку номенклатуры
              </th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 cursor-pointer group"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <td className="px-3 py-2">{category.id}</td>
                  <td className="px-3 py-2 flex items-center gap-2">
                    {category.name || "Без названия"}
                    <HiOutlineArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-3 py-2">{category.createdBy || "Неизвестно"}</td>
                  <td className="px-3 py-2">{category.updatedBy || "Неизвестно"}</td>
                  <td className="px-3 py-2">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSettingsClick(category);
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
                <td colSpan="7" className="text-center py-4">
                  {error ? `Ошибка: ${error}` : "Данные отсутствуют"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Кнопка создания категории */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center"
        onClick={handleCreateCategoryModal}
      >
        +
      </button>

      {/* Модальные окна */}
      {isModalOpen && (
        selectedCategory ? (
          <CategorySettingsModal onClose={handleModalClose} category={selectedCategory} />
        ) : (
          <CategorySaveModal onClose={handleModalClose} />
        )
      )}
    </div>
  );
};

export default CategoryList;