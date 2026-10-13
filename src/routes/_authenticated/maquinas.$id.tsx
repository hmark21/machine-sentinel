import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { EstadoBadge, Semaforo } from "@/components/Semaforo";
import { maquinasQuery, meQuery } from "@/lib/datos";
import { fmtFecha, peorEstado, type Semaforo as S } from "@/lib/dominio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/maquinas/$id")({
  head: () => ({ meta: [{ title: "Panel de máquina · MantenPro" }] }),
  component: Panel,
});

const RANGOS = { dia: ["Día", 1], semana: ["Semana", 7], mes: ["Mes", 30] } as const;
type Rango = keyof typeof RANGOS;

function Panel() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: me } = useQuery(meQuery);
  const { data: maquinas = [] } = useQuery(maquinasQuery);
  const [rango, setRango] = useState<Rango>("semana");
  const m = maquinas.find((x) => x.id === id);

  const { data: lecturas = [] } = useQuery({
    queryKey: ["lecturas", id, rango],
    queryFn: async () => {
      const desde = new Date(Date.now() - RANGOS[rango][1] * 86400000).toISOString();
      const { data } = await supabase.from("lecturas").select("fecha, vibracion, temperatura, presion").eq("maquina_id", id).gte("fecha", desde).order("fecha");
      return (data ?? []).map((l) => ({
        ...l,
        vibracion: Number(l.vibracion),
        temperatura: Number(l.temperatura),
        presion: Number(l.presion),
        t: new Date(l.fecha).toLocaleString("es-MX", rango === "dia" ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short" }),
      }));
    },
  });

  if (!m) return <p>Cargando…</p>;
  const sem = peorEstado(m.componentes.map((c) => c.estado));
  const personal = me?.rol === "tecnico" || me?.rol === "supervisor";

  async function cambiarEstado(cid: string, estado: S) {
    const { error } = await supabase.from("componentes").update({ estado }).eq("id", cid);
    if (error) return toast.error("No se pudo actualizar");
    toast.success("Estado actualizado");
    qc.invalidateQueries({ queryKey: ["maquinas"] });
    qc.invalidateQueries({ queryKey: ["alertas"] });
  }

  return (
    <>
      <Button asChild variant="ghost" className="mb-2 -ml-3"><Link to="/maquinas" search={{}}><ArrowLeft /> Máquinas</Link></Button>
      <PageHeader
        title={m.nombre}
        subtitle={`${m.modelo} · ${m.ubicacion}`}
        actions={<Button asChild variant="action" size="lg"><Link to="/solicitudes/nueva" search={{ maquina: m.id }}><Plus /> Solicitar mantenimiento</Link></Button>}
      />

      <section className="panel mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[auto_repeat(5,1fr)] lg:items-center">
        <div className="flex items-center gap-3"><Semaforo estado={sem} /><EstadoBadge estado={sem} /></div>
        {[
          ["Modelo", m.modelo],
          ["N.º de serie", m.numero_serie],
          ["Área", m.area],
          ["Última revisión", fmtFecha(m.ultima_revision)],
          ["Próxima revisión", fmtFecha(m.proxima_revision)],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{l}</p>
            <p className="text-lg font-semibold">{v}</p>
          </div>
        ))}
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold uppercase text-primary">Condiciones de operación</h2>
        <div className="inline-flex rounded-md border-2 border-primary bg-card p-1" role="tablist">
          {(Object.keys(RANGOS) as Rango[]).map((r) => (
            <button key={r} role="tab" aria-selected={rango === r} onClick={() => setRango(r)} className={cn("h-10 rounded px-4 font-semibold", rango === r ? "bg-primary text-primary-foreground" : "text-primary")}>
              {RANGOS[r][0]}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Grafica titulo="Vibración (mm/s)" datos={lecturas} campo="vibracion" umbral={Number(m.umbral_vibracion)} color="var(--color-steel)" />
        <Grafica titulo="Temperatura (°C)" datos={lecturas} campo="temperatura" umbral={Number(m.umbral_temperatura)} color="var(--color-action)" />
      </div>

      <h2 className="mb-3 text-2xl font-bold uppercase text-primary">Estado de componentes</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {m.componentes.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((c) => (
          <li key={c.id} className="panel flex flex-wrap items-center gap-4 p-4">
            <Semaforo estado={c.estado as S} />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold">{c.nombre}</p>
              <EstadoBadge estado={c.estado as S} />
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              {personal && (
                <select value={c.estado} onChange={(e) => cambiarEstado(c.id, e.target.value as S)} className="h-11 rounded-md border border-input bg-card px-2 font-semibold" aria-label={`Cambiar estado de ${c.nombre}`}>
                  <option value="verde">Verde</option>
                  <option value="amarillo">Amarillo</option>
                  <option value="rojo">Rojo</option>
                </select>
              )}
              <Button asChild variant="steel" size="icon" aria-label="Ficha de historial"><Link to="/historial" search={{ maquina: m.id, componente: c.id }}><FileText /></Link></Button>
              <Button asChild variant="action"><Link to="/solicitudes/nueva" search={{ maquina: m.id, componente: c.id }}>Solicitar</Link></Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Grafica({ titulo, datos, campo, umbral, color }: { titulo: string; datos: Record<string, unknown>[]; campo: string; umbral: number; color: string }) {
  const ultimo = datos.at(-1)?.[campo] as number | undefined;
  const alerta = ultimo !== undefined && ultimo >= umbral;
  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xl font-bold">{titulo}</h3>
        {ultimo !== undefined && (
          <span className={cn("rounded px-2 py-1 font-bold", alerta ? "bg-danger text-danger-foreground" : "bg-muted")}>Actual: {ultimo}</span>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ left: -10, right: 10 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fontSize: 12 }} minTickGap={30} />
            <YAxis tick={{ fontSize: 12 }} domain={["auto", (max: number) => Math.max(max, umbral * 1.1)]} />
            <Tooltip />
            <ReferenceLine y={umbral} stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="6 4" label={{ value: `Umbral ${umbral}`, fill: "var(--color-danger)", fontSize: 12, position: "insideTopRight" }} />
            <Line type="monotone" dataKey={campo} stroke={color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
