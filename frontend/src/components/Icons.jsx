// Small dependency-free icon set (24x24 stroke icons)
const make = (paths) =>
  function Icon({ className = "h-5 w-5", ...props }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    );
  };

export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);
export const CartIcon = make(
  <>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
    <circle cx="10" cy="20.5" r="1" />
    <circle cx="17" cy="20.5" r="1" />
  </>
);
export const MenuIcon = make(<path d="M4 7h16M4 12h16M4 17h16" />);
export const CloseIcon = make(<path d="m6 6 12 12M18 6 6 18" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const MinusIcon = make(<path d="M5 12h14" />);
export const TrashIcon = make(
  <>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="m6 7 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </>
);
export const ChevronLeftIcon = make(<path d="m15 6-6 6 6 6" />);
export const ChevronRightIcon = make(<path d="m9 6 6 6-6 6" />);
export const ArrowRightIcon = make(<path d="M5 12h14m-6-6 6 6-6 6" />);
export const CheckIcon = make(<path d="m5 12 5 5 9-10" />);
export const FilterIcon = make(<path d="M4 5h16l-6 7v6l-4 2v-8z" />);
export const TruckIcon = make(
  <>
    <path d="M3 6h11v10H3z" />
    <path d="M14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </>
);
export const ShieldIcon = make(
  <>
    <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);
export const RefreshIcon = make(
  <>
    <path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4" />
  </>
);
export const HeadsetIcon = make(
  <>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
  </>
);
export const PackageIcon = make(
  <>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </>
);
export const TagIcon = make(
  <>
    <path d="M3 12V4h8l10 10-8 8z" />
    <circle cx="7.5" cy="8.5" r="1.2" />
  </>
);

export function HeartIcon({ filled = false, className = "h-5 w-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.6 4.5 6.8 4.5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.2 0 5 3.1 3.8 6.3C19 15.6 12 20 12 20z" />
    </svg>
  );
}

export function StarIcon({ className = "h-4 w-4 shrink-0" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}
