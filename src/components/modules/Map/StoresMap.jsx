import React, { useContext, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DataContext } from '../../../contexts/DataContext';
import { MapPin, RefreshCw } from 'lucide-react';
import { db } from '../../../services/db';

// Set Mapbox Access Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Enable RTL text plugin for Arabic support
mapboxgl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
    null,
    true // Lazy load
);

const StoresMap = () => {
    const { stores, refreshData } = useContext(DataContext);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initial center (Nineveh/Mosul)
    const center = [43.13, 36.34]; // Mapbox uses [lng, lat]

    // Filter stores with coordinates
    const mapStores = stores.filter(s =>
        s.lat !== undefined && s.lat !== null &&
        s.lng !== undefined && s.lng !== null
    );

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapRef.current) return; // Initialize only once

        try {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: center,
                zoom: 11,
                pitch: 0,
                bearing: 0,
                antialias: true,
                locale: {
                    'NavigationControl.ZoomIn': 'تكبير',
                    'NavigationControl.ZoomOut': 'تصغير',
                    'NavigationControl.ResetBearing': 'إعادة التعيين'
                }
            });

            // Add navigation controls
            mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

            // Wait for map to load before adding markers
            mapRef.current.on('load', () => {
                setMapLoaded(true);
                mapRef.current.resize();
            });

            // Handle resize for dynamic containers
            const resizeObserver = new ResizeObserver(() => {
                if (mapRef.current) {
                    mapRef.current.resize();
                }
            });
            resizeObserver.observe(mapContainerRef.current);

            return () => {
                resizeObserver.disconnect();
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }
            };
        } catch (error) {
            console.error('Mapbox initialization error:', error);
        }
    }, []);

    // Update markers when stores data changes or map loads
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        mapStores.forEach(store => {
            // Create a custom marker element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.innerHTML = `
                <div style="width: 32px; height: 32px; background: #2563eb; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; transition: transform 0.2s;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
            `;

            // Create Popup Content
            const popupContent = document.createElement('div');
            popupContent.style.cssText = 'padding: 12px; min-width: 200px; font-family: system-ui, sans-serif;';
            popupContent.innerHTML = `
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: #1e293b;">${store.name}</h3>
                <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${store.category || ''} • ${store.zone || ''}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <a href="tel:${store.phone}" style="display: flex; align-items: center; justify-content: center; padding: 8px; background: #d1fae5; color: #059669; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;">
                        📞 اتصال
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}" target="_blank" style="display: flex; align-items: center; justify-content: center; padding: 8px; background: #dbeafe; color: #2563eb; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;">
                        🧭 اذهب
                    </a>
                </div>
            `;

            const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
                .setDOMContent(popupContent);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([store.lng, store.lat])
                .setPopup(popup)
                .addTo(mapRef.current);

            markersRef.current.push(marker);
        });

        // Fit map to markers if there are any
        if (mapStores.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            mapStores.forEach(store => bounds.extend([store.lng, store.lat]));
            mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
        }
    }, [stores, mapLoaded]);

    const handleRefreshMap = () => {
        if (mapRef.current) {
            mapRef.current.resize();
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg relative">
            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            />

            {/* Floating Info Card */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/20 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="font-bold dark:text-white">خريطة المتاجر</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{mapStores.length} موقع نشط</p>
                    </div>
                </div>
                <button
                    onClick={handleRefreshMap}
                    className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw size={14} /> تحديث الخريطة
                </button>
            </div>

            <style>{`
                .mapboxgl-popup-content {
                    border-radius: 16px;
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                }
                .mapboxgl-popup-close-button {
                    padding: 8px;
                    color: #64748b;
                    font-size: 16px;
                }
                .mapboxgl-canvas {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default StoresMap;
