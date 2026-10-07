export type Category = 'Motos' | 'Vehículos' | 'Lotes' | 'Casas y departamentos' | 'Electrónicos' | 'Otros';
export type Operation = 'Venta' | 'Alquiler' | 'Anticrético';
export type Currency = 'BOB' | 'USD';
export type Listing = { id: string; title: string; category: Category; operation: Operation; price: number; currency: Currency; zone: string; facts: string[]; image: string; description: string };
export function money(value: number, currency: Currency = 'BOB') {
  const symbol = currency === 'USD' ? 'US$ ' : 'Bs ';
  return symbol + new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(value);
}
export function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
