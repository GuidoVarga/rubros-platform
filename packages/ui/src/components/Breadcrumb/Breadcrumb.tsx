export type BreadcrumbProps = {
  elements: React.ReactNode[];
  textClassName?: string;
};

export const Breadcrumb = ({ elements, textClassName }: BreadcrumbProps) => {
  return (
    <nav className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center justify-center space-x-2">
        {elements.map((element, index) => (
          <>
            <li className={textClassName} key={index}>
              {element}
            </li>
            {index < elements.length - 1 && <li>/</li>}
          </>
        ))}
      </ol>
    </nav>
  )
}