import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Notification from "../notification/Notification";
import ReactDOM from "react-dom";

const Modal = ({ children, onClose }) => {
    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                {children}
            </div>
        </div>,
        document.body
    );
};

const WarehouseZoneCreateModal = ({ setIsWarehouseSaveModalOpen, warehouseId, parentId, setIsZoneCreated }) => {
    const [warehouseZoneName, setWarehouseZoneName] = useState("");
    const [height, setHeight] = useState(0);
    const [length, setLength] = useState(0);
    const [width, setWidth] = useState(0);
    const [isFormError, setIsFormError] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    const saveWarehouseZone = async (e) => {
        e.preventDefault();

        if (!warehouseZoneName.trim()) {
            setIsFormError(true);
            toast.error("Заполните все обязательные поля");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8081/api/v1/warehouse-manager/warehouses/${warehouseId}/zones?userId=${userId}`,
                { 
                    name: warehouseZoneName, 
                    parentId: parentId,
                    height: height,
                    length: length,
                    width: width
                },
                { 
                    headers: { "Auth-token": authToken } 
                }
            );

            setIsZoneCreated(true);
            setIsWarehouseSaveModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    return (
        <Modal onClose={() => setIsWarehouseSaveModalOpen(false)}>
            <h2 className="text-2xl font-semibold text-main-dull-gray mb-6 text-center">Добавить зону склада</h2>
            <form onSubmit={saveWarehouseZone} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-left mb-2 text-main-dull-blue">Название зоны</label>
                    <input
                        id="name"
                        type="text"
                        className={`w-full border rounded-lg px-4 py-2 ${isFormError && !warehouseZoneName.trim() ? 'border-red-500' : 'border-main-dull-blue'}`}
                        value={warehouseZoneName}
                        onChange={(e) => {
                            setWarehouseZoneName(e.target.value);
                            setIsFormError(false);
                        }}
                        placeholder="Введите название Подзоны"
                    />
                    {isFormError && !warehouseZoneName.trim() && <p className="text-red-500 text-sm">Это поле обязательно</p>}
                </div>

                <div>
                    <label htmlFor="height" className="block text-left mb-2 text-main-dull-blue">Высота (м)</label>
                    <input
                        id="height"
                        type="number"
                        className={`w-full border rounded-lg px-4 py-2 border-main-dull-blue`}
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                        placeholder="Введите высоту"
                        min="0"
                        step="0.1"
                    />
                </div>

                <div>
                    <label htmlFor="length" className="block text-left mb-2 text-main-dull-blue">Длина (м)</label>
                    <input
                        id="length"
                        type="number"
                        className={`w-full border rounded-lg px-4 py-2 border-main-dull-blue`}
                        value={length}
                        onChange={(e) => setLength(parseFloat(e.target.value))}
                        placeholder="Введите длину"
                        min="0"
                        step="0.1"
                    />
                </div>

                <div>
                    <label htmlFor="width" className="block text-left mb-2 text-main-dull-blue">Ширина (м)</label>
                    <input
                        id="width"
                        type="number"
                        className={`w-full border rounded-lg px-4 py-2 border-main-dull-blue`}
                        value={width}
                        onChange={(e) => setWidth(parseFloat(e.target.value))}
                        placeholder="Введите ширину"
                        min="0"
                        step="0.1"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => setIsWarehouseSaveModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-main-dull-blue text-white rounded hover:bg-main-purp-dark transition"
                    >
                        Сохранить
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default WarehouseZoneCreateModal;