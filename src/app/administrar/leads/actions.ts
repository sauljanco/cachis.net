'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';

const uuid = z.uuid();
const statuses = ['Nuevo', 'Contactado', 'Calificado', 'Visita/demo', 'Negociación', 'Cerrado', 'Perdido'] as const;
const leadSchema = z.object({
  contactName: z.string().trim().min(2).max(80),
  phone: z.union([z.literal(''), z.string().regex(/^591[67][0-9]{7}$/)]),
  interest: z.string().trim().min(5).max(300),
  source: z.enum(['WhatsApp', 'Facebook', 'Presencial', 'Otro']),
  listingId: z.union([z.literal(''), uuid]),
  notes: z.string().trim().max(1000),
});

async function authorizedAdmin() {
  const user = await currentUser();
  return user && isAdmin(user.id) ? user : null;
}

export async function createLead(input: unknown) {
  const user = await authorizedAdmin();
  if (!user) return { error: 'Acción no permitida.' };
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { error: 'Revisa el nombre, interés y teléfono (591 seguido de ocho dígitos).' };
  const d = parsed.data;
  const sql = database();
  const result = await sql`INSERT INTO cachis.leads (listing_id, contact_name, phone, interest, source, notes, created_by)
    SELECT l.id, ${d.contactName}, ${d.phone || null}, ${d.interest}, ${d.source}, ${d.notes}, ${user.id}
    FROM (SELECT ${d.listingId || null}::uuid AS id) l
    WHERE l.id IS NULL OR EXISTS (SELECT 1 FROM cachis.listings WHERE id=l.id)
    RETURNING id`;
  if (!result.length) return { error: 'No encontramos el anuncio seleccionado.' };
  revalidatePath('/administrar/leads');
  return { success: true };
}

export async function updateLead(id: string, input: unknown) {
  const user = await authorizedAdmin();
  if (!user || !uuid.safeParse(id).success) return { error: 'Acción no permitida.' };
  const parsed = z.object({ status: z.enum(statuses), notes: z.string().trim().max(1000) }).safeParse(input);
  if (!parsed.success) return { error: 'Estado o nota no válidos.' };
  const rows = await database()`UPDATE cachis.leads SET status=${parsed.data.status},notes=${parsed.data.notes},updated_at=now()
    WHERE id=${id} RETURNING id`;
  if (!rows.length) return { error: 'La oportunidad ya no existe.' };
  revalidatePath('/administrar/leads');
  return { success: true };
}
