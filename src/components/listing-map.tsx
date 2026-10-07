import Icon from '@/components/icon';

export default function ListingMap({ latitude, longitude, title }: { latitude: number | null; longitude: number | null; title: string }) {
  if (latitude === null || longitude === null) {
    return <div className="listing-map-empty"><span className="listing-map-empty-icon"><Icon name="pin" /></span><strong>Ubicación en el mapa pendiente</strong><span>El anunciante todavía no indicó el punto exacto.</span></div>;
  }
  const bbox = [longitude - 0.003, latitude - 0.002, longitude + 0.003, latitude + 0.002].join(',');
  const embed = `https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({ bbox, layer: 'mapnik', marker: `${latitude},${longitude}` })}`;
  const directions = `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: `${latitude},${longitude}` })}`;
  return <div className="listing-map"><div className="listing-map-heading"><strong>Ubicación del anuncio</strong><span>Punto indicado por el anunciante</span></div><iframe title={`Mapa de ${title}`} src={embed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><a href={directions} target="_blank" rel="noopener noreferrer" className="listing-directions"><Icon name="pin" /> Cómo llegar con Google Maps ↗</a></div>;
}
