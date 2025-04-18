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
    const [showSubZones, setShowSubZones] = useState(true);
    const [showLabels, setShowLabels] = useState(true);

    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const transformControlsRef = useRef(null);
    const warehouseGroupRef = useRef(null);
    const isDraggingRef = useRef(false);

    const highlightColor = new THREE.Color(0x00ff00);
    const restrictedZoneColor = 0xe74c3c;
    const containerColor = 0x2ecc71;
    const hierarchyColors = [0x3498db, 0x1abc9c, 0x9b59b6, 0xe67e22, 0xf1c40f];

    // Создание текстового спрайта
    const createTextSprite = (text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 16; // Уменьшенный размер шрифта
        context.font = `${fontSize}px Roboto, Arial, sans-serif`;
        const textWidth = context.measureText(text).width;
        canvas.width = textWidth + 10;
        canvas.height = fontSize + 10;

        context.font = `${fontSize}px Roboto, Arial, sans-serif`;
        context.fillStyle = 'rgba(255, 255, 255, 0.6)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.8 });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(canvas.width / 30, canvas.height / 30, 1);
        return sprite;
    };

    // Создание линии связи между зонами
    const createConnectionLine = (startPos, endPos) => {
        const material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const points = [startPos, endPos];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, material);
    };

    // Создание зоны
    const createZone = (zone, parentGroup, level, parentPosition = { x: 0, y: 0, z: 0 }) => {
        console.log(`Creating zone ${zone.id}:`, { name: zone.name, level, parentPosition });

        const zoneWidth = zone.width || 4;
        const zoneHeight = zone.height || 2;
        const zoneLength = zone.length || 4;

        const geometry = new THREE.BoxGeometry(zoneWidth, zoneHeight, zoneLength);
        const material = new THREE.MeshPhongMaterial({
            color: zone.canStoreItems ? hierarchyColors[level % hierarchyColors.length] : restrictedZoneColor,
            wireframe: isWireframe,
            transparent: true,
            opacity: 0.7,
        });
        const mesh = new THREE.Mesh(geometry, material);

        const verticalOffset = level * (zoneHeight + 0.5);
        mesh.position.set(
            parentPosition.x,
            parentPosition.y + zoneHeight / 2 + verticalOffset,
            parentPosition.z
        );

        mesh.userData = {
            id: zone.id,
            type: 'zone',
            name: zone.name,
            width: zoneWidth,
            height: zoneHeight,
            length: zoneLength,
            canStoreItems: zone.canStoreItems,
            level: level,
        };

        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edges);

        parentGroup.add(mesh);
        console.log(`Zone ${zone.id} added at position:`, mesh.position);

        const label = createTextSprite(zone.name || `Zone ${zone.id}`);
        label.position.set(
            mesh.position.x,
            mesh.position.y + zoneHeight / 2 + 0.5,
            mesh.position.z
        );
        label.userData = { level: level };
        parentGroup.add(label);

        const subZones = warehouseData.zones.filter(z => z.parentId === zone.id);
        console.log(`Subzones for zone ${zone.id}:`, subZones);

        subZones.forEach((subZone, index) => {
            const subZoneWidth = subZone.width || 2;
            const subZoneLength = subZone.length || 2;
            const subOffsetX = (index % 2) * (subZoneWidth + 0.5) - zoneWidth / 4;
            const subOffsetZ = Math.floor(index / 2) * (subZoneLength + 0.5) - zoneLength / 4;

            const subZoneMesh = createZone(subZone, parentGroup, level + 1, {
                x: parentPosition.x + subOffsetX,
                y: parentPosition.y + verticalOffset,
                z: parentPosition.z + subOffsetZ,
            });

            const line = createConnectionLine(
                new THREE.Vector3(mesh.position.x, mesh.position.y + zoneHeight / 2, mesh.position.z),
                new THREE.Vector3(subZoneMesh.position.x, subZoneMesh.position.y - subZoneMesh.userData.height / 2, subZoneMesh.position.z)
            );
            parentGroup.add(line);
        });

        return mesh;
    };

    // Создание контейнера
    const createContainer = (container, parentGroup) => {
        console.log(`Creating container ${container.id}:`, container);

        const containerWidth = container.width || 1;
        const containerHeight = container.height || 1;
        const containerLength = container.length || 1;
        const geometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerLength);
        const material = new THREE.MeshPhongMaterial({
            color: containerColor,
            wireframe: isWireframe,
            transparent: true,
            opacity: 0.7,
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
            container.positionX || 0,
            containerHeight / 2,
            container.positionZ || 0
        );

        mesh.userData = {
            id: container.id,
            type: 'container',
            name: container.name || `Container ${container.id}`,
            width: containerWidth,
            height: containerHeight,
            length: containerLength,
            level: 0,
        };

        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edges);

        parentGroup.add(mesh);
        console.log(`Container ${container.id} added at position:`, mesh.position);

        const label = createTextSprite(container.name || `Container ${container.id}`);
        label.position.set(
            mesh.position.x,
            mesh.position.y + containerHeight / 2 + 0.5,
            mesh.position.z
        );
        label.userData = { level: 0 };
        parentGroup.add(label);

        return mesh;
    };

    useEffect(() => {
        if (!warehouseData || !mountRef.current) {
            console.error('warehouseData or mountRef is missing');
            return;
        }

        console.log('warehouseData:', warehouseData);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(20, 20, 20);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const gridHelper = new THREE.GridHelper(100, 100);
        gridHelper.visible = showGrid;
        scene.add(gridHelper);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: null,
        };
        controlsRef.current = controls;

        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControlsRef.current = transformControls;
        transformControls.setMode('translate');
        transformControls.enabled = isEditMode;

        transformControls.addEventListener('dragging-changed', (event) => {
            controls.enabled = !event.value;
        });

        const warehouseGroup = new THREE.Group();
        warehouseGroupRef.current = warehouseGroup;
        scene.add(warehouseGroup);

        let rootOffsetX = 0;
        const rootPadding = 6;
        const rootZones = warehouseData.zones.filter(zone => zone.parentId === null);
        console.log('Root zones:', rootZones);
        rootZones.forEach(zone => {
            createZone(zone, warehouseGroup, 0, { x: rootOffsetX, y: 0, z: 0 });
            rootOffsetX += (zone.width || 4) + rootPadding;
        });

        if (warehouseData.containers) {
            console.log('Containers:', warehouseData.containers);
            warehouseData.containers.forEach(container => {
                createContainer(container, warehouseGroup);
            });
        } else {
            console.warn('No containers found in warehouseData');
        }

        const box = new THREE.Box3().setFromObject(warehouseGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim);
        camera.lookAt(center);
        console.log('Camera centered at:', center, 'with offset:', maxDim);

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
                                ? hierarchyColors[child.userData.level % hierarchyColors.length]
                                : restrictedZoneColor
                            : containerColor
                    );
                    child.material.opacity = 0.7;
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
                object.material.opacity = 1.0;
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

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();

            if (showLabels) {
                warehouseGroup.traverse(child => {
                    if (child.isSprite && child.userData.level !== undefined) {
                        const distance = camera.position.distanceTo(child.position);
                        child.visible = distance > 5;
                    }
                });
            } else {
                warehouseGroup.traverse(child => {
                    if (child.isSprite && child.userData.level !== undefined) {
                        child.visible = false;
                    }
                });
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const onKeyDown = (event) => {
            if (!isEditMode) return;
            if (event.key === 'Escape') {
                transformControls.detach();
                controls.enabled = true;
                setSelectedObject(null);
                setIsSettingModalOpen(false);
                resetColors();
            }
        };

        renderer.domElement.addEventListener('dblclick', onDoubleClick);
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', onKeyDown);

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
        };
    }, [warehouseData, isWireframe, onUpdateWarehouse, isEditMode]);

    useEffect(() => {
        if (!warehouseGroupRef.current) return;
        console.log('Updating subzones and labels visibility:', { showSubZones, showLabels });
        warehouseGroupRef.current.traverse(child => {
            if (child.isMesh || child.isLine) {
                if (child.userData.level > 0) {
                    child.visible = showSubZones;
                }
            }
            if (child.isSprite && child.userData.level !== undefined) {
                child.visible = showLabels && showSubZones;
            }
        });
    }, [showSubZones, showLabels]);

    const toggleWireframe = () => {
        setIsWireframe(prev => {
            warehouseGroupRef.current.traverse(child => {
                if (child.isMesh && child.material && !child.material.isSpriteMaterial) {
                    child.material.wireframe = !prev;
                }
            });
            return !prev;
        });
    };

    const toggleEditMode = () => {
        setIsEditMode(prev => {
            const newState = !prev;
            transformControlsRef.current.enabled = newState;
            if (!newState) {
                transformControlsRef.current.detach();
                controlsRef.current.enabled = true;
                setSelectedObject(null);
                setIsSettingModalOpen(false);
            }
            return newState;
        });
    };

    const toggleSubZones = () => {
        setShowSubZones(prev => {
            console.log('Toggling subzones visibility to:', !prev);
            return !prev;
        });
    };

    const handleSaveZone = (updatedZone) => {
        console.log('Saving zone:', updatedZone);
        
        const cameraPosition = cameraRef.current.position.clone();
        const cameraTarget = controlsRef.current.target.clone();

        const updatedZones = warehouseData.zones.map(z =>
            z.id === updatedZone.id ? { ...z, ...updatedZone } : z
        );
        onUpdateWarehouse({ ...warehouseData, zones: updatedZones });
        warehouseGroupRef.current.clear();
        let rootOffsetX = 0;
        const rootPadding = 6;

        const rootZones = updatedZones.filter(zone => zone.parentId === null);
        console.log('Root zones after save:', rootZones);
        rootZones.forEach(zone => {
            createZone(zone, warehouseGroupRef.current, 0, { x: rootOffsetX, y: 0, z: 0 });
            rootOffsetX += (zone.width || 4) + rootPadding;
        });

        if (warehouseData.containers) {
            console.log('Recreating containers:', warehouseData.containers);
            warehouseData.containers.forEach(container => {
                createContainer(container, warehouseGroupRef.current);
            });
        }

        warehouseGroupRef.current.traverse(child => {
            if ((child.isMesh || child.isSprite || child.isLine) && child.userData.level > 0) {
                child.visible = showSubZones;
            }
        });

        cameraRef.current.position.copy(cameraPosition);
        controlsRef.current.target.copy(cameraTarget);
        cameraRef.current.lookAt(controlsRef.current.target);
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
                        onClick={toggleSubZones}
                        className="w-full flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-150 text-xs font-medium"
                    >
                        {showSubZones ? (
                            <>
                                <FaEyeSlash className="w-3 h-3" /> Скрыть подзоны
                            </>
                        ) : (
                            <>
                                <FaEye className="w-3 h-3" /> Показать подзоны
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setShowLabels(prev => !prev)}
                        className="w-full flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-150 text-xs font-medium"
                    >
                        {showLabels ? (
                            <>
                                <FaEyeSlash className="w-3 h-3" /> Скрыть метки
                            </>
                        ) : (
                            <>
                                <FaEye className="w-3 h-3" /> Показать метки
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            const box = new THREE.Box3().setFromObject(warehouseGroupRef.current);
                            const center = box.getCenter(new THREE.Vector3());
                            const size = box.getSize(new THREE.Vector3());
                            const maxDim = Math.max(size.x, size.y, size.z);
                            cameraRef.current.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim);
                            cameraRef.current.lookAt(center);
                            controlsRef.current.target.copy(center);
                            controlsRef.current.update();
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
                        <p className="text-sm">
                            <strong className="font-semibold">Уровень:</strong>{' '}
                            <span className="text-gray-900">{selectedObject.level}</span>
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