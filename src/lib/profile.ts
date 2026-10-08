import 'server-only';
import { database } from '@/lib/db';

export type PrivateProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
};

export async function privateProfile(userId: string): Promise<PrivateProfile | null> {
  const rows = await database()`
    SELECT first_name, last_name, phone, address
    FROM cachis.user_profiles WHERE user_id = ${userId}
    LIMIT 1`;
  if (!rows[0]) return null;
  return {
    firstName: String(rows[0].first_name),
    lastName: String(rows[0].last_name),
    phone: String(rows[0].phone),
    address: String(rows[0].address),
  };
}
