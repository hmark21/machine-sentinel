import type { ReactNode } from "react";

/** Encabezado consistente: título a la izquierda, acciones a la derecha. */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-bold uppercase text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-lg text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
