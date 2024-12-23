import { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from 'react-yandex-maps';

const WarehouseDetailPanel = ({ warehouse, isOpen, onClose }) => {
    const [mapState, setMapState] = useState({
        center: [43.238949, 76.889709], // Дефолтные координаты (Алматы)
        zoom: 15
    });
    const [ymaps, setYmaps] = useState(null);
    const [loading, setLoading] = useState(true);

    // Функция геокодинга адреса
    const geocodeAddress = async (address) => {
        if (!ymaps || !address) return;

        try {
            const result = await ymaps.geocode(address);
            const firstGeoObject = result.geoObjects.get(0);

            if (firstGeoObject) {
                const coords = firstGeoObject.geometry.getCoordinates();
                setMapState({
                    center: coords,
                    zoom: 15
                });
                setLoading(false);
            }
        } catch (error) {
            console.error('Ошибка геокодинга:', error);
            setLoading(false);
        }
    };

    // Эффект для геокодинга при изменении адреса или загрузке ymaps
    useEffect(() => {
        if (ymaps && warehouse?.location) {
            geocodeAddress(warehouse.location);
        }
    }, [ymaps, warehouse?.location]);

    return (
        <>
            {/* Оверлей */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Панель */}
            <div
                className={`fixed inset-y-0 right-0 w-[700px] bg-white shadow-xl transform transition-all duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col">
                    {/* Шапка */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-2xl font-bold">{warehouse?.name}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 text-2xl transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Контент */}
                    <div className={`flex-1 overflow-y-auto p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Индикатор заполненности */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Заполненность</span>
                                <span className="font-bold">{warehouse?.usagePercent || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${warehouse?.usagePercent || 0}%`,
                                        backgroundColor:
                                            (warehouse?.usagePercent || 0) < 50
                                                ? "green"
                                                : (warehouse?.usagePercent || 0) < 80
                                                    ? "orange"
                                                    : "red",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Детали */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Информация о складе</h3>
                                <div className="space-y-2 text-gray-600">
                                    <p>Локация: {warehouse?.location || "Не указано"}</p>
                                    <p>Зон на складе: {warehouse?.zonesCount || 0}</p>
                                    <p>Дата создания: {warehouse?.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "Не указано"}</p>
                                    <p>Последнее обновление: {warehouse?.updatedAt ? new Date(warehouse.updatedAt).toLocaleDateString() : "Не указано"}</p>
                                </div>
                            </div>

                            {/* Карта */}
                            <div>
                                <h3 className="font-semibold mb-2">Расположение</h3>
                                <div className="h-96 rounded-lg overflow-hidden">
                                    <YMaps query={{ apikey: 'ваш-api-ключ' }}>
                                        <Map
                                            defaultState={mapState}
                                            state={mapState}
                                            width="100%"
                                            height="100%"
                                            className="w-full h-full"
                                            onLoad={ymaps => setYmaps(ymaps)}
                                            modules={['geocode']}
                                        >
                                            {!loading && (
                                                <Placemark
                                                    geometry={mapState.center}
                                                    properties={{
                                                        balloonContentHeader: warehouse?.name,
                                                        balloonContentBody: warehouse?.location,
                                                        balloonContentFooter: `Заполненность: ${warehouse?.usagePercent}%`
                                                    }}
                                                    options={{
                                                        preset: 'islands#blueWarehouseIcon',
                                                    }}
                                                />
                                            )}
                                        </Map>
                                    </YMaps>
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                            <p className="text-gray-600">Загрузка карты...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className={`p-6 border-t space-x-4 flex transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <button className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                            Список товаров
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                            Настройка
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WarehouseDetailPanel;
