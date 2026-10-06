'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { resolveReport } from '@/app/actions';

export default function ReportActions({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function decide(decision: 'dismissed' | 'paused') {
    startTransition(async () => {
      try {
        const result = await resolveReport(id, decision);
        if (result.error) setMessage(result.error);
        else router.refresh();
      } catch {
        setMessage('No pudimos revisar este reporte. Intenta de nuevo.');
      }
    });
  }

  return <div className="moderation-actions">
    <button type="button" className="text-button" disabled={pending} onClick={() => decide('dismissed')}>Descartar reporte</button>
    {published && <button type="button" className="button" disabled={pending} onClick={() => decide('paused')}>Pausar anuncio</button>}
    <p role="status">{message}</p>
  </div>;
}
