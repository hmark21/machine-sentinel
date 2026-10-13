import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { EstadoBadge, Semaforo } from "@/components/Semaforo";
import { Input } from "@/components/ui/input";
import { maquinasQuery } from "@/lib/datos";
import { peorEstado } from "@/lib/dominio";

const search = z.object({
  q: z.string().optional(),
  area: z.string().optional(),
  estado: z.enum(["verde", "amarillo", "rojo"]).optional(),
});

export const Route = createFileRoute("/_authenticated/maquinas/")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Máquinas · MantenPro" }] }),
  component: Maquinas,
});

const selectCls = "h-12 rounded-md border border-input bg-card px-3 text-base font-semibold";

function Maquinas() {
  const { q = "", area = "", estado } = Route.useSearch();
  const navigate = useNavigate({ from: "/maquinas/" });
  const { data: maquinas = [], isLoading } = useQuery(maquinasQuery);
  const areas = [...new Set(maquinas.map((m) => m.area))].sort();

  const lista = maquinas
    .map((m) => ({ ...m, sem: peorEstado(m.componentes.map((c) => c.estado)) }))
    .filter((m) => (!q || `${m.nombre} ${m.modelo} ${m.ubicacion}`.toLowerCase().includes(q.toLowerCase())) && (!area || m.area === area) && (!estado || m.sem === estado));

  const set = (p: Partial<z.infer<typeof search>>) => navigate({ search: (s) => ({ ...s, ...p }), replace: true });

  return (
    <>
      <PageHeader title="Máquinas" subtitle="Elige una máquina para ver su estado" />
      <div className="panel mb-6 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Buscar por nombre, modelo o ubicación" className="h-12 pl-10 text-base" />
        </label>
        <select className={selectCls} value={area} onChange={(e) => set({ area: e.target.value || undefined })} aria-label="Área">
          <option value="">Todas las áreas</option>
          {areas.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select className={selectCls} value={estado ?? ""} onChange={(e) => set({ estado: (e.target.value || undefined) as "verde" })} aria-label="Estado">
          <option value="">Todos los estados</option>
          <option value="verde">Verde · Normal</option>
          <option value="amarillo">Amarillo · Advertencia</option>
          <option value="rojo">Rojo · Falla crítica</option>
        </select>
      </div>
      {isLoading && <p>Cargando…</p>}
      {!isLoading && lista.length === 0 && <p className="panel p-6 text-muted-foreground">No hay máquinas con esos filtros.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((m) => (
          <Link key={m.id} to="/maquinas/$id" params={{ id: m.id }} className="panel group flex gap-4 p-5 transition-shadow hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring">
            <Semaforo estado={m.sem} />
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-primary group-hover:underline">{m.nombre}</h2>
              <p className="font-semibold text-muted-foreground">{m.modelo}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm"><MapPin className="size-4 text-steel" /> {m.ubicacion} · {m.area}</p>
              <div className="mt-3"><EstadoBadge estado={m.sem} /></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
