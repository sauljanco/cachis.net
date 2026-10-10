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

  return <span className={`category-art category-art-${name}`} aria-hidden="true" />;
}
