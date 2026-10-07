'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function ListingGallery({ photos, title }: { photos: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const active = photos[selected] ?? photos[0];
  return <div className="listing-gallery">
    <div className="detail-photo">{active ? <Image src={active} alt={`Foto ${selected + 1} de ${title}`} fill unoptimized sizes="(max-width: 800px) 100vw, 65vw" priority /> : <span className="gallery-empty">Fotografías próximamente</span>}</div>
    {photos.length > 1 && <div className="gallery-thumbnails" aria-label="Fotografías del anuncio">{photos.map((photo, index) => <button type="button" key={photo} onClick={() => setSelected(index)} aria-label={`Ver foto ${index + 1} de ${photos.length}`} aria-pressed={selected === index} className={selected === index ? 'selected' : ''}><Image src={photo} alt="" fill unoptimized sizes="110px" /></button>)}</div>}
  </div>;
}
