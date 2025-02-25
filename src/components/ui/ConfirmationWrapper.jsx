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
            {React.cloneElement(children, { onClick: handleOpenConfirmation })}
            {isConfirmationOpen && (
                <div className="fixed w-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 text-center px-4">
                    <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <h2 className="text-lg text-[#E84D43] font-bold mb-3">{title}</h2>
                        {message && <p className="text-sm text-gray-600 mb-5">{message}</p>}
                        <hr className="w-full my-5" />
                        <div className="flex w-full justify-between gap-4">
                            <button
                                className="bg-[#FFF2EA] hover:bg-red-300 text-[#E84D43] px-4 py-2 rounded-lg w-1/2"
                                onClick={handleCloseConfirmation}
                            >
                                Отмена
                            </button>
                            <button
                                className="bg-[#E3F3E9] hover:bg-green-300 text-[#11B066] px-4 py-2 rounded-lg w-1/2"
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
