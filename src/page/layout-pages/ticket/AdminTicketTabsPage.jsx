import React, { useState } from "react";
import AdminTicketApprovalPage from "./AdminTicketApprovalPage";

const tabs = [
  { name: "УТИЛИЗАЦИЯ", page: "WRITE-OFF" },
  { name: "ПРОДАЖА", page: "SALES" },
  { name: "ПРОИЗВОДСТВО", page: "PRODUCTION" },
];

const WriteOffTicketTabsPage = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].page);

  const renderContent = () => {
    switch (activeTab) {
      case "WRITE-OFF":
        return <AdminTicketApprovalPage ticketType="WRITE-OFF" />;
      case "SALES":
        return <AdminTicketApprovalPage ticketType="SALES" />;
      case "PRODUCTION":
        return <AdminTicketApprovalPage ticketType="PRODUCTION" />;
      default:
        return <div className="h-full text-gray-600">Выберите вкладку</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Вкладки */}
      <div className="flex-shrink-0 p-4 border-b bg-white shadow-sm">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.page}
              onClick={() => setActiveTab(tab.page)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                tab.page === activeTab
                  ? "bg-main-dull-blue text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="flex-grow p-4 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default WriteOffTicketTabsPage;