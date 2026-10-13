import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { meQuery } from "@/lib/datos";
import { ROL_LABEL } from "@/lib/dominio";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil · MantenPro" }] }),
  component: Perfil,
});

function Perfil() {
  const { data: me } = useQuery(meQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState<string | null>(null);

  if (!me) return <p>Cargando…</p>;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const n = (nombre ?? me!.nombre).trim();
    if (!n || n.length > 100) { toast.error("Escribe un nombre válido"); return; }
    const { error } = await supabase.from("profiles").update({ nombre: n }).eq("id", me!.id);
    if (error) { toast.error("No se pudo guardar"); return; }
    toast.success("Perfil actualizado");
    qc.invalidateQueries({ queryKey: ["me"] });
    qc.invalidateQueries({ queryKey: ["usuarios"] });
  }

  async function salir() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <>
      <PageHeader title="Perfil" subtitle="Tus datos en el sistema" />
      <form onSubmit={guardar} className="panel max-w-xl space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-base font-semibold">Nombre</Label>
          <Input id="nombre" value={nombre ?? me.nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} className="h-12 text-base" />
        </div>
        <div><p className="text-sm font-bold uppercase text-muted-foreground">Correo</p><p className="text-lg font-semibold">{me.email}</p></div>
        <div><p className="text-sm font-bold uppercase text-muted-foreground">Rol</p><p className="inline-block rounded bg-primary px-3 py-1 font-bold uppercase text-primary-foreground">{ROL_LABEL[me.rol]}</p></div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit"><Save /> Guardar</Button>
          <Button type="button" variant="outline" onClick={salir}><LogOut /> Cerrar sesión</Button>
        </div>
      </form>
    </>
  );
}
