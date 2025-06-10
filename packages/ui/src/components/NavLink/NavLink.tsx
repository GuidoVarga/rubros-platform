import { NavLinkProps } from './types'

export const NavLink = ({ href, children, LinkComponent }: NavLinkProps) => {
  if (LinkComponent) {
    return <LinkComponent href={href}>{children}</LinkComponent>
  }

  return <a href={href}>{children}</a> // Fallback a <a> en caso de que no se pase LinkComponent
}