import { cn } from "@/lib/utils";
import { SEMAFORO_LABEL, type Semaforo as S } from "@/lib/dominio";

const dot: Record<S, string> = { verde: "bg-ok", amarillo: "bg-warn", rojo: "bg-danger" };

/** Semáforo vertical de tres luces; la activa brilla. */
export function Semaforo({ estado, size = "md" }: { estado: S; size?: "sm" | "md" }) {
  const s = size === "sm" ? "size-3" : "size-4";
  return (
    <div
      className="inline-flex flex-col gap-1 rounded-md bg-foreground p-1.5"
      role="img"
      aria-label={`Estado: ${SEMAFORO_LABEL[estado]}`}
    >
      {(["rojo", "amarillo", "verde"] as S[]).map((e) => (
        <span
          key={e}
          className={cn("rounded-full", s, e === estado ? dot[e] : "bg-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: S }) {
  const cls: Record<S, string> = {
    verde: "bg-ok text-ok-foreground",
    amarillo: "bg-warn text-warn-foreground",
    rojo: "bg-danger text-danger-foreground",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-bold uppercase", cls[estado])}>
      {SEMAFORO_LABEL[estado]}
    </span>
  );
}

export function PrioridadBadge({ p }: { p: string }) {
  const cls: Record<string, string> = {
    baja: "bg-muted text-foreground border border-border",
    media: "bg-warn text-warn-foreground",
    alta: "bg-action text-action-foreground",
    critica: "bg-danger text-danger-foreground",
  };
  const label: Record<string, string> = { baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica" };
  return <span className={cn("rounded px-2 py-0.5 text-sm font-bold uppercase", cls[p])}>{label[p]}</span>;
}

export function EstadoSolicitudBadge({ e }: { e: string }) {
  const cls: Record<string, string> = {
    enviada: "bg-accent text-accent-foreground",
    en_revision: "bg-warn text-warn-foreground",
    asignada: "bg-steel text-steel-foreground",
    en_proceso: "bg-primary text-primary-foreground",
    completada: "bg-ok text-ok-foreground",
  };
  const label: Record<string, string> = {
    enviada: "Enviada",
    en_revision: "En revisión",
    asignada: "Asignada",
    en_proceso: "En proceso",
    completada: "Completada",
  };
  return <span className={cn("rounded px-2 py-0.5 text-sm font-bold", cls[e])}>{label[e]}</span>;
}
