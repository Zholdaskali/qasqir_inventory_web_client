import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import * as THREE from 'three';
import ReactDOM from "react-dom";

const Modal = ({ children, onClose }) => {
    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
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
    setIsZoneCreated 
}) => {
    const [warehouseZoneName, setWarehouseZoneName] = useState("");
    const [height, setHeight] = useState(0);
    const [length, setLength] = useState(0);
    const [width, setWidth] = useState(0);
    const [isFormError, setIsFormError] = useState(false);
    const [formErrors, setFormErrors] = useState({ height: false, length: false, width: false }); // Добавлено состояние для ошибок размеров
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    // Функция валидации размеров
    const validateDimensions = (value, maxValue, fieldName) => {
        if (value > maxValue) {
            return `${fieldName} не может превышать ${maxValue} м`;
        }
        return "";
    };

    // Обработка изменения размеров
    const handleDimensionChange = (value, setter, maxValue, fieldName) => {
        const numValue = parseFloat(value) || 0;
        setter(numValue);
        setFormErrors(prev => ({
            ...prev,
            [fieldName.toLowerCase()]: numValue > maxValue
        }));
    };

    // Инициализация 3D сцены
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

    // Обновление визуализации
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        scene.children.forEach(child => {
            if (child.type === 'Mesh') {
                scene.remove(child);
            }
        });

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

        if ((length > parentLength) || (height > parentHeight) || (width > parentWidth)) {
            toast.warn("Размеры подзоны превышают размеры родительской зоны!");
        }
    }, [length, height, width, parentLength, parentHeight, parentWidth]);

    const saveWarehouseZone = async (e) => {
        e.preventDefault();

        if (!warehouseZoneName.trim()) {
            setIsFormError(true);
            toast.error("Заполните все обязательные поля");
            return;
        }

        if ((length > parentLength) || (height > parentHeight) || (width > parentWidth)) {
            toast.error("Размеры подзоны не могут превышать размеры родительской зоны");
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Добавить подзону склада</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <form onSubmit={saveWarehouseZone} className="space-y-6 flex-1">
                    <div>
                        <label htmlFor="name" className="block text-left mb-2 text-gray-700 font-medium">Название подзоны</label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${isFormError && !warehouseZoneName.trim() ? 'border-red-500' : 'border-gray-300'}`}
                            value={warehouseZoneName}
                            onChange={(e) => {
                                setWarehouseZoneName(e.target.value);
                                setIsFormError(false);
                            }}
                            placeholder="Введите название подзоны"
                        />
                        {isFormError && !warehouseZoneName.trim() && <p className="text-red-500 text-sm mt-1">Это поле обязательно</p>}
                    </div>

                    <div>
                        <label htmlFor="height" className="block text-left mb-2 text-gray-700 font-medium">Высота (м) <span className="text-gray-500 text-sm">(макс: {parentHeight})</span></label>
                        <input
                            id="height"
                            type="number"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.height ? 'border-red-500' : 'border-gray-300'}`}
                            value={height}
                            onChange={(e) => handleDimensionChange(e.target.value, setHeight, parentHeight, "Высота")}
                            placeholder="Введите высоту"
                            min="0"
                            step="0.1"
                        />
                        {formErrors.height && <p className="text-red-500 text-sm mt-1">{validateDimensions(height, parentHeight, "Высота")}</p>}
                    </div>

                    <div>
                        <label htmlFor="length" className="block text-left mb-2 text-gray-700 font-medium">Длина (м) <span className="text-gray-500 text-sm">(макс: {parentLength})</span></label>
                        <input
                            id="length"
                            type="number"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.length ? 'border-red-500' : 'border-gray-300'}`}
                            value={length}
                            onChange={(e) => handleDimensionChange(e.target.value, setLength, parentLength, "Длина")}
                            placeholder="Введите длину"
                            min="0"
                            step="0.1"
                        />
                        {formErrors.length && <p className="text-red-500 text-sm mt-1">{validateDimensions(length, parentLength, "Длина")}</p>}
                    </div>

                    <div>
                        <label htmlFor="width" className="block text-left mb-2 text-gray-700 font-medium">Ширина (м) <span className="text-gray-500 text-sm">(макс: {parentWidth})</span></label>
                        <input
                            id="width"
                            type="number"
                            className={`w-full border rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.width ? 'border-red-500' : 'border-gray-300'}`}
                            value={width}
                            onChange={(e) => handleDimensionChange(e.target.value, setWidth, parentWidth, "Ширина")}
                            placeholder="Введите ширину"
                            min="0"
                            step="0.1"
                        />
                        {formErrors.width && <p className="text-red-500 text-sm mt-1">{validateDimensions(width, parentWidth, "Ширина")}</p>}
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={() => setIsWarehouseSaveModalOpen(false)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <canvas ref={canvasRef} className="border rounded-lg border-gray-300 bg-gray-50" />
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
                </div>
            </div>
        </Modal>
    );
};

export default WarehouseZoneCreateModal;