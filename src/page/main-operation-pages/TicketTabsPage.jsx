import React, { useState } from "react";
import AdminWriteOffApprovalPage from "./AdminWriteOffApprovalPage";
import CreateWriteOffPage from "./CreateWriteOffPage";

const tabs = [
    { name: "СПИСАНИЕ", page: "WRITE-OFF" },
    { name: "ПРОДАЖА", page: "SALES" },
    { name: "ПРОИЗВОДСТВО", page: "PRODUCTION" },
];

const TicketTabsPage = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].page);

    const renderContent = () => {
        switch (activeTab) {
            case "WRITE-OFF":
                return <AdminWriteOffApprovalPage />
                CreateWriteOffPage;
            case "SALES":
                return <div className="h-full">Страница для ПРОДАЖА</div>;
            case "PRODUCTION":
                return <div className="h-full">Страница для ПРОИЗВОДСТВО</div>;
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
                            onClick={() => setActiveTab(tab.page)} // Убрано setShowInventoryCheck
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
            <div className="flex-grow p-4 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default TicketTabsPage;