const base = "w-5 h-5 stroke-[1.8] stroke-orange-500 fill-white";

export const HomeSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
  </svg>
);

export const ExploreSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <circle cx="11" cy="11" r="6" />
    <line x1="20" y1="20" x2="16.5" y2="16.5" />
  </svg>
);

export const FriendsSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <circle cx="9" cy="8" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M4 18c0-3 3-5 6-5" />
    <path d="M13 18c0-2.5 2.5-4 5-4" />
  </svg>
);

export const BellSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <path d="M6 17h12l-1-2v-5a5 5 0 10-10 0v5l-1 2z" />
    <circle cx="12" cy="20" r="1" />
  </svg>
);

export const MessageSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <rect x="3" y="5" width="18" height="12" rx="4" />
    <path d="M7 17l-2 4 5-3" />
  </svg>
);

export const BookmarkSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

export const ProfileSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <circle cx="12" cy="8" r="3" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export const SettingSymbol = () => (
  <svg viewBox="0 0 24 24" className={base}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12l2-1-2-3-2 1a6 6 0 00-1-1l1-2-3-2-1 2a6 6 0 00-2 0l-1-2-3 2 1 2a6 6 0 00-1 1l-2-1-2 3 2 1a6 6 0 000 2l-2 1 2 3 2-1a6 6 0 001 1l-1 2 3 2 1-2a6 6 0 002 0l1 2 3-2-1-2a6 6 0 001-1l2 1 2-3-2-1a6 6 0 000-2z" />
  </svg>
);