import { z } from 'zod';
export const listingSchema = z.object({
  title: z.string().trim().min(8).max(100),
  category: z.enum(['Motos','Vehículos','Lotes','Casas y departamentos']),
  operation: z.enum(['Venta','Alquiler','Anticrético']),
  price: z.coerce.number().finite().positive().max(999999999),
  zone: z.string().trim().min(2).max(100),
  description: z.string().trim().min(20).max(3000),
  contactName: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().transform(s => s.replace(/[+\s()-]/g,'')).transform(s => s.length === 8 ? '591'+s : s).pipe(z.string().regex(/^591[67]\d{7}$/)),
}).refine(x => x.operation === 'Venta' || x.category === 'Casas y departamentos', { message:'Operación no disponible para esta categoría.' });
