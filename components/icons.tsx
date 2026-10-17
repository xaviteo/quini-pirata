export function Seal({ className = "seal" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.4 19.6c-1.7.2-3.2 1.5-3.3 3.2-.1 1.5 1 2.8 2.4 2.9 1.1.1 2.1-.5 2.6-1.4l3.4-6.1-5.1 1.4zm19.2 0 5.1 1.4-3.4 6.1c-.5.9-1.5 1.5-2.6 1.4-1.4-.1-2.5-1.4-2.4-2.9.1-1.7 1.6-3 3.3-3.2zM6.4 14.2c-1.7-.2-3.2-1.5-3.3-3.2-.1-1.5 1-2.8 2.4-2.9 1.1-.1 2.1.5 2.6 1.4l3.4 6.1-5.1-1.4zm19.2 0-5.1-1.4 3.4-6.1c.5-.9 1.5-1.5 2.6-1.4 1.4.1 2.5 1.4 2.4 2.9-.1 1.7-1.6 3-3.3 3.2z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 2.8c-4.2 0-7.4 3.1-7.4 7.2 0 2.4 1.1 4.2 2 5.5.4.6.6 1.3.4 2l-.7 2.1h11.4l-.7-2.1c-.2-.7 0-1.4.4-2 .9-1.3 2-3.1 2-5.5 0-4.1-3.2-7.2-7.4-7.2zm-2.3 6.4a1.55 1.55 0 1 1 0 3.1 1.55 1.55 0 0 1 0-3.1zm4.6 0a1.55 1.55 0 1 1 0 3.1 1.55 1.55 0 0 1 0-3.1zM16 13.4c.7 0 1.15.45.9 1.05-.18.4-.52.65-.9.65s-.72-.25-.9-.65c-.25-.6.2-1.05.9-1.05z"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg className="user-mark" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.1" />
      <path d="M5.6 19.2c1.2-3 3.4-4.5 6.4-4.5s5.2 1.5 6.4 4.5" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.6 14.8A6.2 6.2 0 0 1 8.8 4.2 6.4 6.4 0 1 0 15.6 14.8z" />
    </svg>
  );
}
