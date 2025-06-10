export type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  LinkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
  }>;
};
