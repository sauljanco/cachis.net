'use client';

import { useEffect, useRef } from 'react';
import type * as Leaflet from 'leaflet';

type Props = {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
};

const TOWN_CENTER: [number, number] = [-16.9123, -62.6121];

export default function PropertyMapPicker({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const selected = latitude !== '' && longitude !== '';

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      const savedLatitude = Number(latitude);
      const savedLongitude = Number(longitude);
      const hasSavedPoint = latitude !== '' && longitude !== '' && Number.isFinite(savedLatitude) && Number.isFinite(savedLongitude);
      const start: [number, number] = hasSavedPoint ? [savedLatitude, savedLongitude] : TOWN_CENTER;
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(start, hasSavedPoint ? 17 : 14);
      mapRef.current = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: 'property-map-marker',
        html: '<span class="property-map-pin" aria-hidden="true"></span>',
        iconSize: [30, 38],
        iconAnchor: [15, 37],
      });

      function selectPoint(position: Leaflet.LatLng) {
        if (markerRef.current) markerRef.current.setLatLng(position);
        else {
          const marker = L.marker(position, { icon, draggable: true }).addTo(map);
          marker.on('dragend', () => selectPoint(marker.getLatLng()));
          markerRef.current = marker;
        }
        onChangeRef.current(position.lat.toFixed(6), position.lng.toFixed(6));
      }

      if (hasSavedPoint) selectPoint(L.latLng(savedLatitude, savedLongitude));
      map.on('click', event => selectPoint(event.latlng));
      requestAnimationFrame(() => map.invalidateSize());
    }

    void initialize();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
    // The map initializes once for each property-form mount; later point changes stay in Leaflet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markCenter() {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    const center = map.getCenter();
    map.fire('click', { latlng: L.latLng(center.lat, center.lng) });
  }

  function removePoint() {
    markerRef.current?.remove();
    markerRef.current = null;
    onChangeRef.current('', '');
  }

  return <div className="wide property-map-picker">
    <div className="map-form-intro"><strong>Ubicación en el mapa <span>(opcional)</span></strong><span>Toca el lugar del inmueble para marcarlo. El punto será público y ayudará a llegar hasta allí.</span></div>
    <div ref={containerRef} className="property-map-canvas" role="application" aria-label="Mapa para marcar la ubicación del inmueble" />
    <div className="property-map-actions">
      <span role="status">{selected ? 'Punto marcado. Puedes arrastrarlo para ajustarlo.' : 'Desliza el mapa y toca para marcar el punto.'}</span>
      <button type="button" onClick={markCenter}>Marcar el centro</button>
      {selected && <button type="button" onClick={removePoint}>Quitar punto</button>}
    </div>
  </div>;
}
