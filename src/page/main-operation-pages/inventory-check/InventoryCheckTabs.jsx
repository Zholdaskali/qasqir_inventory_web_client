import React, { useState } from "react";
import InProgressInventoryPage from "./InProgressInventoryPage.jsx";
import InCompleteInventoryPage from "./InCompleteInventoryPage.jsx";
import InventoryCheckPage from "./InventoryCheckPage.jsx";


const tabs = [
    { name: "НОВАЯ ИНВЕНТАРИЗАЦИЯ", page: "inventory_check" },
    { name: "ТЕКУЩИЕ ИНВЕНТАРИЗАЦИИ", page: "in_progress" },
    { name: "ЗАВЕРЩЕННЫЕ ИНВЕНТАРИЗАЦИИ", page: "in_complete" },
];

const InventoryCheckTabs = () => {
    const [activeTab, setActiveTab] = useState(tabs[0].page);
    const [selectedInventoryId, setSelectedInventoryId] = useState(null);
    const [showInventoryCheck, setShowInventoryCheck] = useState(false);

    const handleContinueInventory = (inventoryId) => {
        setSelectedInventoryId(inventoryId);
        setShowInventoryCheck(true);
        setActiveTab(tabs[0].page); // Переключение на первую вкладку при продолжении
    };

    const renderContent = () => {
        switch (activeTab) {
            case "inventory_check":
                return (
                    <div className="space-y-4">
                        <InventoryCheckPage
                            inventoryId={showInventoryCheck ? selectedInventoryId : null}
                        />
                    </div>
                );
            case "in_progress":
                return (
                    <div className="space-y-4">
                        <InProgressInventoryPage onContinueInventory={handleContinueInventory} />
                    </div>
                );
            case "in_complete":
                return <InCompleteInventoryPage />;
            default:
                return <div className="text-gray-600">Выберите вкладку</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 p-4">
            {/* Вкладки */}
            <div className="mb-4 border-b bg-white shadow-sm p-4">
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.page}
                            onClick={() => {
                                setActiveTab(tab.page);
                                if (tab.page === "in_progress") {
                                    setShowInventoryCheck(false);
                                }
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
            <div className="flex-grow p-4 border rounded-xl bg-white shadow-md overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default InventoryCheckTabs;