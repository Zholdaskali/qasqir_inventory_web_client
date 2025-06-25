import {
  FaUsers, FaWarehouse, FaTable,
  ImBook, ImTab,
  IoBarChartSharp, IoSettings,
  HiTicket,
} from "react-icons/all";

export const NAV_CONFIG = {
  warehouse_manager: [
    {
      label: "Аналитика",
      icon: IoBarChartSharp,
      to: "/dashboard",
    },
    {
      label: "Входящие заявки",
      icon: HiTicket,
      to: "/ticket-tabs",
    },
    {
      label: "Отчетность",
      icon: FaTable,
      subItems: [
        { label: "Транзакции", to: "/transaction-list" },
        { label: "История товаров", to: "/transaction-history" },
        { label: "Товары", to: "/inventory-item-list" },
        { label: "1C-синхронизация", to: "/1c-sync" },
      ],
    },
  ],
  admin: [
    {
      label: "Аудит",
      icon: ImBook,
      to: "/log-tabs",
    },
    {
      label: "Пользователи",
      icon: FaUsers,
      to: "/user-tabs",
    },
  ],
  employee: [
    {
      label: "Склады",
      icon: FaWarehouse,
      to: "/warehouse-list",
    },
  ],
  storekeeper: [
    {
      label: "Операции",
      icon: ImTab,
      to: "/warehouse-tabs",
    },
    {
      label: "Настройки",
      icon: IoSettings,
      subItems: [
        { label: "Складской каталог", to: "/category-list" },
        { label: "Поставщики", to: "/supplier-list" },
        { label: "Заказчики", to: "/customer-list" },
      ],
    },
  ],
};
