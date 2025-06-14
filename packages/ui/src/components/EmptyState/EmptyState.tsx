export type EmptyStateProps = {
  title: string;
  description: string;
  linkComponent: React.ReactNode;
}

export const EmptyState = ({ title, description, linkComponent }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold mb-4">
        {title}
      </h2>
      <p className="text-muted-foreground mb-6">
        {description}
      </p>
      {linkComponent}
    </div>
  )
};