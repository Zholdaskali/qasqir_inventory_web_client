import React, { useState, useRef } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import { FaCube, FaRulerCombined } from 'react-icons/fa';
import WarehouseContainerSettingModal from '../../../../components/modal-components/warehouse-modal/WarehouseContainerSettingModal';

const ContainerCard = ({ container, onDelete, onUpdate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleModalClose = (shouldUpdate) => {
    setIsModalOpen(false);
    if (shouldUpdate && onUpdate) {
      onUpdate(container.id);
    }
  };

  return (
    <>
      <div className="p-1 sm:p-2 rounded-md bg-white shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <FaCube className="text-gray-500 flex-shrink-0 w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 truncate">
              <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                {container.serialNumber}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-500">#{container.id}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-600 truncate">
              <FaRulerCombined className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" />
              <span>
                {container.length}×{container.height}×{container.width}м
              </span>
              <span className="mx-0.5 sm:mx-1">•</span>
              <FaCube className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" />
              <span>{container.capacity}м³</span>
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0 self-end sm:self-center" ref={menuRef}>
          <button
            className="p-0.5 sm:p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <BiDotsVerticalRounded className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-20 sm:w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-fade-in">
              <button
                onClick={handleSettingsClick}
                className="block w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Настройки
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <WarehouseContainerSettingModal
          setIsContainerSettingModalOpen={setIsModalOpen}
          container={container}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default ContainerCard;