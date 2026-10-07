import { z } from 'zod';
export const listingSchema = z.object({
  title: z.string().trim().min(8).max(100),
  category: z.enum(['Motos','Vehículos','Lotes','Casas y departamentos','Electrónicos','Otros']),
  operation: z.enum(['Venta','Alquiler','Anticrético']),
  price: z.coerce.number().finite().positive().max(999999999),
  currency: z.enum(['BOB','USD']).default('BOB'),
  zone: z.string().trim().min(2).max(100),
  description: z.string().trim().min(20).max(3000),
  contactName: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().transform(s => s.replace(/[+\s()-]/g,'')).transform(s => s.length === 8 ? '591'+s : s).pipe(z.string().regex(/^591[67]\d{7}$/)),
  latitude: z.union([z.literal(''), z.coerce.number().finite().min(-90).max(90)]).optional(),
  longitude: z.union([z.literal(''), z.coerce.number().finite().min(-180).max(180)]).optional(),
}).refine(x => x.operation === 'Venta' || x.category === 'Casas y departamentos', { message:'Operación no disponible para esta categoría.' })
  .refine(x => (typeof x.latitude === 'number') === (typeof x.longitude === 'number'), { message:'Indica latitud y longitud juntas.' })
  .refine(x => typeof x.latitude !== 'number' || x.category === 'Lotes' || x.category === 'Casas y departamentos', { message:'El mapa solo está disponible para inmuebles.' });
