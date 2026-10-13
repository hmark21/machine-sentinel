import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrioridadBadge } from "@/components/Semaforo";
import { maquinasQuery, meQuery, serviciosQuery, solicitudesQuery, usuariosQuery } from "@/lib/datos";
import { ESTADOS, ESTADO_LABEL, ROL_LABEL, fmtMin, type Rol } from "@/lib/dominio";
import { cambiarRol, crearUsuario } from "@/lib/usuarios.functions";

export const Route = createFileRoute("/_authenticated/supervisor")({
  head: () => ({ meta: [{ title: "Panel del supervisor · MantenPro" }] }),
  component: Supervisor,
});

const selectCls = "h-11 rounded-md border border-input bg-card px-3 font-semibold";
const tabCls = "h-11 px-4 text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

function Supervisor() {
  const { data: me } = useQuery(meQuery);
  if (me && me.rol !== "supervisor")
    return <div className="panel p-6"><p className="text-xl font-bold">Esta sección es solo para supervisores.</p><Button asChild className="mt-4"><Link to="/inicio">Volver al inicio</Link></Button></div>;
  return (
    <>
      <PageHeader title="Panel del supervisor" subtitle="Asignación, reportes y usuarios" />
      <Tabs defaultValue="asignar">
        <TabsList className="mb-4 h-auto flex-wrap gap-1 bg-card p-1">
          <TabsTrigger value="asignar" className={tabCls}>Asignación</TabsTrigger>
          <TabsTrigger value="reportes" className={tabCls}>Reportes</TabsTrigger>
          <TabsTrigger value="usuarios" className={tabCls}>Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="asignar"><Asignacion /></TabsContent>
        <TabsContent value="reportes"><Reportes /></TabsContent>
        <TabsContent value="usuarios"><Usuarios meId={me?.id} /></TabsContent>
      </Tabs>
    </>
  );
}

function Asignacion() {
  const qc = useQueryClient();
  const { data: sol = [] } = useQuery(solicitudesQuery);
  const { data: usuarios = [] } = useQuery(usuariosQuery);
  const tecnicos = usuarios.filter((u) => u.rol !== "operador");
  const abiertas = sol.filter((s) => s.estado !== "completada");
  const orden = { critica: 0, alta: 1, media: 2, baja: 3 } as Record<string, number>;

  async function asignar(id: string, tecnico_id: string, estado: string) {
    const { error } = await supabase.from("solicitudes").update({ tecnico_id: tecnico_id || null, estado: tecnico_id && ["enviada", "en_revision"].includes(estado) ? "asignada" : estado }).eq("id", id);
    if (error) return toast.error("No se pudo asignar");
    toast.success("Tarea asignada");
    qc.invalidateQueries({ queryKey: ["solicitudes"] });
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead className="bg-primary text-primary-foreground">
          <tr>{["Folio", "Máquina", "Prioridad", "Estado", "Técnico"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {[...abiertas].sort((a, b) => orden[a.prioridad] - orden[b.prioridad]).map((s) => (
            <tr key={s.id} className="border-b">
              <td className="px-4 py-3 font-bold">#{s.folio}</td>
              <td className="px-4 py-3"><b>{s.maquinas?.nombre}</b><br /><span className="text-sm text-muted-foreground">{s.componentes?.nombre}</span></td>
              <td className="px-4 py-3"><PrioridadBadge p={s.prioridad} /></td>
              <td className="px-4 py-3">{ESTADO_LABEL[s.estado as "enviada"]}</td>
              <td className="px-4 py-3">
                <select className={selectCls} value={s.tecnico_id ?? ""} onChange={(e) => asignar(s.id, e.target.value, s.estado)} aria-label="Técnico">
                  <option value="">Sin asignar</option>
                  {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reportes() {
  const { data: sol = [] } = useQuery(solicitudesQuery);
  const { data: serv = [] } = useQuery(serviciosQuery);
  const { data: maquinas = [] } = useQuery(maquinasQuery);
  const paro = maquinas.map((m) => ({ nombre: m.nombre, minutos: serv.filter((s) => s.maquina_id === m.id).reduce((a, s) => a + s.tiempo_paro_min, 0) }));
  const total = paro.reduce((a, p) => a + p.minutos, 0);
  const porEstado = ESTADOS.map((e) => ({ nombre: ESTADO_LABEL[e], cantidad: sol.filter((s) => s.estado === e).length }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi l="Solicitudes abiertas" v={String(sol.filter((s) => s.estado !== "completada").length)} />
        <Kpi l="Servicios completados" v={String(serv.length)} />
        <Kpi l="Paro total" v={fmtMin(total)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <h3 className="mb-2 text-xl font-bold">Paro total por máquina (min)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={paro} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke="var(--color-border)" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="minutos" fill="var(--color-action)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-4">
          <h3 className="mb-2 text-xl font-bold">Solicitudes por estado</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={porEstado}>
                <CartesianGrid stroke="var(--color-border)" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="var(--color-steel)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ l, v }: { l: string; v: string }) {
  return <div className="panel border-l-8 border-l-primary p-5"><p className="font-display text-4xl font-bold">{v}</p><p className="font-semibold text-muted-foreground">{l}</p></div>;
}

function Usuarios({ meId }: { meId?: string }) {
  const qc = useQueryClient();
  const { data: usuarios = [] } = useQuery(usuariosQuery);
  const crear = useServerFn(crearUsuario);
  const rol = useServerFn(cambiarRol);
  const [cargando, setCargando] = useState(false);

  async function onCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = { nombre: String(fd.get("nombre")), email: String(fd.get("email")), password: String(fd.get("password")), rol: String(fd.get("rol")) as Rol };
    if (data.password.length < 8) return toast.error("La clave debe tener al menos 8 caracteres");
    setCargando(true);
    try {
      await crear({ data });
      toast.success("Usuario creado");
      form.reset();
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear");
    } finally {
      setCargando(false);
    }
  }

  async function onRol(userId: string, r: Rol) {
    try {
      await rol({ data: { userId, rol: r } });
      toast.success("Rol actualizado");
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cambiar");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="panel divide-y">
        {usuarios.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div><p className="text-lg font-bold">{u.nombre}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
            <select className={selectCls} value={u.rol} disabled={u.id === meId} onChange={(e) => onRol(u.id, e.target.value as Rol)} aria-label={`Rol de ${u.nombre}`}>
              {(Object.keys(ROL_LABEL) as Rol[]).map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
            </select>
          </li>
        ))}
      </ul>
      <form onSubmit={onCrear} className="panel h-fit space-y-4 p-5">
        <h3 className="flex items-center gap-2 text-2xl font-bold text-primary"><UserPlus className="text-steel" /> Nuevo usuario</h3>
        <div className="space-y-1"><Label htmlFor="n">Nombre</Label><Input id="n" name="nombre" required maxLength={100} className="h-11" /></div>
        <div className="space-y-1"><Label htmlFor="e">Correo</Label><Input id="e" name="email" type="email" required maxLength={255} className="h-11" /></div>
        <div className="space-y-1"><Label htmlFor="p">Clave inicial</Label><Input id="p" name="password" type="password" required minLength={8} className="h-11" /></div>
        <div className="space-y-1">
          <Label htmlFor="r">Rol</Label>
          <select id="r" name="rol" className={`${selectCls} w-full`} defaultValue="operador">
            {(Object.keys(ROL_LABEL) as Rol[]).map((r) => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
          </select>
        </div>
        <Button type="submit" variant="action" className="w-full" disabled={cargando}>{cargando ? "Creando…" : "Crear usuario"}</Button>
      </form>
    </div>
  );
}
