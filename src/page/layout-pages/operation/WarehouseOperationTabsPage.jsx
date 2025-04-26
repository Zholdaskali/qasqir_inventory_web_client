import React, { useState } from 'react';
import IncomingRequestPage from '../../main-operation-pages/incoming/IncomingRequestPage.jsx';
import ReturnRequestPage from '../../main-operation-pages/return/ReturnRequestPage.jsx';
import TransferRequestPage from '../../main-operation-pages/transfer/TransferRequestPage.jsx';
import InventoryCheckTabs from '../../main-operation-pages/inventory-check/InventoryCheckTabs.jsx';
import ProcessTabs from '../../main-operation-pages/write-off/ProcessTabs.jsx';

const tabGroups = [
  {
    group: 'plus',
    tooltip: 'Операции поступления товаров',
    tabs: [
      { name: 'Поступление', page: 'reception' },
      { name: 'Возврат', page: 'returns' },
    ],
  },
  {
    group: 'minus',
    tooltip: 'Операции списания и перемещения',
    tabs: [
      { name: 'Списание', page: 'writeoff' },
      { name: 'Перемещение', page: 'transfers' },
    ],
  },
  {
    group: 'check',
    tooltip: 'Операции проверки и инвентаризации',
    tabs: [{ name: 'Инвентаризация', page: 'implementation' }],
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
      case 'reception':
        return <IncomingRequestPage />;
      case 'writeoff':
        return (
          <div className="space-y-2 sm:space-y-4 h-full">
            <ProcessTabs />
          </div>
        );
      case 'transfers':
        return <TransferRequestPage />;
      case 'returns':
        return <ReturnRequestPage />;
      case 'implementation':
        return <InventoryCheckTabs />;
      default:
        return <div className="h-full text-gray-600 text-sm sm:text-base">Выберите вкладку</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white sm:bg-gray-50">
      {/* Вкладки вверху */}
      <div className="flex-shrink-0 p-2 sm:p-4 border-b bg-white shadow-sm">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          {tabGroups.map((group, groupIndex) => (
            <div key={group.group} className="relative group flex gap-1 sm:gap-2 items-center">
              {/* Подсказка */}
              <span className="absolute top-[-2rem] sm:top-[-2.5rem] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] sm:text-xs rounded py-0.5 sm:py-1 px-1 sm:px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
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
                  className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[36px] snap-center ${
                    tab.page === activeTab
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

              {/* Разделитель между группами */}
              {groupIndex < tabGroups.length - 1 && (
                <div className="h-4 sm:h-6 w-[0.5px] sm:w-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        className="flex-grow p-2 sm:p-4 overflow-auto"
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default WarehouseOperationTabsPage;