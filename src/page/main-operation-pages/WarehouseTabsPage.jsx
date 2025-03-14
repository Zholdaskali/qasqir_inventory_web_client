import React, { useState } from "react";
import IncomingRequestPage from "./IncomingRequestPage";
import ReturnRequestPage from "./ReturnRequestPage";
import WriteOffTicketsPage from "./WriteOffTicketsPage"; // Предполагаю, что это нужный компонент
import TransferRequestPage from "./TransferRequestPage.jsx";
import InventoryCheckPage from "./InventoryCheckPage.jsx";
import InProgressInventoryPage from "./InProgressInventoryPage.jsx";
import DocumentGenerator from "./DocumentGenerator.jsx";
import InventoryCheckTabs from "./InventoryCheckTabs.jsx";
import FileListPage from "./FileListPage.jsx";
import WriteOffTabs from "./WriteOffTabs.jsx"

const tabs = [
    { name: "Списание", page: "writeoff" },
    { name: "Поступление", page: "reception" },
    { name: "Перемещение", page: "transfers" },
    { name: "Инвентаризация", page: "implementation" },
    { name: "Продажа", page: "products" },
    { name: "Возврат", page: "returns" },
    { name: "Производство и передача", page: "inventory_check" },
];

const InventoryPage = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].page);
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
                        <WriteOffTabs /> {/* Заменяем WriteOffTabs на WriteOffTicketsPage */}
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
            {/* Вкладки */}
            <div className="flex-shrink-0 p-4 border-b bg-white shadow-sm">
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                    {tabs.map((tab) => (
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
                </div>
            </div>

            {/* Контент */}
            <div className="flex-grow p-4 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default InventoryPage;