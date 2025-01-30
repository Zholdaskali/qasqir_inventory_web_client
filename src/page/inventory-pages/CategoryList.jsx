import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { API_GET_CATEGORIES } from "../../api/API";
import { saveCategoryList } from "../../store/slices/inventorySlice/categoryListSlice";

import avatar from "../../assets/placeholders/avatar.png";
import filterIcon from "../../assets/icons/filter.svg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiRefresh } from "react-icons/hi";

const CategoryList = () => {
  const authToken = useSelector((state) => state.token.token); // Токен для авторизации
  const categories = useSelector((state) => state.categoryList); // Список категорий из Redux
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [createInviteModal, setCreateInviteModal] = useState(false); // Управление модалкой для создания

  const fetchCategoryList = async () => {
    try {
      setLoading(true); // Включаем состояние загрузки
      const response = await axios.get(API_GET_CATEGORIES, {
        headers: { "Auth-token": authToken },
      });

      const categoryData = response.data.body; // Достаем массив категорий из ответа
      console.log("Ответ с бэка:", categoryData);

      dispatch(saveCategoryList(response.data.body)); // Сохраняем категории в Redux
      console.log("Ответ с :", categories);

      toast.success("Категории успешно загружены");
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
      toast.error("Ошибка загрузки категорий");
    } finally {
      setLoading(false); // Отключаем состояние загрузки
    }
  };

  useEffect(() => {
    fetchCategoryList(); // Загружаем категории при первом рендере
  }, []);

  const handleCreateCategoryModal = () => {
    setCreateInviteModal(true); // Открываем модалку
  };

  return (
    <div className="w-full h-full px-5 py-5 rounded-xl">
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="flex flex-col gap-y-5 overflow-auto">
          {/* Заголовок */}
          <div className="flex w-full items-center justify-between border-b py-10">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl w-full">Категории</h1>
              <button
                onClick={fetchCategoryList}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                title="Обновить"
              >
                <HiRefresh className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center w-2/5 gap-x-5">
              <input
                type="search"
                className="shadow-inner w-full px-6 py-2 rounded-lg border"
                placeholder="Поиск"
              />
              <img
                src={filterIcon}
                alt="filter"
                className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
              />
              <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
              <IoIosNotificationsOutline size={50} />
            </div>
          </div>
          {/* Таблица */}
          <table className="table-auto w-full border-separate border-spacing-y-4">
            <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full">
              <tr className="text-sm">
                <th></th>
                <th className="text-start">ID</th>
                <th className="text-start">Имя</th>
                <th className="text-start">Создатель</th>
                <th className="text-start">Последнее изменение</th>
                <th className="text-start">Дата создания</th>
                <th className="text-start">Дата изменения</th>
              </tr>
            </thead>
            <tbody>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="p-5">
                      <img
                        className="rounded-full w-10 h-10"
                        src={category.imagePath || avatar}
                        alt="Аватар"
                      />
                    </td>
                    <td className="py-4 px-2">{category.id}</td>
                    <td className="py-4 px-2">{category.name}</td>
                    <td className="py-4 px-2">{category.createdBy}</td>
                    <td className="py-4 px-2">{category.updatedBy}</td>
                    <td className="py-4 px-2">{category.createdAt}</td>
                    <td className="py-4 px-2">{category.updatedAt}</td>
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
          {/* Кнопка */}
          <button
            className={`bg-main-dull-blue absolute bottom-12 w-12 h-12 self-end rounded-full shadow-xl font-bold text-white`}
            onClick={handleCreateCategoryModal}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
