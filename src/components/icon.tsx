import type { SVGProps } from 'react';

type IconName = 'arrow' | 'search' | 'pin' | 'heart' | 'grid' | 'bike' | 'car' | 'land' | 'home' | 'user' | 'plus' | 'sliders' | 'check';

export default function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 19 19 5M7 5h12v12" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></>,
    heart: <path d="M20.4 8.5c0 4.6-8.4 10.6-8.4 10.6S3.6 13.1 3.6 8.5a4.5 4.5 0 0 1 8.4-2.2 4.5 4.5 0 0 1 8.4 2.2Z" />,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    bike: <><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M5.5 17 10 9h4l4.5 8M10 9l3 8h5.5M8 9h2M14 7h3" /></>,
    car: <><path d="m4 15 2-6a2 2 0 0 1 2-1.4h8a2 2 0 0 1 2 1.4l2 6v4H4v-4ZM4 14h16M7.5 17h.01M16.5 17h.01M5 19v2M19 19v2" /></>,
    land: <><path d="m3 8 8-4 10 4v11l-10-4-8 4V8ZM11 4v11M3 8l8 3 10-3" /></>,
    home: <><path d="m3 11 9-7 9 7v9H3v-9ZM9 20v-6h6v6" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /><circle cx="16" cy="17" r="2" fill="currentColor" stroke="none" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...common} {...props}>{shapes[name]}</svg>;
}
