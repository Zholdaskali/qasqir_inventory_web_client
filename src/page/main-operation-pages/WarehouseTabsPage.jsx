import React, { useState } from "react";
import IncomingRequestPage from "./IncomingRequestPage";

const tabs = [
  { name: "ИМПОРТИРОВАНИЕ", page: "inventory" },
  { name: "ПРОДАЖА", page: "products" },
  { name: "ПОСТУПЛЕНИЕ", page: "reception" }, 
  { name: "Списание", page: "writeoff" },
  { name: "Перемещения", page: "transfers" },
  { name: "Инвентаризация", page: "inventory_check" },
  { name: "ВОЗВРАТ", page: "returns" },
  { name: "ПРОИЗВОДСТВО И ПЕРЕДАЧА", page: "implementation" }
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
      case "implementation":
        return <div>Страница для Реализации</div>;
      default:
        return <div>Выберите вкладку</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 p-6 border rounded-xl bg-white shadow-md">
        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.page}
              onClick={() => setActiveTab(tab.page)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                tab.page === activeTab
                  ? "bg-main-dull-blue text-white shadow-lg"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6 border rounded-xl bg-white shadow-md overflow-y-auto max-h-[700px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default InventoryPage;