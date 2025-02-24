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
        <div className="p-3 rounded-lg bg-white shadow-md mb-2 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-medium">{item.serialNumber || `${type.toUpperCase()} NAME`}</h4>
                    <p className="text-sm text-gray-600">{type.toUpperCase()}ID #{item.id}</p>
                    <p className="text-sm text-gray-500">Свободный объем: {item.capacity || "Не указано"}</p>
                </div>
                <div className="relative" ref={menuRef}>
                    <button
                        className="hover:bg-gray-100 rounded"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <BiDotsVerticalRounded />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onSetting(item);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Настройки
                            </button>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onDelete(item.id);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Удалить
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContainerOrSubzoneCard;