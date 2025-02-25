import React, { useState } from "react";
import IncomingRequestPage from "./IncomingRequestPage";
import ReturnRequestPage from "./ReturnRequestPage";
import WriteOffRequestPage from "./WriteOffRequestPage";
import TransferRequestPage from "./TransferRequestPage.jsx";
import InventoryCheckPage from "./InventoryCheckPage.jsx";
import InventoryCheckList from "../inventory-pages/InventoryCheckList.jsx";
import InProgressInventoryPage from "./InProgressInventoryPage.jsx";
import DocumentGenerator from "./DocumentGenerator.jsx";
import { div } from "framer-motion/client";

const tabs = [
    { name: "ПОСТУПЛЕНИЕ", page: "reception" },
    { name: "СПИСАНИЕ", page: "writeoff" },
    { name: "ИНВЕНТАРИЗАЦИЯ", page: "inventory_check" },
    { name: "ИМПОРТИРОВАНИЕ", page: "inventory" },
    { name: "ПРОДАЖА", page: "products" },
    { name: "ПЕРЕМЕЩЕНИЕ", page: "transfers" },
    { name: "ВОЗВРАТ", page: "returns" },
    { name: "ПРОИЗВОДСТВО И ПЕРЕДАЧА", page: "implementation" }
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
            case "inventory":
                return <div>Страница для Остатков</div>;
            case "products":
                return <div>Страница для Изделий</div>;
            case "reception":
                return (
                    <div className="">
                        <IncomingRequestPage />
                    </div>
                );
            case "writeoff":
                return (

                    <div className="space-y-12">
                        <DocumentGenerator />
                        <WriteOffRequestPage />;
                    </div>
                );

            case "transfers":
                return <TransferRequestPage />;
            case "inventory_check":
                return (
                    <div className="space-y-12">
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
                            onClick={() => {
                                setActiveTab(tab.page);
                                setShowInventoryCheck(false); // Сбрасываем флаг при переключении вкладок
                            }}
                            
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${tab.page === activeTab
                                ? "bg-main-dull-blue text-white shadow-lg"
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="px-6 pb-10 border rounded-xl bg-white shadow-md overflow-auto h-5/6">
                {renderContent()}
            </div>
        </div>
    );
};

export default InventoryPage;