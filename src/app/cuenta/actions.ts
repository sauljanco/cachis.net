'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { currentUser } from '@/lib/auth/server';
import { database } from '@/lib/db';

const profileSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().max(60),
  phone: z.string().trim().max(24),
  address: z.string().trim().max(160),
}).strict();

export async function savePrivateProfile(input: unknown) {
  const user = await currentUser();
  if (!user) return { error: 'Inicia sesión para editar tu perfil.' };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: 'Revisa tu nombre y los límites de cada campo.' };
  const { firstName, lastName, phone, address } = parsed.data;
  const compactPhone = phone.replace(/[\s().-]/g, '');
  if (compactPhone && !/^(?:\+?591)?[23467]\d{7}$/.test(compactPhone)) {
    return { error: 'Escribe un teléfono boliviano de 8 dígitos, con o sin +591.' };
  }
  await database()`
    INSERT INTO cachis.user_profiles (user_id, first_name, last_name, phone, address)
    VALUES (${user.id}, ${firstName}, ${lastName}, ${phone}, ${address})
    ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      updated_at = now()`;
  revalidatePath('/cuenta');
  return { success: true, name: [firstName, lastName].filter(Boolean).join(' ') };
}
