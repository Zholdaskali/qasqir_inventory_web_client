import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import ZoneCard from './ZoneCard';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import WarehouseZoneCreateModal from '../../../../components/modal-components/WarehouseZoneCreateModal';
import { HiOutlineCube, HiRefresh, HiPlus, HiViewGrid, HiCube, HiLightBulb } from "react-icons/hi";
import { toast } from 'react-toastify';
import Notification from '../../../../components/notification/Notification';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

// Функция для создания текстового спрайта
const createTextSprite = (message, parameters = {}) => {
    const fontface = parameters.fontface || "Arial";
    const fontsize = parameters.fontsize || 12;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontsize}px ${fontface}`;
    
    const metrics = context.measureText(message);
    const textWidth = metrics.width;
    canvas.width = textWidth + 10;
    canvas.height = fontsize * 1.2;

    context.font = `${fontsize}px ${fontface}`;
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText(message, 5, fontsize);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 50, canvas.height / 50, 1);
    return sprite;
};

const WarehouseZoneList = () => {
    const location = useLocation();
    const { warehouse } = location.state || {};
    const authToken = useSelector((state) => state.token.token);
    const user = useSelector((state) => state.user);

    const [warehouseData, setWarehouseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState('list');
    const [showCabinets, setShowCabinets] = useState(true);
    const [showSubZones, setShowSubZones] = useState(true);
    const [showContainers, setShowContainers] = useState(true);

    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);

    const hasRole = (role) => user?.userRoles?.includes(role) ?? false;

    const fetchWarehouseData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `http://localhost:8081/api/v1/employee/warehouses/${warehouse.id}`,
                { headers: { "Auth-token": authToken } }
            );
            setWarehouseData(response.data.body);
            setLoading(false);
        } catch (error) {
            console.error("Error loading warehouse data:", error);
            setError('Ошибка загрузки данных склада');
            setLoading(false);
            toast.error("Не удалось загрузить данные склада");
        }
    }, [warehouse?.id, authToken]);

    useEffect(() => {
        if (warehouse?.id) {
            fetchWarehouseData();
        }
    }, [warehouse?.id, fetchWarehouseData]);

    const filteredCabinets = useMemo(() => {
        if (!warehouseData?.zones) return [];
        const cabinets = warehouseData.zones.filter(zone => !zone.parentId);
        return cabinets.map(cabinet => {
            const subZones = warehouseData.zones.filter(zone => zone.parentId === cabinet.id);
            const cabinetVolume = (cabinet.width || 2) * (cabinet.height || 4) * (cabinet.length || 2);
            const occupiedVolume = subZones.reduce((sum, zone) => {
                const containers = warehouseData.zones.filter(c => c.parentId === zone.id);
                const containerVolume = containers.reduce((acc, cont) => {
                    return acc + ((cont.width || 1) * (cont.height || 1) * (cont.length || 1));
                }, 0);
                return sum + ((zone.width || 2) * (zone.height || 1) * (zone.length || 2)) + containerVolume;
            }, 0);
            const freeVolume = cabinetVolume - occupiedVolume;
            return { ...cabinet, freeVolume, cabinetVolume, subZones };
        }).filter(cabinet =>
            cabinet.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [warehouseData, searchQuery]);

    // Инициализация 3D сцены
    useEffect(() => {
        if (viewMode !== '3d' || !canvasRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });

        renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 5;
        controls.maxDistance = 50;

        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = canvasRef.current.clientWidth;
            const height = canvasRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            controls.dispose();
            renderer.dispose();
            scene.children.forEach(child => scene.remove(child));
            sceneRef.current = null;
            rendererRef.current = null;
            cameraRef.current = null;
        };
    }, [viewMode]);

    // Обновление 3D визуализации
    useEffect(() => {
        if (viewMode !== '3d' || !warehouseData?.zones || !sceneRef.current) return;

        const scene = sceneRef.current;
        scene.children.forEach(child => {
            if (child.type === 'Mesh' || child.type === 'Sprite') {
                scene.remove(child);
            }
        });

        let maxDimension = 0;
        warehouseData.zones.forEach(zone => {
            const width = zone.width || 2;
            const height = zone.height || (zone.parentId ? 1 : 4);
            const length = zone.length || 2;
            maxDimension = Math.max(maxDimension, width, height, length);
        });

        const cabinetPositions = {};
        const subZonePositions = {};

        // Шкафы
        const cabinets = warehouseData.zones.filter(zone => !zone.parentId);
        cabinets.forEach((cabinet, index) => {
            const geometry = new THREE.BoxGeometry(cabinet.width || 2, cabinet.height || 4, cabinet.length || 2);
            const material = new THREE.MeshPhongMaterial({
                color: 0xaaaaaa,
                transparent: true,
                opacity: 0.2,
                wireframe: true,
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.name = cabinet.name;

            const posX = (index % 5) * (cabinet.width || 2) * 1.5;
            const posZ = Math.floor(index / 5) * (cabinet.length || 2) * 1.5;
            const posY = (cabinet.height || 4) / 2;

            cube.position.set(posX, posY, posZ);
            cabinetPositions[cabinet.id] = { x: posX, y: posY, z: posZ };
            cube.visible = showCabinets;
            scene.add(cube);

            const nameSprite = createTextSprite(cabinet.name, { fontsize: 12 });
            nameSprite.position.set(posX, posY + (cabinet.height || 4) / 2 + 0.7, posZ);
            scene.add(nameSprite);
        });

        // Подзоны
        const subZones = warehouseData.zones.filter(zone => zone.parentId && !warehouseData.zones.some(z => z.parentId === zone.id));
        subZones.forEach((subZone, index) => {
            const parentZone = warehouseData.zones.find(z => z.id === subZone.parentId);
            if (!parentZone || !cabinetPositions[parentZone.id]) return;

            const parentPos = cabinetPositions[parentZone.id];
            const geometry = new THREE.BoxGeometry(subZone.width || 2, subZone.height || 1, subZone.length || 2);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00cc00,
                transparent: true,
                opacity: 0.7,
                wireframe: true,
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.name = subZone.name;

            const subZoneY = (subZone.height || 1) / 2;
            const subZoneZ = parentPos.z + (index + 1) * (subZone.length || 2) * 1.2;
            cube.position.set(parentPos.x, subZoneY, subZoneZ);
            subZonePositions[subZone.id] = { x: parentPos.x, y: subZoneY, z: subZoneZ };
            cube.visible = showSubZones;
            scene.add(cube);

            const nameSprite = createTextSprite(subZone.name, { fontsize: 10 });
            nameSprite.position.set(parentPos.x, subZoneY + (subZone.height || 1) / 2 + 0.3, subZoneZ);
            scene.add(nameSprite);
        });

        // Контейнеры
        const containers = warehouseData.zones.filter(zone => zone.parentId && warehouseData.zones.some(z => z.parentId === zone.id));
        containers.forEach((container, index) => {
            const parentSubZone = warehouseData.zones.find(z => z.id === container.parentId);
            if (!parentSubZone || !subZonePositions[parentSubZone.id]) return;

            const parentPos = subZonePositions[parentSubZone.id];
            const geometry = new THREE.BoxGeometry(container.width || 1, container.height || 1, container.length || 1);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffa500,
                transparent: true,
                opacity: 0.9,
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.name = container.name;

            const containerY = (container.height || 1) / 2;
            const containerX = parentPos.x + (index + 1) * (container.width || 1) * 1.1;
            cube.position.set(containerX, containerY, parentPos.z);
            cube.visible = showContainers;
            scene.add(cube);

            const nameSprite = createTextSprite(container.name, { fontsize: 8 });
            nameSprite.position.set(containerX, containerY + (container.height || 1) / 2 + 0.2, parentPos.z);
            scene.add(nameSprite);
        });

        cameraRef.current.position.set(maxDimension * 2, maxDimension * 2, maxDimension * 2);
        cameraRef.current.lookAt(0, 0, 0);
    }, [viewMode, warehouseData, showCabinets, showSubZones, showContainers]);

    // Интерактивность
    useEffect(() => {
        if (viewMode !== '3d' || !warehouseData?.zones || !sceneRef.current || !canvasRef.current) return;

        const scene = sceneRef.current;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseClick = (event) => {
            const rect = canvasRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersects = raycaster.intersectObjects(scene.children);

            if (intersects.length > 0) {
                const selectedObject = intersects[0].object;
                const zone = warehouseData.zones.find(z => z.name === selectedObject.name);
                if (zone) {
                    toast.info(`Выбрана зона: ${zone.name}`);
                }
            }
        };

        canvasRef.current.addEventListener('click', onMouseClick);

        return () => {
            if (canvasRef.current) {
                canvasRef.current.removeEventListener('click', onMouseClick);
            }
        };
    }, [viewMode, warehouseData]);

    // Экспорт 3D в GLTF
    const exportToGLTF = () => {
        if (!sceneRef.current) {
            toast.error("3D сцена недоступна для экспорта");
            return;
        }
        const exporter = new GLTFExporter();
        exporter.parse(sceneRef.current, (gltf) => {
            const output = JSON.stringify(gltf);
            const blob = new Blob([output], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `warehouse_${warehouseData?.name || 'unknown'}.gltf`;
            link.click();
            URL.revokeObjectURL(url);
    
            // Открываем новое окно с GLTF Viewer, но оставляем фокус на текущем окне
            const gltfWindow = window.open('https://gltf-viewer.donmccurdy.com/', '_blank', 'width=800,height=600');
            if (gltfWindow) {
                gltfWindow.blur(); // Убираем фокус с нового окна
                window.focus();    // Возвращаем фокус на основное окно
            }
    
            // Показываем инструкцию в уведомлении
            toast.success(
                <div>
                    3D модель экспортирована в GLTF. <br />
                    Перетащите файл <strong>{`warehouse_${warehouseData?.name || 'unknown'}.gltf`}</strong> в открытое окно GLTF Viewer или выберите его через кнопку загрузки.
                </div>,
                { autoClose: 15000 } // Увеличенное время отображения
            );
        }, { binary: false });
    };

    // Экспорт списка зон в CSV
    const exportZonesToCSV = () => {
        if (!warehouseData?.zones) {
            toast.error("Нет данных для экспорта");
            return;
        }

        const headers = [
            "ID",
            "Название",
            "Тип",
            "Родительский ID",
            "Ширина",
            "Высота",
            "Длина",
            "Свободный объем",
            "Общий объем",
        ];

        const rows = filteredCabinets.flatMap(cabinet => {
            const cabinetRow = [
                `"${cabinet.id}"`,
                `"${cabinet.name}"`,
                '"Шкаф"',
                '"—"',
                cabinet.width || 2,
                cabinet.height || 4,
                cabinet.length || 2,
                cabinet.freeVolume.toFixed(2),
                cabinet.cabinetVolume.toFixed(2),
            ];

            const subZoneRows = cabinet.subZones.flatMap(subZone => {
                const subZoneRow = [
                    `"${subZone.id}"`,
                    `"${subZone.name}"`,
                    '"Подзона"',
                    `"${cabinet.id}"`,
                    subZone.width || 2,
                    subZone.height || 1,
                    subZone.length || 2,
                    "—",
                    "—",
                ];

                const containerRows = warehouseData.zones
                    .filter(container => container.parentId === subZone.id)
                    .map(container => [
                        `"${container.id}"`,
                        `"${container.name}"`,
                        '"Контейнер"',
                        `"${subZone.id}"`,
                        container.width || 1,
                        container.height || 1,
                        container.length || 1,
                        "—",
                        "—",
                    ]);

                return [subZoneRow, ...containerRows];
            });

            return [cabinetRow, ...subZoneRows];
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(row => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `zones_${warehouseData?.name || 'unknown'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Список зон экспортирован в CSV");
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineCube className="w-6 h-6 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Шкафы склада: {warehouseData?.name || warehouse?.name}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Всего шкафов: {filteredCabinets.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="text"
                                placeholder="Поиск шкафа..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                onClick={fetchWarehouseData}
                                className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                                disabled={loading}
                            >
                                <HiRefresh className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                                Обновить
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === 'list' ? '3d' : 'list')}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm"
                            >
                                {viewMode === 'list' ? <HiCube className="w-4 h-4" /> : <HiViewGrid className="w-4 h-4" />}
                                {viewMode === 'list' ? '3D Вид' : 'Список'}
                            </button>
                            <button
                                onClick={exportZonesToCSV}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                                Экспорт в CSV
                            </button>
                            {viewMode === '3d' && (
                                <button
                                    onClick={exportToGLTF}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Экспорт 3D в GLTF
                                </button>
                            )}
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="text-gray-500 mt-2">Загрузка...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-4 text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && viewMode === 'list' && (
                        <div className="flex flex-col gap-4">
                            {filteredCabinets.length > 0 ? (
                                filteredCabinets.map(cabinet => (
                                    <div
                                        key={cabinet.id}
                                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                        <ZoneCard
                                            zone={cabinet}
                                            warehouse={warehouse}
                                            isCabinet={true}
                                            onClose={fetchWarehouseData}
                                            allZones={warehouseData.zones}
                                            freeVolume={cabinet.freeVolume}
                                            cabinetVolume={cabinet.cabinetVolume}
                                            subZones={cabinet.subZones}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Шкафов не найдено
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !error && viewMode === '3d' && (
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <canvas ref={canvasRef} className="w-full h-[70vh] min-h-[400px] border rounded-lg border-gray-300 bg-gray-50" />
                            <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-1" title="Шкафы">
                                    <span className="inline-block w-4 h-4 bg-gray-300 opacity-30 border border-gray-400"></span>
                                    <span className="text-gray-700">Шкафы</span>
                                </div>
                                <div className="flex items-center gap-1" title="Подзоны">
                                    <span className="inline-block w-4 h-4 bg-green-500 opacity-90 border border-green-600"></span>
                                    <span className="text-gray-700">Подзоны</span>
                                </div>
                                <div className="flex items-center gap-1" title="Контейнеры">
                                    <span className="inline-block w-4 h-4 bg-orange-500 opacity-90 border border-orange-600"></span>
                                    <span className="text-gray-700">Контейнеры</span>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        cameraRef.current.position.set(10, 10, 10);
                                        cameraRef.current.lookAt(0, 0, 0);
                                    }}
                                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                                    title="Сбросить камеру"
                                >
                                    <HiRefresh className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => {
                                        const light = sceneRef.current.children.find(child => child.type === 'DirectionalLight');
                                        light.visible = !light.visible;
                                    }}
                                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
                                    title="Переключить освещение"
                                >
                                    <HiLightBulb className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showCabinets}
                                        onChange={(e) => setShowCabinets(e.target.checked)}
                                    />
                                    <span>Шкафы</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showSubZones}
                                        onChange={(e) => setShowSubZones(e.target.checked)}
                                    />
                                    <span>Подзоны</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showContainers}
                                        onChange={(e) => setShowContainers(e.target.checked)}
                                    />
                                    <span>Контейнеры</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {hasRole("warehouse_manager") && (
                    <button
                        className="fixed bottom-6 right-6 w-10 h-10 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center"
                        onClick={() => setIsModalOpen(true)}
                        title="Добавить шкаф"
                    >
                        +
                    </button>
                )}

                {isModalOpen && (
                    <WarehouseZoneCreateModal
                        setIsWarehouseSaveModalOpen={setIsModalOpen}
                        warehouseId={warehouse.id}
                        parentId={null}
                        width={Infinity}
                        height={Infinity}
                        length={Infinity}
                        setIsZoneCreated={fetchWarehouseData}
                    />
                )}
            </div>
            <Notification />
        </div>
    );
};

export default WarehouseZoneList;