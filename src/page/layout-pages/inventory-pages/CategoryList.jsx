import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import * as XLSX from "xlsx";

import { API_GET_CATEGORIES } from "../../../api/API";
import {
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
} from "../../../store/slices/inventorySlice/categoryListSlice";
import CategorySaveModal from "../../../components/modal-components/category-modal/CategorySaveModal";
import CategorySettingsModal from "../../../components/modal-components/category-modal/CategorySettingsModal";
import BaseTable from "../../../components/ui/BaseTable";
import AddButton from "../../../components/ui/AddButton";
import TableHeader from "../../../components/ui/Header";

const CategoryList = () => {
  const authToken = useSelector((state) => state.token?.token || "");
  const { categories, loading, error } = useSelector(
    (state) =>
      state.categoryList || { categories: [], loading: false, error: null }
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategoryList = useCallback(async () => {
    dispatch(fetchCategoriesStart());
    try {
      const response = await axios.get(API_GET_CATEGORIES, {
        headers: { "Auth-token": authToken },
      });
      const categoryData =
        response.data.body || response.data.categories || [];
      dispatch(fetchCategoriesSuccess(categoryData));
      toast.success(response.data.message || "Категории успешно загружены");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Ошибка загрузки категорий";
      dispatch(fetchCategoriesFailure(errorMessage));
      toast.error(errorMessage);
    }
  }, [authToken, dispatch]);

  useEffect(() => {
    if (!authToken) return;
    fetchCategoryList();
  }, [authToken, fetchCategoryList]);

  const handleCategoryCreated = useCallback(() => {
    fetchCategoryList();
    setIsModalOpen(false);
    toast.success("Категория успешно создана");
  }, [fetchCategoryList]);

  const handleCategoryUpdated = useCallback(() => {
    fetchCategoryList();
    setIsModalOpen(false);
    setSelectedCategory(null);
    toast.success("Категория успешно обновлена");
  }, [fetchCategoryList]);

  const handleCategoryDeleted = useCallback(() => {
    fetchCategoryList();
    setIsModalOpen(false);
    setSelectedCategory(null);
    toast.success("Категория успешно удалена");
  }, [fetchCategoryList]);

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

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const filteredCategories = useMemo(() => {
    return Array.isArray(categories)
      ? categories.filter((category) =>
          category.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [categories, searchQuery]);

  const exportToExcel = () => {
    if (!filteredCategories.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Имя",
      "Создатель",
      "Последнее изменение",
      "Дата создания",
      "Дата изменения",
    ];
    const rows = filteredCategories.map((category) => ({
      ID: category.id || "-",
      Имя: category.name || "Без названия",
      Создатель: category.createdBy || "Неизвестно",
      "Последнее изменение": category.updatedBy || "Неизвестно",
      "Дата создания": category.createdAt
        ? new Date(category.createdAt).toLocaleDateString()
        : "-",
      "Дата изменения": category.updatedAt
        ? new Date(category.updatedAt).toLocaleDateString()
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Категории");
    XLSX.writeFile(
      workbook,
      `categories_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    toast.success("Список категорий экспортирован в Excel");
  };

  const columns = [
    { title: "ID", field: "id", className: "px-2" },
    { title: "Имя", field: "name", className: "px-2", isLink: true },
    { title: "Создатель", field: "createdBy", className: "px-2" },
    { title: "Последнее изменение", field: "updatedBy", className: "px-2" },
    {
      title: "Дата создания",
      field: "createdAt",
      className: "px-2",
      render: (category) =>
        category.createdAt
          ? new Date(category.createdAt).toLocaleDateString()
          : "-",
    },
    {
      title: "Дата изменения",
      field: "updatedAt",
      className: "px-2",
      render: (category) =>
        category.updatedAt
          ? new Date(category.updatedAt).toLocaleDateString()
          : "-",
    },
    {
      title: "Настройки",
      field: "settings",
      className: "px-2 w-16",
      isSettings: true,
      render: () => <FiSettings className="text-gray-500" />,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
      <TableHeader
        title="Категории"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={exportToExcel}
        exportDisabled={!filteredCategories.length || loading}
        searchPlaceholder="Поиск по имени категории..."
      />

      <div className="flex-1 mt-3">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <BaseTable
            columns={columns}
            data={filteredCategories.map((category) => ({
              ...category,
              className: "bg-white hover:bg-gray-50",
            }))}
            maxHeight="500px"
            onRowClick={(category) => handleCategoryClick(category.id)}
            onSettingsClick={handleSettingsClick}
          />
        )}
      </div>

      <AddButton onClick={handleCreateCategoryModal} title="Добавить категорию" />

      {isModalOpen &&
        (selectedCategory ? (
          <CategorySettingsModal
            onClose={handleModalClose}
            category={selectedCategory}
            onUpdate={handleCategoryUpdated}
            onDelete={handleCategoryDeleted}
          />
        ) : (
          <CategorySaveModal
            onClose={handleModalClose}
            onSave={handleCategoryCreated}
          />
        ))}
    </div>
  );
};

export default CategoryList;