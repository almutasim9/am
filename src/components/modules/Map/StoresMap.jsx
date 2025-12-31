import React, { useContext, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DataContext } from '../../../contexts/DataContext';
import { Phone, Navigation, MapPin, Database } from 'lucide-react';
import { db } from '../../../services/db';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const StoresMap = () => {
    const { stores, refreshData } = useContext(DataContext);

    // Initial center (Nineveh/Mosul)
    const center = [36.34, 43.13];

    // Filter stores with coordinates (robust check)
    const mapStores = stores.filter(s =>
        s.lat !== undefined && s.lat !== null &&
        s.lng !== undefined && s.lng !== null
    );

    // Debug: Log store data to verify coordinates are present
    console.log('Map: All stores:', stores.map(s => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng })));
    console.log('Map: Stores with coordinates:', mapStores.length);

    useEffect(() => {
        // Fix for map container sizing issue
        window.dispatchEvent(new Event('resize'));
    }, []);

    const handleInjectLocations = async () => {
        const demoCoordinates = {
            '1': { lat: 33.3128, lng: 44.3615 }, // Baghdad
            '2': { lat: 30.5081, lng: 47.7835 }, // Basra
            '3': { lat: 36.1901, lng: 44.0091 }, // Erbil
            '4': { lat: 36.3489, lng: 43.1577 }, // Mosul
            '5': { lat: 32.6160, lng: 44.0249 }, // Karbala
        };

        const updatedStores = stores.map(store => {
            if (demoCoordinates[store.id]) {
                return { ...store, ...demoCoordinates[store.id] };
            }
            return store;
        });

        // Loop update to force persistence (in a real app we'd do a batch update)
        for (const store of updatedStores) {
            if (store.lat) await db.from('stores').update(store.id, { lat: store.lat, lng: store.lng });
        }

        await refreshData();
        window.location.reload(); // Force hard reload to ensure map catches up
    };

    return (
        <div className="h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg relative z-0">
            <MapContainer center={center} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapStores.map(store => (
                    <Marker key={store.id} position={[store.lat, store.lng]}>
                        <Popup>
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                                <p className="text-sm text-slate-500 mb-3">{store.category} • {store.zone}</p>

                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`tel:${store.phone}`}
                                        className="flex items-center justify-center gap-2 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors"
                                    >
                                        <Phone size={16} /> Call
                                    </a>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 p-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <Navigation size={16} /> Go
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Floating Info Card */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="font-bold dark:text-white">Store Map</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{mapStores.length} locations found</p>
                    </div>
                </div>
                {mapStores.length === 0 && (
                    <button
                        onClick={handleInjectLocations}
                        className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        <Database size={14} /> Load Demo Data
                    </button>
                )}
            </div>
        </div>
    );
};

export default StoresMap;
