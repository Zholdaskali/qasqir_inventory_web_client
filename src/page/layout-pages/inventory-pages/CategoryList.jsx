import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { API_GET_CATEGORIES } from "../../../api/API";
import { saveCategoryList } from "../../../store/slices/inventorySlice/categoryListSlice";
import CategorySaveModal from "../../../components/modal-components/category-modal/CategorySaveModal";
import CategorySettingsModal from "../../../components/modal-components/category-modal/CategorySettingsModal";

import { FiSettings } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi";

const CategoryList = () => {
  const authToken = useSelector((state) => state.token.token);
  const categories = useSelector((state) => state.categoryList);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategoryList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_GET_CATEGORIES, {
        headers: { "Auth-token": authToken },
      });
      dispatch(saveCategoryList(response.data.body));
      toast.success(response.data.message || "Успешно");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки категорий");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const handleCreateCategoryModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleSettingsClick = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/nomenclature/${categoryId}`);
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchCategoryList();
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[90vh] w-full flex flex-col p-4">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
        <h1 className="text-xl font-semibold">Категории</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Поле поиска */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-2 py-1 rounded-md w-full text-sm"
            />
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
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <td className="px-3 py-2">{category.id}</td>
                  <td className="px-3 py-2 flex items-center gap-2">
                    {category.name}
                    <HiOutlineArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="px-3 py-2">{category.createdBy}</td>
                  <td className="px-3 py-2">{category.updatedBy}</td>
                  <td className="px-3 py-2">{category.createdAt}</td>
                  <td className="px-3 py-2">{category.updatedAt}</td>
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
                  Данные отсутствуют
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Кнопка создания */}
      <button
        className="fixed bottom-6 right-6 w-10 h-10 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center"
        onClick={handleCreateCategoryModal}
      >
        +
      </button>

      {/* Модальные окна */}
      {isModalOpen && (
        selectedCategory ? (
          <CategorySettingsModal
            onClose={handleModalClose}
            category={selectedCategory}
          />
        ) : (
          <CategorySaveModal
            onClose={handleModalClose}
          />
        )
      )}
    </div>
  );
};

export default CategoryList;