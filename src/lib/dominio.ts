export type Semaforo = "verde" | "amarillo" | "rojo";
export type Rol = "operador" | "tecnico" | "supervisor";

export const ROL_LABEL: Record<Rol, string> = {
  operador: "Operador",
  tecnico: "Técnico",
  supervisor: "Supervisor",
};

export const ESTADOS = ["enviada", "en_revision", "asignada", "en_proceso", "completada"] as const;
export type EstadoSolicitud = (typeof ESTADOS)[number];
export const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  enviada: "Enviada",
  en_revision: "En revisión",
  asignada: "Asignada",
  en_proceso: "En proceso",
  completada: "Completada",
};

export const PRIORIDADES = ["baja", "media", "alta", "critica"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];
export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};

export const TURNOS = ["matutino", "vespertino", "nocturno"] as const;
export const TURNO_LABEL: Record<string, string> = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  nocturno: "Nocturno",
};

export const SEMAFORO_LABEL: Record<Semaforo, string> = {
  verde: "Normal",
  amarillo: "Advertencia",
  rojo: "Falla crítica",
};

export function peorEstado(estados: string[]): Semaforo {
  if (estados.includes("rojo")) return "rojo";
  if (estados.includes("amarillo")) return "amarillo";
  return "verde";
}

export function diasHasta(fecha: string | null) {
  if (!fecha) return null;
  const d = new Date(fecha + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hoy.getTime()) / 86400000);
}

export function fmtFecha(f: string | null) {
  if (!f) return "—";
  return new Date(f.length === 10 ? f + "T00:00:00" : f).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}
