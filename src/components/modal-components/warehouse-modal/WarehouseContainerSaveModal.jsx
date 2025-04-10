import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from 'react-toastify';
import * as THREE from 'three';
import { API_SAVE_WAREHOUSE_CONTAINER } from "../../../api/API";

const WarehouseContainerSaveModal = ({ setIsContainerSaveModalOpen, warehouseZoneId, onClose }) => {
    const [serialNumber, setSerialNumber] = useState("");
    const [length, setLength] = useState("0.1");
    const [height, setHeight] = useState("0.1");
    const [width, setWidth] = useState("0.1");
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const authToken = useSelector((state) => state.token.token);
    const modalRef = useRef(null);
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    // Закрытие модального окна при клике вне области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                resetForm();
                setIsContainerSaveModalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsContainerSaveModalOpen]);

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

        const axesHelper = new THREE.AxesHelper(5); // Добавляем оси координат
        scene.add(axesHelper);

        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => renderer.dispose();
    }, []);

    // Обновление 3D визуализации
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        scene.children.forEach(child => {
            if (child.type === 'Mesh') scene.remove(child);
        });

        const parsedLength = parseFloat(length) || 0.1;
        const parsedHeight = parseFloat(height) || 0.1;
        const parsedWidth = parseFloat(width) || 0.1;

        const containerGeometry = new THREE.BoxGeometry(parsedLength, parsedHeight, parsedWidth);
        const containerMaterial = new THREE.MeshPhongMaterial({
            color: 0x00cc00,
            transparent: true,
            opacity: 0.9,
            wireframe: true
        });
        const containerCube = new THREE.Mesh(containerGeometry, containerMaterial);
        scene.add(containerCube);

        const maxDimension = Math.max(parsedLength, parsedHeight, parsedWidth);
        cameraRef.current.position.set(maxDimension * 2, maxDimension * 2, maxDimension * 2);
        cameraRef.current.lookAt(0, 0, 0);
    }, [length, height, width]);

    // Валидация поля
    const validateField = useCallback((name, value) => {
        switch (name) {
            case 'serialNumber':
                return value.trim() ? '' : 'Серийный номер обязателен';
            case 'length':
            case 'height':
            case 'width':
                const numValue = parseFloat(value);
                return (isNaN(numValue) || numValue < 0.1) ? 'Размер должен быть не менее 0.1 м' : '';
            default:
                return '';
        }
    }, []);

    // Обработка изменения ввода
    const handleInputChange = (setter, name) => (e) => {
        const value = e.target.value;
        setter(value);
        setFormErrors(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    // Сброс формы
    const resetForm = () => {
        setSerialNumber("");
        setLength("0.1");
        setHeight("0.1");
        setWidth("0.1");
        setFormErrors({});
    };

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {
            serialNumber: validateField('serialNumber', serialNumber),
            length: validateField('length', length),
            height: validateField('height', height),
            width: validateField('width', width)
        };

        setFormErrors(errors);
        if (Object.values(errors).some(error => error)) {
            toast.error("Проверьте правильность заполнения полей");
            return;
        }

        const parsedLength = parseFloat(length);
        const parsedHeight = parseFloat(height);
        const parsedWidth = parseFloat(width);
        const capacity = parsedLength * parsedHeight * parsedWidth;

        setIsLoading(true);
        try {
            const response = await axios.post(
                API_SAVE_WAREHOUSE_CONTAINER,
                {
                    warehouseZoneId,
                    serialNumber,
                    capacity,
                    length: parsedLength,
                    height: parsedHeight,
                    width: parsedWidth,
                },
                { headers: { "Auth-token": authToken } }
            );

            toast.success(response?.data?.message || "Контейнер успешно создан");
            resetForm();
            setIsContainerSaveModalOpen(false);
            if (onClose) onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании контейнера");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div ref={modalRef} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-main-dull-gray text-center mb-6">Создание контейнера</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-main-dull-blue font-medium mb-2">Серийный номер</label>
                            <input
                                type="text"
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-blue transition-colors duration-200 ${formErrors.serialNumber ? 'border-red-500' : 'border-main-dull-blue'}`}
                                value={serialNumber}
                                onChange={handleInputChange(setSerialNumber, 'serialNumber')}
                                placeholder="Введите серийный номер"
                                disabled={isLoading}
                            />
                            {formErrors.serialNumber && <p className="text-red-500 text-sm mt-1">{formErrors.serialNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-main-dull-blue font-medium mb-2">Длина (м)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-blue transition-colors duration-200 ${formErrors.length ? 'border-red-500' : 'border-main-dull-blue'}`}
                                value={length}
                                onChange={handleInputChange(setLength, 'length')}
                                placeholder="Введите длину"
                                disabled={isLoading}
                            />
                            {formErrors.length && <p className="text-red-500 text-sm mt-1">{formErrors.length}</p>}
                        </div>
                        <div>
                            <label className="block text-main-dull-blue font-medium mb-2">Высота (м)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-blue transition-colors duration-200 ${formErrors.height ? 'border-red-500' : 'border-main-dull-blue'}`}
                                value={height}
                                onChange={handleInputChange(setHeight, 'height')}
                                placeholder="Введите высоту"
                                disabled={isLoading}
                            />
                            {formErrors.height && <p classне="text-red-500 text-sm mt-1">{formErrors.height}</p>}
                        </div>
                        <div>
                            <label className="block text-main-dull-blue font-medium mb-2">Ширина (м)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-main-blue transition-colors duration-200 ${formErrors.width ? 'border-red-500' : 'border-main-dull-blue'}`}
                                value={width}
                                onChange={handleInputChange(setWidth, 'width')}
                                placeholder="Введите ширину"
                                disabled={isLoading}
                            />
                            {formErrors.width && <p className="text-red-500 text-sm mt-1">{formErrors.width}</p>}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setIsContainerSaveModalOpen(false); }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                                disabled={isLoading}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? "Создание..." : "Создать"}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <canvas ref={canvasRef} className="border rounded-lg border-gray-300 bg-gray-50 w-[300px] h-[300px]" />
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium">
                        <span className="inline-block w-4 h-4 bg-green-500 opacity-90 border border-green-600"></span>
                        <span className="text-gray-700">Контейнер</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Красная ось: X (длина), Зеленая ось: Y (высота), Синяя ось: Z (ширина)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseContainerSaveModal;