import React, { useState, useRef } from 'react';
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaCube, FaRulerCombined } from 'react-icons/fa';

const ContainerCard = ({ container, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="p-2 rounded-md bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <FaCube className="text-gray-500" size={14} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 truncate">
                        <span className="text-sm font-medium text-gray-800 truncate">
                            {container.serialNumber}
                        </span>
                        <span className="text-[10px] text-gray-500">
                            #{container.id}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 truncate">
                        <FaRulerCombined size={10} />
                        <span>{container.length}×{container.height}×{container.width}м</span>
                        <span className="mx-1">•</span>
                        <FaCube size={10} />
                        <span>{container.capacity}м³</span>
                    </div>
                </div>
            </div>

            <div className="relative" ref={menuRef}>
                <button
                    className="p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <BiDotsVerticalRounded size={16} className="text-gray-600" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-fade-in">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                onDelete(container.id);
                            }}
                            className="block w-full text-left px-2 py-1 text-[10px] text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Удалить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContainerCard;