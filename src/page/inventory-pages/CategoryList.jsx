import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { API_GET_CATEGORIES } from "../../api/API";
import { saveCategoryList } from "../../store/slices/inventorySlice/categoryListSlice";
import CategorySaveModal from "../../components/modal-components/category-modal/CategorySaveModal";
import CategorySettingsModal from "../../components/modal-components/category-modal/CategorySettingsModal";

import filterIcon from "../../assets/icons/filter.svg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FiSettings } from "react-icons/fi";

const CategoryList = () => {
  const authToken = useSelector((state) => state.token.token);
  const categories = useSelector((state) => state.categoryList);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    setSelectedCategory(null); // Очищаем выбор категории
    setIsModalOpen(true);
  };

  const handleSettingsClick = (category) => {
    setSelectedCategory(category); // Выбираем категорию для редактирования
    setIsModalOpen(true);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/nomenclature/${categoryId}`);
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchCategoryList(); // Обновляем список категорий, если нужно
    }
  };

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
            <div className="flex items-center w-full md:w-2/5 gap-x-4 mt-4 md:mt-0">
              <input
                type="search"
                className="w-full px-4 py-2 rounded-lg border shadow-inner"
                placeholder="Поиск"
              />
              <img
                src={filterIcon}
                alt="filter"
                className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
              />
              <IoIosNotificationsOutline size={40} className="hidden sm:block" />
            </div>
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
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className="bg-white border-b cursor-pointer hover:bg-gray-200"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <td className="py-3 px-2">{category.id}</td>
                      <td className="py-3 px-2">{category.name}</td>
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
            className="bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white"
            onClick={handleCreateCategoryModal}
          >
            +
          </button>
        </div>
      )}

      {isModalOpen && (
        selectedCategory ? (
          <CategorySettingsModal
            onClose={handleModalClose} // Передаем функцию для автообновления
            category={selectedCategory}
          />
        ) : (
          <CategorySaveModal
            onClose={handleModalClose} // Передаем функцию для автообновления
          />
        )
      )}
    </div>
  );
};

export default CategoryList;