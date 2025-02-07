import React, { useState } from "react";
import IncomingRequestPage from "./IncomingRequestPage";

const tabs = [
  { name: "Остатки", page: "inventory" },
  { name: "Изделия", page: "products" },
  { name: "Оприходование", page: "reception" },
  { name: "Списание", page: "writeoff" },
  { name: "Перемещения", page: "transfers" },
  { name: "Инвентаризация", page: "inventory_check" },
  { name: "Возвраты поставщику", page: "returns" },
  { name: "Реализация", page: "returns" }
];

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].page);

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return <div>Страница для Остатков</div>;
      case "products":
        return <div>Страница для Изделий</div>;
      case "reception":
        return <IncomingRequestPage />;
      case "writeoff":
        return <div>Страница для Списания</div>;
      case "transfers":
        return <div>Страница для Перемещений</div>;
      case "inventory_check":
        return <div>Страница для Инвентаризации</div>;
      case "returns":
        return <div>Страница для Возвратов поставщику</div>;
      case "returns":
        return <div>Страница для Возвратов поставщику</div>;
      default:
        return <div>Выберите вкладку</div>;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 p-4 border rounded-lg bg-white">
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.page}
              onClick={() => setActiveTab(tab.page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${tab.page === activeTab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
                }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 border rounded-lg bg-white overflow-y-auto max-h-[1000px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default InventoryPage;
