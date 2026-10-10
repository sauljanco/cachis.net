'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/icon';

export default function ViewCounter({ kind, id, initialCount, className = '', hidden = false }: {
  kind: 'site' | 'listing';
  id?: string;
  initialCount: number;
  className?: string;
  hidden?: boolean;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let active = true;
    setCount(initialCount);
    const record = (body: { kind: 'site' | 'listing'; id?: string }) =>
      fetch('/api/views', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', cache: 'no-store', body: JSON.stringify(body),
      });
    void (async () => {
      // Establish the same visitor cookie before counting the announcement.
      if (kind === 'listing') await record({ kind: 'site' }).catch(() => {});
      const response = await record({ kind, id });
      if (!response.ok) return;
      const result = await response.json() as { views?: number };
      if (active && typeof result.views === 'number') setCount(result.views);
    })().catch(() => {});
    return () => { active = false; };
  }, [kind, id, initialCount]);

  if (hidden) return null;
  return <span className={`view-counter ${className}`} title="Se cuenta una visita por navegador al día">
    <Icon name="eye" /> <span>{new Intl.NumberFormat('es-BO').format(count)} {count === 1 ? 'visualización' : 'visualizaciones'}{kind === 'site' && ' del sitio'}</span>
  </span>;
}
