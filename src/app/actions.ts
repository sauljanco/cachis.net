'use server';
import { revalidatePath } from 'next/cache';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';
import { listingSchema } from '@/lib/validation';
import { z } from 'zod';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reportReasonSchema = z.string().trim().min(10).max(500);

export async function submitListing(input: unknown) {
  const user = await currentUser();
  if (!user) return { error: 'Inicia sesión para publicar.' };
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) return { error: 'Revisa el título, precio, descripción y número de WhatsApp.' };
  const d = parsed.data;
  const sql = database();
  // El bloqueo por propietario serializa los envíos simultáneos y la cuota.
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`,
    sql`INSERT INTO cachis.listings(owner_id,title,category,operation,price,zone,description,contact_name,whatsapp,latitude,longitude)
        SELECT ${user.id},${d.title},${d.category},${d.operation},${d.price},${d.zone},${d.description},${d.contactName},${d.whatsapp},${typeof d.latitude === 'number' ? d.latitude : null},${typeof d.longitude === 'number' ? d.longitude : null}
        WHERE (SELECT count(*) FROM cachis.listings WHERE owner_id=${user.id} AND created_at>now()-interval '1 day')<10 RETURNING id`
  ]);
  if (!results[1][0]) return { error: 'Alcanzaste el límite de 10 publicaciones diarias. Intenta mañana.' };
  revalidatePath('/mis-anuncios');
  return { id: String(results[1][0].id) };
}

export async function updateListing(id: string, input: unknown) {
  const user = await currentUser();
  if (!user || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { error: 'Acción no permitida.' };
  }
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) return { error: 'Revisa el título, precio, descripción y número de WhatsApp.' };
  const d = parsed.data;
  const rows = await database()`UPDATE cachis.listings SET
    title=${d.title},category=${d.category},operation=${d.operation},price=${d.price},
    zone=${d.zone},description=${d.description},contact_name=${d.contactName},
    whatsapp=${d.whatsapp},latitude=${typeof d.latitude === 'number' ? d.latitude : null},longitude=${typeof d.longitude === 'number' ? d.longitude : null},status='pending',updated_at=now()
    WHERE id=${id} AND owner_id=${user.id} AND status IN ('pending','published','paused','rejected')
    RETURNING id`;
  if (!rows.length) return { error: 'Este anuncio no se puede editar o ya no está disponible.' };
  revalidatePath('/'); revalidatePath('/mis-anuncios'); revalidatePath('/administrar'); revalidatePath('/anuncios/'+id);
  return { success: true };
}

export async function changeListingStatus(id: string, status: string) {
  const user = await currentUser();
  if (!user || !['paused','closed','pending'].includes(status) || !/^[0-9a-f-]{36}$/i.test(id)) return { error:'Acción no permitida.' };
  const rows = await database()`UPDATE cachis.listings SET status=${status},updated_at=now() WHERE id=${id} AND owner_id=${user.id} RETURNING id`;
  if (!rows.length) return { error:'No encontramos un anuncio tuyo con ese identificador.' };
  revalidatePath('/'); revalidatePath('/mis-anuncios'); revalidatePath('/anuncios/'+id);
  return { success:true };
}

export async function moderate(id: string, decision: string) {
  const user = await currentUser();
  if (!user || !isAdmin(user.id) || !['published','rejected'].includes(decision) || !/^[0-9a-f-]{36}$/i.test(id)) return { error:'Acción no permitida.' };
  const sql=database();
  await sql`WITH changed AS (UPDATE cachis.listings SET status=${decision},updated_at=now() WHERE id=${id} AND status='pending' RETURNING id)
    INSERT INTO cachis.moderation_log(listing_id,moderator_id,decision) SELECT id,${user.id},${decision} FROM changed`;
  revalidatePath('/'); revalidatePath('/administrar'); revalidatePath('/anuncios/'+id);
  return { success:true };
}

export async function reportListing(id: string, reason: unknown) {
  const user = await currentUser();
  if (!user) return { error: 'Inicia sesión para reportar un anuncio.' };
  if (!uuidPattern.test(id)) return { error: 'Anuncio no válido.' };
  const parsed = reportReasonSchema.safeParse(reason);
  if (!parsed.success) return { error: 'Explica el motivo en 10 a 500 caracteres.' };

  const sql = database();
  const results = await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtext(${'report:'+user.id}))`,
    sql`INSERT INTO cachis.reports(listing_id,reporter_id,reason)
      SELECT l.id,${user.id},${parsed.data} FROM cachis.listings l
      WHERE l.id=${id} AND l.status='published' AND l.owner_id<>${user.id}
      AND (SELECT count(*) FROM cachis.reports r WHERE r.reporter_id=${user.id}
        AND r.created_at>now()-interval '1 day')<5
      ON CONFLICT (listing_id,reporter_id) DO NOTHING RETURNING id`,
  ]);
  if (!results[1][0]) return { error: 'No se pudo registrar. Quizá ya reportaste este anuncio o alcanzaste el límite diario.' };
  revalidatePath('/administrar');
  return { success: true };
}

export async function resolveReport(id: string, decision: 'dismissed' | 'paused') {
  const user = await currentUser();
  if (!user || !isAdmin(user.id) || !uuidPattern.test(id) || !['dismissed','paused'].includes(decision)) {
    return { error: 'Acción no permitida.' };
  }
  const sql = database();
  const rows = decision === 'dismissed'
    ? await sql`UPDATE cachis.reports SET resolved_at=now(),resolved_by=${user.id},resolution='dismissed'
        WHERE id=${id} AND resolved_at IS NULL RETURNING listing_id`
    : await sql`WITH target AS (
        SELECT listing_id FROM cachis.reports WHERE id=${id} AND resolved_at IS NULL
      ), changed AS (
        UPDATE cachis.listings SET status='paused',updated_at=now()
        WHERE id IN (SELECT listing_id FROM target) AND status='published' RETURNING id
      )
      UPDATE cachis.reports SET resolved_at=now(),resolved_by=${user.id},resolution='paused'
      WHERE listing_id IN (SELECT id FROM changed) AND resolved_at IS NULL RETURNING listing_id`;
  if (!rows.length) return { error: 'El reporte ya se revisó o el anuncio no está publicado.' };
  const listingId = String(rows[0].listing_id);
  revalidatePath('/administrar'); revalidatePath('/'); revalidatePath('/anuncios/'+listingId);
  return { success: true };
}
