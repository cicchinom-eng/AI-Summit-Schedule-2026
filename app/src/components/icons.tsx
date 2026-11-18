type P = { size?: number; className?: string };
const base = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });

export const Star = ({ size, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z" />
  </svg>
);
export const Search = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
export const X = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Print = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="9" rx="2" /><path d="M7 14h10v7H7z" /></svg>);
export const Grid = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>);
export const Compass = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>);
export const Book = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" /><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" /></svg>);
export const Info = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
export const Check = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const Sparkle = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></svg>);
export const Laptop = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 19h20" /></svg>);
export const Arrow = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Chevron = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M9 6l6 6-6 6" /></svg>);
export const Users = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.3c2.6 0 4.4 1.4 5 4.2" /></svg>);
export const Calendar = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
export const MapPin = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>);
export const Shield = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 3l7 3v5c0 5.5-3.8 9.7-7 11-3.2-1.3-7-5.5-7-11V6z" /></svg>);
export const Server = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="3" width="18" height="8" rx="2" /><rect x="3" y="13" width="18" height="8" rx="2" /><path d="M7 7h.01M7 17h.01" /></svg>);
export const Trophy = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M6 4h12v6a6 6 0 0 1-12 0z" /><path d="M6 8H4a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3M18 8h2a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3" /><path d="M9 16h6v3H9z" /><path d="M7 19h10" /></svg>);
export const Clock = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>);
