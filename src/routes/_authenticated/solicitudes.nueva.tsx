import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maquinasQuery, meQuery } from "@/lib/datos";
import { PRIORIDADES, PRIORIDAD_LABEL, TURNOS, TURNO_LABEL } from "@/lib/dominio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/solicitudes/nueva")({
  validateSearch: z.object({ maquina: z.string().optional(), componente: z.string().optional() }),
  head: () => ({ meta: [{ title: "Nueva solicitud · MantenPro" }] }),
  component: Nueva,
});

const selectCls = "h-12 w-full rounded-md border border-input bg-card px-3 text-base font-semibold";

function turnoActual() {
  const h = new Date().getHours();
  return h >= 6 && h < 14 ? "matutino" : h >= 14 && h < 22 ? "vespertino" : "nocturno";
}

function Nueva() {
  const s = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useQuery(meQuery);
  const { data: maquinas = [] } = useQuery(maquinasQuery);
  const [maquina, setMaquina] = useState(s.maquina ?? "");
  const [componente, setComponente] = useState(s.componente ?? "");
  const [prioridad, setPrioridad] = useState("media");
  const [turno, setTurno] = useState(turnoActual());
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const comps = maquinas.find((m) => m.id === maquina)?.componentes ?? [];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!maquina) { setError("Elige una máquina."); return; }
    if (descripcion.trim().length < 3) { setError("Describe el problema (mínimo 3 caracteres)."); return; }
    if (descripcion.length > 1000) { setError("La descripción es demasiado larga."); return; }
    if (foto && foto.size > 10 * 1024 * 1024) { setError("La foto no debe pesar más de 10 MB."); return; }
    setError("");
    setCargando(true);
    let foto_url: string | null = null;
    if (foto) {
      const path = `${me!.id}/${Date.now()}-${foto.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const up = await supabase.storage.from("fotos").upload(path, foto);
      if (up.error) {
        setCargando(false);
        { setError("No se pudo subir la foto."); return; }
      }
      foto_url = path;
    }
    const { error } = await supabase.from("solicitudes").insert({
      maquina_id: maquina,
      componente_id: componente || null,
      descripcion: descripcion.trim(),
      prioridad,
      turno,
      foto_url,
      creado_por: me!.id,
    });
    setCargando(false);
    if (error) { setError("No se pudo enviar la solicitud."); return; }
    toast.success("Solicitud enviada");
    qc.invalidateQueries({ queryKey: ["solicitudes"] });
    navigate({ to: "/solicitudes" });
  }

  return (
    <>
      <PageHeader title="Nueva solicitud" subtitle="Reporta una falla o pide mantenimiento" />
      <form onSubmit={enviar} className="panel max-w-3xl space-y-6 p-5 md:p-6">
        {error && <div role="alert" className="rounded-md bg-danger p-4 font-semibold text-danger-foreground">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Máquina</Label>
            <select className={selectCls} value={maquina} onChange={(e) => { setMaquina(e.target.value); setComponente(""); }}>
              <option value="">Elige…</option>
              {maquinas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Componente</Label>
            <select className={selectCls} value={componente} onChange={(e) => setComponente(e.target.value)} disabled={!maquina}>
              <option value="">General / no sé</option>
              {comps.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc" className="text-base font-semibold">Descripción</Label>
          <Textarea id="desc" rows={4} maxLength={1000} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="¿Qué observaste? Ruido, fuga, vibración, temperatura…" className="text-base" />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold">Prioridad</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORIDADES.map((p) => (
              <button type="button" key={p} onClick={() => setPrioridad(p)} aria-pressed={prioridad === p}
                className={cn("h-14 rounded-md border-2 text-lg font-bold", prioridad === p ? (p === "critica" ? "border-danger bg-danger text-danger-foreground" : "border-action bg-action text-action-foreground") : "border-input bg-card")}>
                {PRIORIDAD_LABEL[p]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-base font-semibold">Turno laboral</legend>
          <div className="grid grid-cols-3 gap-2">
            {TURNOS.map((t) => (
              <button type="button" key={t} onClick={() => setTurno(t)} aria-pressed={turno === t}
                className={cn("h-14 rounded-md border-2 text-lg font-bold", turno === t ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card")}>
                {TURNO_LABEL[t]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="foto" className="text-base font-semibold">Foto (opcional)</Label>
          <label htmlFor="foto" className="flex h-14 cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-steel px-4 font-semibold text-steel">
            <Camera /> {foto ? foto.name : "Tomar o elegir foto"}
          </label>
          <input id="foto" type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
        </div>
        <Button type="submit" variant="action" size="lg" className="w-full" disabled={cargando}><Send /> {cargando ? "Enviando…" : "Enviar solicitud"}</Button>
      </form>
    </>
  );
}
