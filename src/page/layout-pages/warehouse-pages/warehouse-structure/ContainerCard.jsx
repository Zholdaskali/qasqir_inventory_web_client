import React, { useState, useRef } from 'react';
import { BiDotsVerticalRounded } from "react-icons/bi";

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
        <div className="p-4 rounded-lg bg-white shadow-md flex justify-between items-center transition-all hover:shadow-lg">
            <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-gray-800">
                    {container.serialNumber}
                </span>
                <div className="flex gap-4 text-sm text-gray-600">
                    <span>ID #{container.id}</span>
                    <span>Объем: {container.capacity} м³</span>
                    <span>
                        {container.length} × {container.height} × {container.width} м
                    </span>
                </div>
            </div>
            <div className="relative" ref={menuRef}>
                <button
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <BiDotsVerticalRounded size={20} className="text-gray-600" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                onDelete(container.id);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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