'use client';

type CookiesConfigureButtonProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

export function CookiesConfigureButton({
  className = "text-xs text-muted-foreground hover:text-primary underline",
  children = "⚙️ Configurar cookies",
  onClick
}: CookiesConfigureButtonProps) {
  const handleClick = onClick || (() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cookie-consent');
      window.location.reload();
    }
  });

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}