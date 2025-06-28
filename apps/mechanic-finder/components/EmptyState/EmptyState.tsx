import Link from "next/link";
import { EmptyState as EmptyStateComponent } from "@rubros/ui";

type EmptyStateProps = {
  cityName: string;
}

export const EmptyState = ({ cityName }: EmptyStateProps) => {
  return (
    <EmptyStateComponent
      title={`No hay mecánicos en ${cityName}`}
      description={`Aún no tenemos talleres mecánicos registrados en esta ciudad.`}
      linkComponent={
        <Link href="/" className="inline-flex items-center px-4 py-2 bg-primary-cta text-primary-foreground rounded-lg hover:bg-primary-cta-hover">
          Volver al inicio
        </Link>
      }
    />
  )
};