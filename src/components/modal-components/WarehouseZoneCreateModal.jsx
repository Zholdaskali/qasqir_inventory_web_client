import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import * as THREE from 'three';
import ReactDOM from "react-dom";
import ConfirmationWrapper from "../ui/ConfirmationWrapper";
import { API_WAREHOUSE_ZONE_CREATE } from "../../api/API";

const Modal = ({ children, onClose }) => {
    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
                {children}
            </div>
        </div>,
        document.body
    );
};

const WarehouseZoneCreateModal = ({
    setIsWarehouseSaveModalOpen,
    warehouseId,
    parentId,
    width: parentWidth,
    height: parentHeight,
    length: parentLength,
    setIsZoneCreated,
    parentZoneName
}) => {
    const initialName = parentZoneName ? `${parentZoneName} - ` : "";
    const [warehouseZoneName, setWarehouseZoneName] = useState(initialName);
    const [height, setHeight] = useState(parentHeight / 2 || 0.1);
    const [length, setLength] = useState(parentLength / 2 || 0.1);
    const [width, setWidth] = useState(parentWidth / 2 || 0.1);
    const [isFormError, setIsFormError] = useState(false);
    const [formErrors, setFormErrors] = useState({ height: false, length: false, width: false });
    const [isLoading, setIsLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    const validateDimensions = (value, maxValue, fieldName) => {
        if (value < 0.1) return `${fieldName} должна быть не менее 0.1 м`;
        if (value > maxValue) return `${fieldName} не может превышать ${maxValue} м`;
        return "";
    };

    const handleDimensionChange = (value, setter, maxValue, fieldName) => {
        // Разрешаем временно пустую строку
        if (value === "") {
            setter(value);
            setFormErrors(prev => ({
                ...prev,
                [fieldName.toLowerCase()]: false
            }));
            return;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setter(numValue);
        setFormErrors(prev => ({
            ...prev,
            [fieldName.toLowerCase()]: numValue > maxValue || numValue < 0.1
        }));
    };


    const handleNameChange = (e) => {
        const newValue = e.target.value;
        const prefix = parentZoneName ? `${parentZoneName} - ` : "";
        if (!newValue.startsWith(prefix)) {
            setWarehouseZoneName(`${prefix}${newValue}`);
        } else {
            setWarehouseZoneName(newValue);
        }
        setIsFormError(false);
    };

    const resetForm = () => {
        setWarehouseZoneName(initialName);
        setHeight(parentHeight / 2 || 0.1);
        setLength(parentLength / 2 || 0.1);
        setWidth(parentWidth / 2 || 0.1);
        setIsFormError(false);
        setFormErrors({ height: false, length: false, width: false });
    };

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });

        renderer.setSize(300, 300);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.dispose();
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        scene.children = scene.children.filter(child => child.type !== 'Mesh');

        const parentGeometry = new THREE.BoxGeometry(parentLength || 1, parentHeight || 1, parentWidth || 1);
        const parentMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        const parentCube = new THREE.Mesh(parentGeometry, parentMaterial);
        scene.add(parentCube);

        const subZoneGeometry = new THREE.BoxGeometry(length || 1, height || 1, width || 1);
        const subZoneMaterial = new THREE.MeshPhongMaterial({
            color: 0x00cc00,
            transparent: true,
            opacity: 0.9,
            wireframe: true
        });
        const subZoneCube = new THREE.Mesh(subZoneGeometry, subZoneMaterial);
        scene.add(subZoneCube);

        const maxDimension = Math.max(parentLength || 1, parentHeight || 1, parentWidth || 1);
        cameraRef.current.position.set(maxDimension * 2, maxDimension * 2, maxDimension * 2);
        cameraRef.current.lookAt(0, 0, 0);
    }, [length, height, width, parentLength, parentHeight, parentWidth]);

    const saveWarehouseZone = async () => {
        if (!warehouseZoneName.trim()) {
            setIsFormError(true);
            toast.error("Заполните все обязательные поля");
            return;
        }

        if (Object.values(formErrors).some(error => error)) {
            toast.error("Проверьте правильность введенных размеров");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(
                `${API_WAREHOUSE_ZONE_CREATE}/${warehouseId}/zones?userId=${userId}`,
                {
                    name: warehouseZoneName,
                    parentId: parentId,
                    height,
                    length,
                    width
                },
                {
                    headers: { "Auth-token": authToken }
                }
            );

            setIsZoneCreated(true);
            setIsWarehouseSaveModalOpen(false);
            toast.success("Подзона успешно создана");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при сохранении");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        setIsWarehouseSaveModalOpen(false);
    };

    return (
        <Modal onClose={handleClose}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Добавить подзону склада</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="space-y-6 flex-1">
                    {/* Название */}
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-gray-700 font-medium">Название подзоны</label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-700 ${isFormError && !warehouseZoneName.trim() ? 'border-red-500' : 'border-gray-300'}`}
                            value={warehouseZoneName}
                            onChange={handleNameChange}
                        />
                        {isFormError && !warehouseZoneName.trim() && <p className="text-red-500 text-sm mt-1">Это поле обязательно</p>}
                    </div>

                    {/* Высота */}
                    <div>
                        <label htmlFor="height" className="block mb-2 text-gray-700 font-medium">Высота (м)</label>
                        <input
                            id="height"
                            type="number"
                            className={`w-full border rounded-lg px-4 py-3 ${formErrors.height ? 'border-red-500' : 'border-gray-300'}`}
                            value={height}
                            onChange={(e) => handleDimensionChange(e.target.value, setHeight, parentHeight, "Высота")}
                            min="0.1"
                            step="0.1"
                        />
                        {formErrors.height && <p className="text-red-500 text-sm mt-1">{validateDimensions(height, parentHeight, "Высота")}</p>}
                    </div>

                    {/* Длина */}
                    <div>
                        <label htmlFor="length" className="block mb-2 text-gray-700 font-medium">Длина (м)</label>
                        <input
                            id="length"
                            type="number"
                            className={`w-full border rounded-lg px-4 py-3 ${formErrors.length ? 'border-red-500' : 'border-gray-300'}`}
                            value={length}
                            onChange={(e) => handleDimensionChange(e.target.value, setLength, parentLength, "Длина")}
                            min="0.1"
                            step="0.1"
                        />
                        {formErrors.length && <p className="text-red-500 text-sm mt-1">{validateDimensions(length, parentLength, "Длина")}</p>}
                    </div>

                    {/* Ширина */}
                    <div>
                        <label htmlFor="width" className="block mb-2 text-gray-700 font-medium">Ширина (м)</label>
                        <input
                            id="width"
                            type="number"
                            className={`w-full border rounded-lg px-4 py-3 ${formErrors.width ? 'border-red-500' : 'border-gray-300'}`}
                            value={width}
                            onChange={(e) => handleDimensionChange(e.target.value, setWidth, parentWidth, "Ширина")}
                            min="0.1"
                            step="0.1"
                        />
                        {formErrors.width && <p className="text-red-500 text-sm mt-1">{validateDimensions(width, parentWidth, "Ширина")}</p>}
                    </div>

                    {/* Кнопки */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                        <ConfirmationWrapper
                            title="Подтверждение сохранения"
                            message="Вы уверены, что хотите создать эту подзону?"
                            onConfirm={saveWarehouseZone}
                        >
                            <button
                                type="button"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "Сохранение..." : "Сохранить"}
                            </button>
                        </ConfirmationWrapper>
                    </div>
                </div>

                {/* Визуализация */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <canvas ref={canvasRef} className="border rounded-lg bg-gray-50 w-full max-w-[300px] h-[300px]" />
                    <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-gray-300 opacity-30 border border-gray-400"></span>
                            <span className="text-gray-700">Родительская зона</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-4 h-4 bg-green-500 opacity-90 border border-green-600"></span>
                            <span className="text-gray-700">Подзона</span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Красная ось: X (длина), Зелёная: Y (высота), Синяя: Z (ширина)
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default WarehouseZoneCreateModal;
