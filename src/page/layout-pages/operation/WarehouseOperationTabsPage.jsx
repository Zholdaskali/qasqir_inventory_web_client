import React, { useState } from "react";
import IncomingRequestPage from "../../main-operation-pages/incoming/IncomingRequestPage.jsx";
import ReturnRequestPage from "../../main-operation-pages/return/ReturnRequestPage.jsx";
import TransferRequestPage from "../../main-operation-pages/transfer/TransferRequestPage.jsx";
import InventoryCheckPage from "../../main-operation-pages/inventory-check/InventoryCheckPage.jsx";
import InProgressInventoryPage from "../../main-operation-pages/inventory-check/InProgressInventoryPage.jsx";
import InventoryCheckTabs from "../../main-operation-pages/inventory-check/InventoryCheckTabs.jsx";
import FileListPage from "../../main-operation-pages/document/FileListPage.jsx";
import WriteOffTabs from "../../main-operation-pages/write-off/WriteOffTabs.jsx";

// Группировка вкладок
const tabGroups = [
  {
    group: "plus",
    tabs: [
      { name: "Поступление", page: "reception" },
      { name: "Возврат", page: "returns" },
      { name: "Производство и передача", page: "inventory_check" },
    ],
  },
  {
    group: "minus",
    tabs: [
      { name: "Списание", page: "writeoff" },
      { name: "Перемещение", page: "transfers" },
      { name: "Продажа", page: "products" },
    ],
  },
  {
    group: "check",
    tabs: [{ name: "Инвентаризация", page: "implementation" }],
  },
];

const InventoryPage = () => {
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
            {showInventoryCheck ? (
              <InventoryCheckPage inventoryId={selectedInventoryId} />
            ) : (
              <>
                <InventoryCheckPage />
                <InProgressInventoryPage onContinueInventory={handleContinueInventory} />
              </>
            )}
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
        <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
          {tabGroups.map((group, groupIndex) => (
            <div key={group.group} className="flex gap-2 items-center">
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
              {/* Добавляем разделитель между группами, кроме последней */}
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

export default InventoryPage;