import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { FaCube, FaEye, FaEyeSlash, FaSyncAlt } from 'react-icons/fa';
import ZoneSettingModal from '../../../../components/modal-components/warehouse-modal/ZoneSettingModal';

const Warehouse3DViewer = ({ warehouseData, warehouseId, onUpdateWarehouse }) => {
    const mountRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [isWireframe, setIsWireframe] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const transformControlsRef = useRef(null);
    const warehouseGroupRef = useRef(null);
    const connectionsRef = useRef([]);
    const isDraggingRef = useRef(false);

    const highlightColor = new THREE.Color(0x00ff00);
    const defaultZoneColor = 0x3498db;
    const restrictedZoneColor = 0xe74c3c;
    const containerColor = 0x2ecc71;

    useEffect(() => {
        if (!warehouseData || !mountRef.current) return;

        // Инициализация сцены
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(50, 50, 50);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // Освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Сетка
        const gridHelper = new THREE.GridHelper(50, 50);
        gridHelper.visible = showGrid;
        scene.add(gridHelper);

        // Управление камерой
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: null,
        };
        controlsRef.current = controls;

        // Управление трансформацией
        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControlsRef.current = transformControls;
        transformControls.setMode('translate');
        transformControls.enabled = false;
        scene.add(transformControls);

        // Группа для зон склада
        const warehouseGroup = new THREE.Group();
        warehouseGroupRef.current = warehouseGroup;
        scene.add(warehouseGroup);

        // Функция создания зоны
        const createZone = (zone, parentGroup, level, offsetX, offsetZ) => {
            const geometry = new THREE.BoxGeometry(zone.width || 2, zone.height || 4, zone.length || 2);
            const material = new THREE.MeshPhongMaterial({
                color: zone.canStoreItems ? defaultZoneColor : restrictedZoneColor,
                wireframe: isWireframe,
                transparent: true,
                opacity: 0.8,
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(
                offsetX + (zone.width || 2) / 2,
                (zone.height || 4) / 2,
                offsetZ + (zone.length || 2) / 2
            );

            mesh.userData = {
                id: zone.id,
                type: 'zone',
                name: zone.name,
                width: zone.width || 2,
                height: zone.height || 4,
                length: zone.length || 2,
                canStoreItems: zone.canStoreItems,
            };

            parentGroup.add(mesh);

            // Создание дочерних зон
            const subZones = warehouseData.zones.filter(z => z.parentId === zone.id);
            subZones.forEach(subZone => {
                createZone(subZone, parentGroup, level + 1, offsetX, offsetZ);
            });

            return mesh;
        };

        // Загрузка корневых зон
        let rootOffsetX = 0;
        let rootOffsetZ = 0;
        warehouseData.zones.filter(zone => zone.parentId === null).forEach(zone => {
            createZone(zone, warehouseGroup, 0, rootOffsetX, rootOffsetZ);
            rootOffsetX += (zone.width || 2) + 2;
            if (rootOffsetX + (zone.width || 2) > 50) {
                rootOffsetX = 0;
                rootOffsetZ += (zone.length || 2) + 2;
            }
        });

        // Raycaster для выбора объектов
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleObjectChange = () => {
            if (!selectedObject || !transformControls.object) return;

            const object = transformControls.object;
            const updatedPosition = object.position.clone();

            const updatedZones = warehouseData.zones.map(zone => {
                if (zone.id === selectedObject.id) {
                    return {
                        ...zone,
                        positionX: updatedPosition.x,
                        positionY: updatedPosition.y,
                        positionZ: updatedPosition.z,
                    };
                }
                return zone;
            });

            onUpdateWarehouse({ ...warehouseData, zones: updatedZones });
        };

        const resetColors = () => {
            warehouseGroup.traverse(child => {
                if (child.isMesh && child.userData.type) {
                    child.material.color.setHex(
                        child.userData.type === 'zone'
                            ? child.userData.canStoreItems
                                ? defaultZoneColor
                                : restrictedZoneColor
                            : containerColor
                    );
                }
            });
        };

        const onDoubleClick = (event) => {
            event.preventDefault();

            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(warehouseGroup.children, true);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                let targetGroup = object;
                while (targetGroup && !targetGroup.userData.type) {
                    targetGroup = targetGroup.parent;
                }
                if (!targetGroup) return;

                resetColors();
                object.material.color.copy(highlightColor);
                setSelectedObject(targetGroup.userData);

                if (isEditMode) {
                    transformControls.attach(object);
                    setIsSettingModalOpen(true);
                }
            } else if (isEditMode) {
                transformControls.detach();
                controls.enabled = true;
                setSelectedObject(null);
                setIsSettingModalOpen(false);
                resetColors();
            }
        };

        const onMouseDown = (event) => {
            if (!isEditMode || !transformControls.object || event.button !== 2) return;
            event.preventDefault();
            controls.enabled = false;
            isDraggingRef.current = true;
        };

        const onMouseMove = (event) => {
            if (!isDraggingRef.current || !transformControls.object) return;

            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, intersectPoint);

            transformControls.object.position.set(
                intersectPoint.x,
                transformControls.object.position.y,
                intersectPoint.z
            );
        };

        const onMouseUp = (event) => {
            if (event.button !== 2 || !isDraggingRef.current) return;
            isDraggingRef.current = false;
            controls.enabled = true;
            handleObjectChange();
        };

        // Анимация
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Обработка изменения размера
        const handleResize = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        // Обработка клавиш
        const onKeyDown = (event) => {
            if (!isEditMode) return;
            switch (event.key) {
                case 't':
                    transformControls.setMode('translate');
                    break;
                case 'r':
                    transformControls.setMode('rotate');
                    break;
                case 's':
                    transformControls.setMode('scale');
                    break;
                case 'Escape':
                    transformControls.detach();
                    controls.enabled = true;
                    setSelectedObject(null);
                    setIsSettingModalOpen(false);
                    break;
                default:
                    break;
            }
        };

        // Добавление слушателей событий
        renderer.domElement.addEventListener('dblclick', onDoubleClick);
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', onKeyDown);

        // Очистка
        return () => {
            renderer.domElement.removeEventListener('dblclick', onDoubleClick);
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', onKeyDown);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
            controls.dispose();
            transformControls.dispose();
            connectionsRef.current = [];
        };
    }, [warehouseData, isWireframe, onUpdateWarehouse]);

    const toggleWireframe = () => {
        setIsWireframe(prev => {
            warehouseGroupRef.current.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.wireframe = !prev;
                }
            });
            return !prev;
        });
    };

    const toggleEditMode = () => {
        setIsEditMode(prev => {
            const newState = !prev;
            if (!newState) {
                transformControlsRef.current.detach();
                controlsRef.current.enabled = true;
                setSelectedObject(null);
                setIsSettingModalOpen(false);
            }
            return newState;
        });
    };

    const handleSaveZone = (updatedZone) => {
        const updatedZones = warehouseData.zones.map(z =>
            z.id === updatedZone.id ? { ...z, ...updatedZone } : z
        );
        onUpdateWarehouse({ ...warehouseData, zones: updatedZones });
        warehouseGroupRef.current.clear();
        let rootOffsetX = 0;
        let rootOffsetZ = 0;
        updatedZones.filter(zone => zone.parentId === null).forEach(zone => {
            const createZone = (zone, parentGroup, level, offsetX, offsetZ) => {
                const geometry = new THREE.BoxGeometry(zone.width || 2, zone.height || 4, zone.length || 2);
                const material = new THREE.MeshPhongMaterial({
                    color: zone.canStoreItems ? defaultZoneColor : restrictedZoneColor,
                    wireframe: isWireframe,
                    transparent: true,
                    opacity: 0.8,
                });
                const mesh = new THREE.Mesh(geometry, material);

                mesh.position.set(
                    offsetX + (zone.width || 2) / 2,
                    (zone.height || 4) / 2,
                    offsetZ + (zone.length || 2) / 2
                );

                mesh.userData = {
                    id: zone.id,
                    type: 'zone',
                    name: zone.name,
                    width: zone.width || 2,
                    height: zone.height || 4,
                    length: zone.length || 2,
                    canStoreItems: zone.canStoreItems,
                };

                parentGroup.add(mesh);

                const subZones = updatedZones.filter(z => z.parentId === zone.id);
                subZones.forEach(subZone => {
                    createZone(subZone, parentGroup, level + 1, offsetX, offsetZ);
                });

                return mesh;
            };

            createZone(zone, warehouseGroupRef.current, 0, rootOffsetX, rootOffsetZ);
            rootOffsetX += (zone.width || 2) + 2;
            if (rootOffsetX + (zone.width || 2) > 50) {
                rootOffsetX = 0;
                rootOffsetZ += (zone.length || 2) + 2;
            }
        });
    };

    return (
        <div className="relative w-full h-[800px] border border-gray-300 rounded-xl shadow-lg overflow-hidden bg-gray-50">
            <div ref={mountRef} className="w-full h-full" />

            <div className="absolute top-2 left-2 w-48 bg-white/95 p-3 rounded-md shadow-lg pointer-events-auto border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <FaCube className="text-blue-600 w-4 h-4" /> Управление
                </h3>
                <div className="space-y-2">
                    <button
                        onClick={toggleWireframe}
                        className="w-full flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-150 text-xs font-medium"
                    >
                        {isWireframe ? (
                            <>
                                <FaEye className="w-3 h-3" /> Сплошной
                            </>
                        ) : (
                            <>
                                <FaEyeSlash className="w-3 h-3" /> Каркас
                            </>
                        )}
                    </button>
                    <button
                        onClick={() =>
                            setShowGrid((prev) => {
                                const gridHelper = sceneRef.current?.children.find((obj) => obj instanceof THREE.GridHelper);
                                if (gridHelper) gridHelper.visible = !prev;
                                return !prev;
                            })
                        }
                        className="w-full flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-150 text-xs font-medium"
                    >
                        {showGrid ? (
                            <>
                                <FaEyeSlash className="w-3 h-3" /> Скрыть сетку
                            </>
                        ) : (
                            <>
                                <FaEye className="w-3 h-3" /> Показать сетку
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            cameraRef.current.position.set(50, 50, 50);
                            controlsRef.current.reset();
                        }}
                        className="w-full flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-150 text-xs font-medium"
                    >
                        <FaSyncAlt className="w-3 h-3" /> Сброс камеры
                    </button>
                    <button
                        onClick={toggleEditMode}
                        className="w-full flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-150 text-xs font-medium"
                    >
                        {isEditMode ? "Просмотр" : "Редактировать"}
                    </button>
                </div>
            </div>

            {selectedObject && (
                <div className="absolute top-4 right-4 w-80 bg-white/95 p-5 rounded-lg shadow-xl pointer-events-auto border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        {selectedObject.type === 'zone' ? (
                            <>
                                <FaCube className="text-gray-600" /> Информация о зоне
                            </>
                        ) : (
                            <>
                                <FaCube className="text-gray-600" /> Информация о контейнере
                            </>
                        )}
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p className="text-sm">
                            <strong className="font-semibold">Название/Номер:</strong>{' '}
                            <span className="text-gray-900">{selectedObject.name || selectedObject.serialNumber}</span>
                        </p>
                        <p className="text-sm">
                            <strong className="font-semibold">Размеры:</strong>{' '}
                            <span className="text-gray-900">
                                {selectedObject.width}×{selectedObject.height}×{selectedObject.length}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {isSettingModalOpen && (
                <ZoneSettingModal
                    setIsSettingModalOpen={setIsSettingModalOpen}
                    zone={selectedObject}
                    onClose={() => setIsSettingModalOpen(false)}
                    warehouseId={warehouseId}
                    onSave={handleSaveZone}
                />
            )}
        </div>
    );
};

export default Warehouse3DViewer;