import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { FaCube, FaEye, FaEyeSlash, FaSyncAlt } from 'react-icons/fa';

const Warehouse3DViewer = ({ warehouseData }) => {
    const mountRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [isWireframe, setIsWireframe] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const warehouseGroupRef = useRef(null);
    const connectionsRef = useRef([]);

    const highlightColor = new THREE.Color(0x00ff00);
    const defaultZoneColor = 0x3498db;
    const restrictedZoneColor = 0xe74c3c;
    const containerColor = 0x2ecc71;

    useEffect(() => {
        if (!warehouseData || !mountRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(10, 10, 10);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const gridHelper = new THREE.GridHelper(50, 50);
        gridHelper.visible = showGrid;
        scene.add(gridHelper);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        const warehouseGroup = new THREE.Group();
        warehouseGroupRef.current = warehouseGroup;
        scene.add(warehouseGroup);

        const createZone = (zone, parentGroup, level = 0, offsetX = 0, offsetZ = 0) => {
            const zoneGroup = new THREE.Group();
            zoneGroup.userData = { ...zone, type: 'zone', isExpanded: false, childGroups: [] };

            const zoneGeometry = new THREE.BoxGeometry(zone.width, zone.height, zone.length);
            const zoneMaterial = new THREE.MeshPhongMaterial({
                color: zone.canStoreItems ? defaultZoneColor : restrictedZoneColor,
                transparent: true,
                opacity: 0.7,
                wireframe: isWireframe,
            });

            const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
            zoneMesh.castShadow = true;
            zoneMesh.receiveShadow = true;
            zoneMesh.position.set(0, zone.height / 2, 0);
            zoneMesh.userData = { ...zone, type: 'zone' };
            zoneGroup.add(zoneMesh);

            const labelSprite = createTextSprite(zone.name, 24);
            labelSprite.position.set(0, zone.height + 0.5, 0);
            zoneGroup.add(labelSprite);

            if (level === 0) {
                zoneGroup.position.set(offsetX + zone.width / 2, 0, offsetZ + zone.length / 2);
            } else {
                zoneGroup.position.set(
                    offsetX - parentGroup.userData.width / 2 + zone.width / 2,
                    0,
                    offsetZ - parentGroup.userData.length / 2 + zone.length / 2
                );
                zoneGroup.visible = false;
            }

            parentGroup.add(zoneGroup);

            let childOffsetX = 0;
            let childOffsetZ = 0;
            zone.childZones.forEach((childZone, index) => {
                const childGroup = createZone(childZone, zoneGroup, level + 1, childOffsetX, childOffsetZ);
                zoneGroup.userData.childGroups.push(childGroup);
                childOffsetX += childZone.width + 1;
                if (childOffsetX + childZone.width > zone.width) {
                    childOffsetX = 0;
                    childOffsetZ += childZone.length + 1;
                }
            });

            zone.containers.forEach((container, index) => {
                const containerGeometry = new THREE.BoxGeometry(container.width, container.height, container.length);
                const containerMaterial = new THREE.MeshPhongMaterial({
                    color: containerColor,
                    transparent: true,
                    opacity: 0.9,
                    wireframe: isWireframe,
                });

                const containerMesh = new THREE.Mesh(containerGeometry, containerMaterial);
                containerMesh.castShadow = true;
                containerMesh.receiveShadow = true;
                containerMesh.position.set(
                    -zone.width / 2 + (index % 3) * (container.width + 0.1),
                    container.height / 2,
                    -zone.length / 2 + Math.floor(index / 3) * (container.length + 0.1)
                );
                containerMesh.userData = { ...container, type: 'container' };
                containerMesh.visible = false;
                zoneGroup.add(containerMesh);

                const containerLabel = createTextSprite(container.serialNumber, 14);
                containerLabel.position.copy(containerMesh.position);
                containerLabel.position.y += container.height / 2 + 0.2;
                containerLabel.visible = false;
                zoneGroup.add(containerLabel);

                zoneGroup.userData.childGroups.push(containerMesh);
            });

            return zoneGroup;
        };

        const createTextSprite = (text, fontSize) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            context.fillStyle = '#000000';
            context.font = `Bold ${fontSize}px Arial`;
            context.fillText(text, 10, fontSize + 10);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(fontSize / 24, fontSize / 48, 1);
            return sprite;
        };

        const createConnectionLine = (start, end) => {
            const material = new THREE.LineBasicMaterial({ color: 0x000000 });
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            connectionsRef.current.push(line);
            return line;
        };

        const clearConnectionLines = () => {
            connectionsRef.current.forEach(line => scene.remove(line));
            connectionsRef.current = [];
        };

        let rootOffsetX = 0;
        let rootOffsetZ = 0;
        warehouseData.zones.filter(zone => zone.parentId === null).forEach(zone => {
            createZone(zone, warehouseGroup, 0, rootOffsetX, rootOffsetZ);
            rootOffsetX += zone.width + 2;
            if (rootOffsetX + zone.width > 50) {
                rootOffsetX = 0;
                rootOffsetZ += zone.length + 2;
            }
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event) => {
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
                clearConnectionLines();
                object.material.color.copy(highlightColor);

                // Устанавливаем выбранный объект для отображения информации
                setSelectedObject(targetGroup.userData);

                // Скрываем дочерние элементы всех зон, кроме текущей
                warehouseGroup.traverse(child => {
                    if (child.userData.type === 'zone' && child !== targetGroup) {
                        child.userData.childGroups.forEach(subChild => {
                            subChild.visible = false;
                        });
                        child.userData.isExpanded = false;
                    }
                });

                // Обрабатываем клик на зону или контейнер
                if (targetGroup.userData.type === 'zone') {
                    const isExpanding = !targetGroup.userData.isExpanded;
                    targetGroup.userData = { ...targetGroup.userData, isExpanded: isExpanding };

                    targetGroup.userData.childGroups.forEach((child, index) => {
                        // Показываем подзоны и контейнеры
                        child.visible = isExpanding;
                        if (child.userData.type === 'container') {
                            // Также показываем метку контейнера
                            const label = targetGroup.children.find(c => c.position.equals(child.position) && c.isSprite);
                            if (label) label.visible = isExpanding;
                        }

                        if (isExpanding) {
                            const startPos = new THREE.Vector3().setFromMatrixPosition(targetGroup.matrixWorld);
                            const endPos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
                            startPos.y = targetGroup.userData.height / 2;
                            endPos.y = child.userData.height ? child.userData.height / 2 : child.userData.height / 2;

                            gsap.from(child.position, {
                                x: 0,
                                z: 0,
                                duration: 0.5,
                                ease: 'power2.out',
                                delay: index * 0.1,
                            });

                            createConnectionLine(startPos, endPos);
                        }
                    });
                }
            }
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

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            connectionsRef.current.forEach(line => {
                line.geometry.attributes.position.needsUpdate = true;
            });
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (mountRef.current && renderer) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };

        renderer.domElement.addEventListener('click', onClick);
        window.addEventListener('resize', handleResize);

        return () => {
            renderer.domElement.removeEventListener('click', onClick);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            scene.clear();
            controls.dispose();
            connectionsRef.current = [];
        };
    }, [warehouseData]);

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

    return (
        <div className="relative w-full h-[800px] border border-gray-300 rounded-xl shadow-lg overflow-hidden bg-gray-50">
            <div ref={mountRef} className="w-full h-full" />

            {/* Панель управления */}
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
                                if (gridHelper) {
                                    gridHelper.visible = !prev;
                                }
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
                            if (cameraRef.current && controlsRef.current) {
                                cameraRef.current.position.set(10, 10, 10);
                                controlsRef.current.reset();
                            }
                        }}
                        className="w-full flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-150 text-xs font-medium"
                    >
                        <FaSyncAlt className="w-3 h-3" /> Сброс камеры
                    </button>
                </div>
            </div>

            {/* Панель информации */}
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
                        {selectedObject.type === 'zone' && (
                            <>
                                <p className="text-sm">
                                    <strong className="font-semibold">Может хранить:</strong>{' '}
                                    <span className={selectedObject.canStoreItems ? 'text-green-600' : 'text-red-600'}>
                                        {selectedObject.canStoreItems ? 'Да' : 'Нет'}
                                    </span>
                                </p>
                                <p className="text-sm">
                                    <strong className="font-semibold">Контейнеров:</strong>{' '}
                                    <span className="text-gray-900">{selectedObject.containers.length}</span>
                                </p>
                            </>
                        )}
                        {selectedObject.type === 'container' && selectedObject.contents && (
                            <p className="text-sm">
                                <strong className="font-semibold">Содержимое:</strong>{' '}
                                <span className="text-gray-900">{selectedObject.contents}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Warehouse3DViewer;