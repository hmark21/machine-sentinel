import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Image as ImageIcon, Inbox, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EstadoSolicitudBadge, PrioridadBadge } from "@/components/Semaforo";
import { meQuery, solicitudesQuery, usuariosQuery } from "@/lib/datos";
import { ESTADOS, ESTADO_LABEL, PRIORIDADES, PRIORIDAD_LABEL, TURNO_LABEL, fmtMin } from "@/lib/dominio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/solicitudes/")({
  head: () => ({ meta: [{ title: "Solicitudes · MantenPro" }] }),
  component: Bandeja,
});

const selectCls = "h-11 rounded-md border border-input bg-card px-3 font-semibold";
type Sol = Awaited<ReturnType<NonNullable<typeof solicitudesQuery.queryFn>>>[number];

function Bandeja() {
  const qc = useQueryClient();
  const { data: me } = useQuery(meQuery);
  const { data: sol = [] } = useQuery(solicitudesQuery);
  const { data: usuarios = [] } = useQuery(usuariosQuery);
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [completar, setCompletar] = useState<Sol | null>(null);

  const personal = me?.rol === "tecnico" || me?.rol === "supervisor";
  const tecnicos = usuarios.filter((u) => u.rol !== "operador");
  const nombre = (id: string | null) => usuarios.find((u) => u.id === id)?.nombre ?? "Sin asignar";
  const lista = sol.filter((s) => (!estado || s.estado === estado) && (!prioridad || s.prioridad === prioridad));
  const conteo = Object.fromEntries(ESTADOS.map((e) => [e, sol.filter((s) => s.estado === e).length]));

  async function actualizar(s: Sol, cambios: { estado?: string; tecnico_id?: string | null }) {
    const { error } = await supabase.from("solicitudes").update(cambios).eq("id", s.id);
    if (error) { toast.error("No se pudo actualizar"); return; }
    toast.success("Solicitud actualizada");
    qc.invalidateQueries({ queryKey: ["solicitudes"] });
  }

  function cambiarEstado(s: Sol, nuevo: string) {
    if (nuevo === "completada") return setCompletar(s);
    const cambios: { estado?: string; tecnico_id?: string | null } = { estado: nuevo };
    if (me?.rol === "tecnico" && !s.tecnico_id && (nuevo === "en_proceso" || nuevo === "asignada")) cambios.tecnico_id = me.id;
    actualizar(s, cambios);
  }

  async function verFoto(path: string) {
    const { data } = await supabase.storage.from("fotos").createSignedUrl(path, 300);
    if (data) window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <>
      <PageHeader
        title="Solicitudes"
        subtitle="Bandeja de entrada de mantenimiento"
        actions={<Button asChild variant="action" size="lg"><Link to="/solicitudes/nueva" search={{}}><Plus /> Nueva solicitud</Link></Button>}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setEstado("")} className={cn("h-11 shrink-0 rounded-md border-2 px-4 font-bold", !estado ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card")}>
          Todas ({sol.length})
        </button>
        {ESTADOS.map((e) => (
          <button key={e} onClick={() => setEstado(e)} className={cn("h-11 shrink-0 rounded-md border-2 px-4 font-bold", estado === e ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card")}>
            {ESTADO_LABEL[e]} ({conteo[e]})
          </button>
        ))}
      </div>
      <div className="mb-4">
        <select className={selectCls} value={prioridad} onChange={(e) => setPrioridad(e.target.value)} aria-label="Prioridad">
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map((p) => <option key={p} value={p}>{PRIORIDAD_LABEL[p]}</option>)}
        </select>
      </div>

      {lista.length === 0 && (
        <div className="panel flex flex-col items-center gap-2 p-10 text-muted-foreground"><Inbox className="size-10" /> Bandeja vacía</div>
      )}
      <ul className="space-y-3">
        {lista.map((s) => (
          <li key={s.id} className={cn("panel border-l-8 p-4", s.prioridad === "critica" ? "border-l-danger" : s.prioridad === "alta" ? "border-l-action" : s.prioridad === "media" ? "border-l-warn" : "border-l-border")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-muted-foreground">#{s.folio} · {new Date(s.created_at).toLocaleString("es-MX")}</p>
                <p className="text-xl font-bold text-primary">{s.maquinas?.nombre} {s.componentes && <span className="text-foreground">· {s.componentes.nombre}</span>}</p>
                <p className="mt-1">{s.descripcion}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Turno {TURNO_LABEL[s.turno]} · Técnico: <b>{nombre(s.tecnico_id)}</b>
                  {s.tiempo_paro_min != null && <> · Paro: <b>{fmtMin(s.tiempo_paro_min)}</b></>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PrioridadBadge p={s.prioridad} />
                <EstadoSolicitudBadge e={s.estado} />
                {s.foto_url && <Button variant="steel" size="icon" onClick={() => verFoto(s.foto_url!)} aria-label="Ver foto"><ImageIcon /></Button>}
              </div>
            </div>
            {personal && s.estado !== "completada" && (
              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                <select className={selectCls} value={s.estado} onChange={(e) => cambiarEstado(s, e.target.value)} aria-label="Cambiar estado">
                  {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
                </select>
                {me?.rol === "supervisor" && (
                  <select className={selectCls} value={s.tecnico_id ?? ""} onChange={(e) => actualizar(s, { tecnico_id: e.target.value || null, estado: e.target.value && ["enviada", "en_revision"].includes(s.estado) ? "asignada" : s.estado })} aria-label="Asignar técnico">
                    <option value="">Asignar técnico…</option>
                    {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                )}
                <Button variant="ok" onClick={() => setCompletar(s)}>Completar</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <CompletarDialog sol={completar} onClose={() => setCompletar(null)} meId={me?.id} />
    </>
  );
}

function CompletarDialog({ sol, onClose, meId }: { sol: Sol | null; onClose: () => void; meId?: string | undefined }) {
  const qc = useQueryClient();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sol) return;
    const fd = new FormData(e.currentTarget);
    const paro = Number(fd.get("paro"));
    const trabajo = String(fd.get("trabajo") ?? "").trim();
    const resultado = String(fd.get("resultado") ?? "").trim();
    if (!Number.isFinite(paro) || paro < 0 || paro > 100000) { setError("Escribe el tiempo de paro en minutos."); return; }
    if (!trabajo || !resultado) { setError("Escribe el trabajo realizado y el resultado."); return; }
    setCargando(true);
    const tecnico = sol.tecnico_id ?? meId ?? null;
    const r1 = await supabase.from("servicios").insert({
      solicitud_id: sol.id, maquina_id: sol.maquina_id, componente_id: sol.componente_id, tecnico_id: tecnico,
      turno: sol.turno, trabajo: trabajo.slice(0, 1000), resultado: resultado.slice(0, 500), tiempo_paro_min: Math.round(paro),
    });
    const r2 = await supabase.from("solicitudes").update({ estado: "completada", tiempo_paro_min: Math.round(paro), tecnico_id: tecnico }).eq("id", sol.id);
    setCargando(false);
    if (r1.error || r2.error) { setError("No se pudo guardar."); return; }
    toast.success("Mantenimiento completado y registrado en el historial");
    qc.invalidateQueries({ queryKey: ["solicitudes"] });
    qc.invalidateQueries({ queryKey: ["servicios"] });
    setError("");
    onClose();
  }

  return (
    <Dialog open={!!sol} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl uppercase text-primary">Completar solicitud #{sol?.folio}</DialogTitle></DialogHeader>
        <form onSubmit={guardar} className="space-y-4">
          {error && <p className="rounded-md bg-danger p-3 font-semibold text-danger-foreground">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="paro" className="text-base font-semibold">Tiempo de paro de producción (minutos)</Label>
            <Input id="paro" name="paro" type="number" min={0} inputMode="numeric" className="h-12 text-base" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trabajo" className="text-base font-semibold">Trabajo realizado</Label>
            <Textarea id="trabajo" name="trabajo" rows={3} maxLength={1000} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resultado" className="text-base font-semibold">Resultado</Label>
            <Input id="resultado" name="resultado" maxLength={500} placeholder="Ej. Equipo operando normalmente" className="h-12 text-base" />
          </div>
          <Button type="submit" variant="ok" size="lg" className="w-full" disabled={cargando}>{cargando ? "Guardando…" : "Marcar como completada"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
