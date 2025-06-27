import { cn } from "../../lib/utils";
import { Fragment } from "react/jsx-runtime";
import { ChevronLeft } from "lucide-react";

export type BreadcrumbProps = {
  elements: {
    id: string;
    content: React.ReactNode | string;
    href?: string;
    className?: string;
  }[];
  textClassName?: string;
  renderLink?: (props: { href: string; children: React.ReactNode; className?: string }) => React.ReactNode;
};

export const Breadcrumb = ({
  elements,
  textClassName,
  renderLink = ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
}: BreadcrumbProps) => {
  // Only show back if we have more than one element and the previous has an href
  const previousElement = elements.length > 2 ? elements[elements.length - 2] : null;

  return (
    <nav className="mb-8 text-muted-foreground" aria-label="breadcrumb">
      {/* Mobile Back Button */}
      {previousElement?.href && (
        renderLink({
          href: previousElement.href,
          className: "md:hidden flex items-center hover:text-foreground transition-colors",
          children: (
            <>
              <ChevronLeft className="h-6 w-6 mr-1 text-primary" />
              <span className="text-primary text-lg">
                Volver
              </span>
            </>
          )
        })
      )}

      {/* Desktop Breadcrumb */}
      <ol className="hidden md:flex items-center justify-center space-x-2">
        {elements.map((element, index) => (
          <Fragment key={`${element.id}-fragment`}>
            <li className={cn('text-base', textClassName)} key={element.id}>
              {element.href ? (
                renderLink({
                  href: element.href,
                  className: "hover:text-foreground transition-colors",
                  children: element.content
                })
              ) : (
                element.content
              )}
            </li>
            {index < elements.length - 1 && <li className={cn('text-base', textClassName)} key={`${index}-separator`}>{'>'}</li>}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}