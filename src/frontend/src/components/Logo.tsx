export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 12 L36 15 L36 42 L20 42 Z" fill="#5c9be6" />
      <path d="M41 16 L57 19 L57 42 L41 42 Z" fill="#5c9be6" />
      <path d="M62 21 L78 24 L78 82 L20 82 L20 48 L57 48 L57 58 L36 62 L36 68 L62 63 Z" fill="#113a7a" />
    </svg>
  );
}
