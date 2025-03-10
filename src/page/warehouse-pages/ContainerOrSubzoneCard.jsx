import React, { useState, useRef } from 'react';
import { BiDotsVerticalRounded } from "react-icons/bi";

const ContainerOrSubzoneCard = ({ item, type, onDelete, onSetting }) => {
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
        <div className="p-2 rounded-lg bg-white shadow-sm flex justify-between items-center text-sm">
            <div>
                <span className="font-medium">{item.serialNumber || `${type.toUpperCase()} NAME`}</span>
                <span className="text-gray-600 ml-2">ID #{item.id}</span>
                <span className="text-gray-500 ml-2">Емкость: {item.capacity || "Не указано"} м³</span>
            </div>
            <div className="relative" ref={menuRef}>
                <button
                    className="hover:bg-gray-100 rounded p-1 z-50"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <BiDotsVerticalRounded size={16} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg z-50">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                onSetting?.(item);
                            }}
                            className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Настройки
                        </button>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                onDelete(item.id);
                            }}
                            className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Удалить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContainerOrSubzoneCard;