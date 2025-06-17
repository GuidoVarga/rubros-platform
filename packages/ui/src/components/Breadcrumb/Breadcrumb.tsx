import { Fragment } from "react/jsx-runtime";

export type BreadcrumbProps = {
  elements: {
    id: string;
    content: React.ReactNode | string;
  }[];
  textClassName?: string;
};

export const Breadcrumb = ({ elements, textClassName }: BreadcrumbProps) => {
  return (
    <nav className="mb-4 text-sm text-muted-foreground">
      <ol className="flex items-center justify-center space-x-2">
        {elements.map((element, index) => (
          <Fragment key={`${element.id}-fragment`}>
            <li className={textClassName} key={element.id}>
              {element.content}
            </li>
            {index < elements.length - 1 && <li key={`${index}-separator`}>/</li>}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}