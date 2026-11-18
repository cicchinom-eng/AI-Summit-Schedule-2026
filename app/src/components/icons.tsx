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
export const Home = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>);
export const Grid = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>);
export const Compass = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>);
export const Door = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 21V5a2 2 0 0 1 2-2h8v18" /><path d="M14 7h4a2 2 0 0 1 2 2v12M4 21h16" /><circle cx="11" cy="12" r="0.8" fill="currentColor" /></svg>);
export const Book = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" /><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" /></svg>);
export const Info = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
export const Check = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const Sparkle = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></svg>);
export const Laptop = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M2 19h20" /></svg>);
export const Arrow = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Refresh = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></svg>);
export const Chevron = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M9 6l6 6-6 6" /></svg>);
export const Utensils = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10" /><path d="M17 3c-2 1.5-3 4-3 7v2h3v9" /></svg>);
export const Truck = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg>);
export const Pin = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>);
export const IdCard = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="8.5" cy="12" r="2" /><path d="M13.5 10h4M13.5 13.5h4M6 16.5c.6-1.2 1.6-1.8 2.5-1.8s1.9.6 2.5 1.8" /></svg>);
export const Car = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M5 13l1.5-5a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 13" /><rect x="3" y="13" width="18" height="5" rx="1.5" /><path d="M6 18v2M18 18v2" /><circle cx="7.5" cy="15.5" r="0.9" fill="currentColor" /><circle cx="16.5" cy="15.5" r="0.9" fill="currentColor" /></svg>);
export const Entrance = ({ size, className }: P) => (<svg {...base(size)} className={className}><path d="M4 21V5a2 2 0 0 1 2-2h8v18" /><path d="M14 7h4a2 2 0 0 1 2 2v12M4 21h16M10 12h.01" /></svg>);
export const Users = ({ size, className }: P) => (<svg {...base(size)} className={className}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.3c2.6 0 4.4 1.4 5 4.2" /></svg>);
export const Gamepad = ({ size, className }: P) => (<svg {...base(size)} className={className}><rect x="2.5" y="7" width="19" height="10" rx="5" /><path d="M8 10v4M6 12h4M15.5 11h.01M17.5 13h.01" /></svg>);
