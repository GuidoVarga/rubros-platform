type HeaderProps = {
  appName: string;
  renderLink?: (props: { href: string; children: React.ReactNode; className?: string }) => React.ReactNode;
}

export function Header({
  appName,
  renderLink = ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-4 flex">
          {renderLink({ href: '/', children: <span className="text-xl font-bold">{appName}</span>, className: 'mr-6 flex items-center space-x-2 min-h-[44px]' })}
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center gap-4">
            {renderLink({ href: '/acerca', children: 'Acerca de', className: 'inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-6 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors' })}
            {renderLink({ href: '/contacto', children: 'Contacto', className: 'inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-6 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors' })}
          </nav>
        </div>
      </div>
    </header>
  );
}