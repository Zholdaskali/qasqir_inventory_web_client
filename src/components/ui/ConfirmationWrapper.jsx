/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { toast } from "react-toastify";

const ConfirmationWrapper = ({ title, message, children, onConfirm }) => {
    const [isConfirmationOpen, setConfirmationOpen] = useState(false);

    const handleOpenConfirmation = () => {
        setConfirmationOpen(true);
    };

    const handleCloseConfirmation = () => {
        setConfirmationOpen(false);
    };

    const handleConfirm = async () => {
        try {
            await onConfirm();
            toast.success("Операция выполнена успешно");
        } catch (error) {
            toast.error("Ошибка при выполнении операции");
        }
        setConfirmationOpen(false);
    };

    return (
        <>
            {/* Кнопка/дочерний компонент */}
            {React.cloneElement(children, { onClick: handleOpenConfirmation })}

            {/* Модальное окно */}
            {isConfirmationOpen && (
                <div className="fixed w-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 text-center">
                    <div className="bg-white w-3/12 p-6 rounded-lg shadow-lg flex flex-col items-center">
                            <h2 className="text-lg text-[#E84D43] font-bold mb-1">{title}</h2>
                        <hr className="w-3/4 my-5" />
                        <div className="flex w-2/3 justify-between">
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                onClick={handleCloseConfirmation}
                            >
                                Отмена
                            </button>
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                onClick={handleConfirm}
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConfirmationWrapper;
