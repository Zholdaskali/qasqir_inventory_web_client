import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { API_GET_CATEGORIES } from "../../api/API";
import { saveCategoryList } from "../../store/slices/inventorySlice/categoryListSlice";
import CategorySaveModal from "../../components/modal-components/category-modal/CategorySaveModal";
import CategorySettingsModal from "../../components/modal-components/category-modal/CategorySettingsModal";

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
      toast.success("Категории успешно загружены");
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
      toast.error("Ошибка загрузки категорий");
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
    <div className="w-full h-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 rounded-xl overflow-auto">
      {loading ? (
        <div className="text-center text-lg">Загрузка...</div>
      ) : (
        <div className="flex flex-col gap-y-5 overflow-auto">
          <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl">Категории</h1>
            </div>

            {/* Поле ввода для поиска */}
            <input
              type="text"
              placeholder="Поиск категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4 min-w-max">
              <thead className="text-gray-500 bg-gray-100 h-12">
                <tr className="text-sm">
                  <th className="text-left px-2">ID</th>
                  <th className="text-left px-2">Имя</th>
                  <th className="text-left px-2">Создатель</th>
                  <th className="text-left px-2">Последнее изменение</th>
                  <th className="text-left px-2">Дата создания</th>
                  <th className="text-left px-2">Дата изменения</th>
                  <th className="text-left px-2">Настройки</th>
                </tr>
                <tr>
                  <th colSpan="7" className="text-left px-2 text-sm text-gray-400">
                    Нажмите на строку, чтобы перейти к списку номенклатуры
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="bg-white border-b cursor-pointer hover:bg-gray-50 group"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <td className="py-3 px-2">{category.id}</td>
                      <td className="py-3 px-2 flex items-center gap-2">
                        {category.name}
                        <HiOutlineArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                      <td className="py-3 px-2">{category.createdBy}</td>
                      <td className="py-3 px-2">{category.updatedBy}</td>
                      <td className="py-3 px-2">{category.createdAt}</td>
                      <td className="py-3 px-2">{category.updatedAt}</td>
                      <td className="py-3 px-2">
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

          <button
            className="bg-blue-500 fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white hover:bg-blue-600 transition-colors"
            onClick={handleCreateCategoryModal}
          >
            +
          </button>
        </div>
      )}

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