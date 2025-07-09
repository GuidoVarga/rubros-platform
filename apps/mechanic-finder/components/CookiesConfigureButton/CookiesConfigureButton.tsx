'use client';
export function CookiesConfigureButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cookie-consent');
          window.location.reload();
        }
      }}
      className="text-xs text-muted-foreground hover:text-primary underline"
    >
      ⚙️ Configurar cookies
    </button>
  )
}