import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ClipboardList, Factory, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { EstadoSolicitudBadge, PrioridadBadge, Semaforo } from "@/components/Semaforo";
import { maquinasQuery, meQuery, solicitudesQuery } from "@/lib/datos";
import { diasHasta, fmtFecha, peorEstado } from "@/lib/dominio";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({ meta: [{ title: "Inicio · MantenPro" }] }),
  component: Inicio,
});

function Inicio() {
  const { data: me } = useQuery(meQuery);
  const { data: maquinas = [] } = useQuery(maquinasQuery);
  const { data: sol = [] } = useQuery(solicitudesQuery);

  const estados = maquinas.map((m) => peorEstado(m.componentes.map((c) => c.estado)));
  const cuenta = { verde: 0, amarillo: 0, rojo: 0 };
  estados.forEach((e) => cuenta[e]++);
  const abiertas = sol.filter((s) => s.estado !== "completada");
  const mias = me?.rol === "tecnico" ? abiertas.filter((s) => s.tecnico_id === me.id) : me?.rol === "operador" ? abiertas.filter((s) => s.creado_por === me.id) : abiertas;
  const proximas = [...maquinas].sort((a, b) => (a.proxima_revision ?? "").localeCompare(b.proxima_revision ?? "")).slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Hola, ${me?.nombre.split(" ")[0] ?? ""}`}
        subtitle="Resumen del estado del taller"
        actions={<Button asChild variant="action" size="lg"><Link to="/solicitudes/nueva" search={{}}><Plus /> Nueva solicitud</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {([["verde", "Máquinas normales", "border-l-ok"], ["amarillo", "Con advertencia", "border-l-warn"], ["rojo", "Falla crítica", "border-l-danger"]] as const).map(([e, l, b]) => (
          <Link key={e} to="/maquinas" search={{ estado: e }} className={`panel flex items-center gap-4 border-l-8 p-5 ${b}`}>
            <Semaforo estado={e} />
            <div>
              <p className="font-display text-5xl font-bold">{cuenta[e]}</p>
              <p className="font-semibold text-muted-foreground">{l}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-primary"><ClipboardList className="text-steel" /> {me?.rol === "supervisor" ? "Solicitudes abiertas" : "Mis solicitudes abiertas"}</h2>
          <ul className="divide-y">
            {mias.length === 0 && <li className="py-3 text-muted-foreground">No hay solicitudes abiertas.</li>}
            {mias.slice(0, 6).map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-bold">#{s.folio} · {s.maquinas?.nombre}</p>
                  <p className="text-sm text-muted-foreground">{s.componentes?.nombre}</p>
                </div>
                <div className="flex gap-2"><PrioridadBadge p={s.prioridad} /><EstadoSolicitudBadge e={s.estado} /></div>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-4 w-full"><Link to="/solicitudes">Ver bandeja</Link></Button>
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-primary"><CalendarClock className="text-steel" /> Próximos preventivos</h2>
          <ul className="divide-y">
            {proximas.map((m) => {
              const d = diasHasta(m.proxima_revision) ?? 99;
              return (
                <li key={m.id}>
                  <Link to="/maquinas/$id" params={{ id: m.id }} className="flex items-center justify-between gap-2 py-3 hover:bg-accent">
                    <span className="flex items-center gap-3 font-bold"><Factory className="size-5 text-steel" /> {m.nombre}</span>
                    <span className={`rounded px-2 py-0.5 text-sm font-bold ${d <= 3 ? "bg-danger text-danger-foreground" : d <= 7 ? "bg-warn text-warn-foreground" : "bg-muted"}`}>
                      {fmtFecha(m.proxima_revision)} · {d} días
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
