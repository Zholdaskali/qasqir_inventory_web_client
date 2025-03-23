import React, { useState } from "react";
import IncomingRequestPage from "../../main-operation-pages/incoming/IncomingRequestPage.jsx";
import ReturnRequestPage from "../../main-operation-pages/return/ReturnRequestPage.jsx";
import TransferRequestPage from "../../main-operation-pages/transfer/TransferRequestPage.jsx";
import InventoryCheckTabs from "../../main-operation-pages/inventory-check/InventoryCheckTabs.jsx";
import FileListPage from "../../main-operation-pages/document/FileListPage.jsx";
import WriteOffTabs from "../../main-operation-pages/write-off/WriteOffTabs.jsx";

// Группировка вкладок с подсказками
const tabGroups = [
  {
    group: "plus",
    tooltip: "Операции поступления товаров",
    tabs: [
      { name: "Поступление", page: "reception" },
      { name: "Возврат", page: "returns" },
      { name: "Производство и передача", page: "inventory_check" },
    ],
  },
  {
    group: "minus",
    tooltip: "Операции списания и перемещения",
    tabs: [
      { name: "Списание", page: "writeoff" },
      { name: "Перемещение", page: "transfers" },
      { name: "Продажа", page: "products" },
    ],
  },
  {
    group: "check",
    tooltip: "Операции проверки и инвентаризации",
    tabs: [{ name: "Инвентаризация", page: "implementation" }],
  },
];

const WarehouseOperationTabsPage = () => {
  const [activeTab, setActiveTab] = useState(tabGroups[0].tabs[0].page);
  const [selectedInventoryId, setSelectedInventoryId] = useState(null);
  const [showInventoryCheck, setShowInventoryCheck] = useState(false);

  const handleContinueInventory = (inventoryId) => {
    setSelectedInventoryId(inventoryId);
    setShowInventoryCheck(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <FileListPage />;
      case "reception":
        return <IncomingRequestPage />;
      case "writeoff":
        return (
          <div className="space-y-4 h-full">
            <WriteOffTabs />
          </div>
        );
      case "transfers":
        return <TransferRequestPage />;
      case "inventory_check":
        return (
          <div className="space-y-4 h-full">
            {/* Здесь можно добавить содержимое для "Производство и передача" */}
          </div>
        );
      case "returns":
        return <ReturnRequestPage />;
      case "implementation":
        return <InventoryCheckTabs />;
      default:
        return <div className="h-full text-gray-600">Выберите вкладку</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Вкладки вверху */}
      <div className="flex-shrink-0 p-4 border-b bg-white shadow-sm">
        <div className="flex gap-4 overflow-x-visible whitespace-nowrap">
          {tabGroups.map((group, groupIndex) => (
            <div key={group.group} className="relative group flex gap-2 items-center">
              {/* Подсказка */}
              <span className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                {group.tooltip}
              </span>

              {/* Вкладки */}
              {group.tabs.map((tab) => (
                <button
                  key={tab.page}
                  onClick={() => {
                    setActiveTab(tab.page);
                    setShowInventoryCheck(false);
                  }}
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                    tab.page === activeTab
                      ? "bg-main-dull-blue text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.name}
                </button>
              ))}

              {/* Разделитель между группами */}
              {groupIndex < tabGroups.length - 1 && (
                <div className="h-6 w-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="flex-grow p-4 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default WarehouseOperationTabsPage;