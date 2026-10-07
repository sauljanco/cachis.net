export type Category = 'Motos' | 'Vehículos' | 'Lotes' | 'Casas y departamentos' | 'Electrónicos' | 'Otros';
export type Operation = 'Venta' | 'Alquiler' | 'Anticrético';
export type Listing = { id: string; title: string; category: Category; operation: Operation; price: number; zone: string; facts: string[]; image: string; description: string };
export function money(value: number) { return 'Bs ' + new Intl.NumberFormat('es-BO', {maximumFractionDigits:0}).format(value); }
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
