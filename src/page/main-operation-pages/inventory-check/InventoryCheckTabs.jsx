import React, { useState } from 'react';
import InProgressInventoryPage from './InProgressInventoryPage.jsx';
import InCompleteInventoryPage from './InCompleteInventoryPage.jsx';
import InventoryCheckPage from './InventoryCheckPage.jsx';
import SystemInventoryCheckPage from './SystemInventoryCheckPage.jsx';
import SystemInventoryStartPage from './SystemInventoryStartPage.jsx';

const tabs = [
  { name: 'СИСТЕМНАЯ ИНВЕНТАРИЗАЦИЯ', page: 'system_inventory_start' },
  { name: 'ПРОДОЛЖЕНИЕ СИСТЕМНОЙ ИНВЕНТАРИЗАЦИИ', page: 'system_inventory_check' },
];


const InventoryCheckTabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].page);
  const [selectedInventoryId, setSelectedInventoryId] = useState(null);
  const [showInventoryCheck, setShowInventoryCheck] = useState(false);

  const handleSelectInventory = (inventoryId) => {
    setSelectedInventoryId(inventoryId);
    setShowInventoryCheck(true);
    setActiveTab('system_inventory_check');
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'system_inventory_start':
        return <SystemInventoryStartPage onSelectInventory={handleSelectInventory} />;
      case 'system_inventory_check':
        return selectedInventoryId ? (
          <div className="space-y-2 sm:space-y-4">
            <SystemInventoryCheckPage inventoryId={selectedInventoryId} />
          </div>
        ) : (
          <div className="text-gray-600 text-sm sm:text-base">Выберите инвентаризацию для продолжения</div>
        );
      default:
        return <div className="text-gray-600 text-sm sm:text-base">Выберите вкладку</div>;
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-white sm:bg-gray-50 p-2 sm:p-4">
      <div className="mb-2 sm:mb-4 border-b bg-white shadow-sm p-2 sm:p-4">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.page}
              onClick={() => {
                setActiveTab(tab.page);
                if (tab.page === 'in_progress' || tab.page === 'in_complete') {
                  setShowInventoryCheck(false);
                } else if (tab.page === 'inventory_check' && !showInventoryCheck) {
                  setSelectedInventoryId(null);
                } else if (tab.page === 'system_inventory_start') {
                  setShowInventoryCheck(false);
                  setSelectedInventoryId(null);
                }
              }}
              className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[36px] snap-center ${tab.page === activeTab
                  ? 'bg-main-dull-blue text-white shadow-md border-b-2 border-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              role="tab"
              aria-selected={tab.page === activeTab}
              aria-controls={`panel-${tab.page}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        className="flex-grow p-2 sm:p-4 border rounded-xl bg-white shadow-md overflow-auto"
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default InventoryCheckTabs;