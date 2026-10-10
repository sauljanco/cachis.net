type CategoryIconName = 'grid' | 'bike' | 'car' | 'land' | 'home' | 'electronics' | 'other' | 'field' | 'tractor';

export default function CategoryIcon({ name }: { name: CategoryIconName }) {
  if (name === 'grid') {
    return <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none">
      <rect x="5" y="5" width="9" height="9" rx="2.5" fill="currentColor" />
      <rect x="18" y="5" width="9" height="9" rx="2.5" fill="currentColor" opacity=".65" />
      <rect x="5" y="18" width="9" height="9" rx="2.5" fill="currentColor" opacity=".65" />
      <rect x="18" y="18" width="9" height="9" rx="2.5" fill="currentColor" />
    </svg>;
  }

  if (name === 'field') return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none">
    <path d="M5 30 25 10l18 20v11H5V30Z" fill="#dcecc0" stroke="#276349" strokeWidth="2" />
    <path d="M5 39c8-6 17-9 28-9M15 41c8-5 17-7 28-7M28 41c4-2 9-3 15-3" stroke="#276349" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 11v14M20 18l6 4 6-4" stroke="#276349" strokeWidth="2" strokeLinecap="round" />
  </svg>;
  if (name === 'tractor') return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none">
    <path d="M17 18h13l4 10H13l4-10ZM19 18V9h10v9M7 27h8M29 25h9l4 4v5h-4" fill="#cfe5ad" stroke="#245a42" strokeWidth="2.4" strokeLinejoin="round" />
    <circle cx="16" cy="34" r="7" fill="#245a42" /><circle cx="16" cy="34" r="3" fill="#e5f4d0" />
    <circle cx="37" cy="35" r="4" fill="#245a42" /><circle cx="37" cy="35" r="1.5" fill="#e5f4d0" />
    <path d="M31 18h5M7 23h5v5" stroke="#245a42" strokeWidth="2.4" strokeLinecap="round" />
  </svg>;
  return <span className={`category-art category-art-${name}`} aria-hidden="true" />;
}
