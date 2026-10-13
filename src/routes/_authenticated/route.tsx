import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ClipboardList, Factory, History, Home, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { alertasQuery, maquinasQuery, meQuery } from "@/lib/datos";
import { ROL_LABEL, diasHasta } from "@/lib/dominio";
import { Logo } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AppLayout,
});

const NAV = [
  { to: "/inicio", label: "Inicio", icon: Home },
  { to: "/maquinas", label: "Máquinas", icon: Factory },
  { to: "/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

function AppLayout() {
  const { data: me } = useQuery(meQuery);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function salir() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const items = me?.rol === "supervisor" ? [...NAV, { to: "/supervisor", label: "Supervisor", icon: ShieldCheck } as const] : NAV;

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={() => setOpen(false)}
          className="flex h-12 items-center gap-3 rounded-md px-4 text-lg font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
          activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}
        >
          <n.icon className="size-5" /> {n.label}
        </Link>
      ))}
    </nav>
  );

  const usuario = me && (
    <div className="rounded-md bg-sidebar-accent p-3 text-sidebar-foreground">
      <p className="truncate font-bold">{me.nombre}</p>
      <p className="text-sm font-semibold uppercase tracking-wide text-sidebar-primary">{ROL_LABEL[me.rol]}</p>
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Lateral (escritorio/tableta) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar p-4 md:flex">
        <Link to="/inicio"><Logo light /></Link>
        {usuario}
        {nav}
        <Button variant="ghost" onClick={salir} className="mt-auto justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <LogOut /> Cerrar sesión
        </Button>
      </aside>

      {/* Superior (móvil) */}
      <header className="sticky top-0 z-30 bg-sidebar md:hidden">
        <div className="flex items-center justify-between gap-2 p-3">
          <Link to="/inicio"><Logo light /></Link>
          <div className="flex items-center gap-2">
            <Alertas dark />
            <Button variant="steel" size="icon" onClick={() => setOpen(!open)} aria-label="Menú">{open ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {me && (
          <div className="flex items-center justify-between border-t border-sidebar-border px-4 py-2 text-sidebar-foreground">
            <span className="truncate font-semibold">{me.nombre}</span>
            <span className="text-sm font-bold uppercase text-sidebar-primary">{ROL_LABEL[me.rol]}</span>
          </div>
        )}
        {open && (
          <div className="space-y-3 border-t border-sidebar-border p-3">
            {nav}
            <Button variant="steel" className="w-full" onClick={salir}><LogOut /> Cerrar sesión</Button>
          </div>
        )}
      </header>

      <div className="min-w-0 flex-1">
        <div className="hazard-stripe h-1.5" />
        <div className="sticky top-0 z-20 hidden items-center justify-end gap-3 border-b bg-card px-6 py-3 md:flex">
          <Alertas />
        </div>
        <main className="mx-auto max-w-7xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Alertas({ dark = false }: { dark?: boolean }) {
  const { data: alertas = [] } = useQuery({ ...alertasQuery, refetchInterval: 20000 });
  const { data: maquinas = [] } = useQuery(maquinasQuery);
  const visto = useRef<string | null>(null);
  const [leidas, setLeidas] = useState<string | null>(null);

  useEffect(() => {
    setLeidas(localStorage.getItem("alertas_leidas"));
  }, []);

  // Aviso emergente cuando llega una alerta nueva
  useEffect(() => {
    const ult = alertas[0];
    if (!ult) return;
    if (visto.current && ult.created_at > visto.current) {
      toast.warning(ult.mensaje);
    }
    visto.current = ult.created_at;
  }, [alertas]);

  const preventivos = useMemo(
    () =>
      maquinas
        .map((m) => ({ m, d: diasHasta(m.proxima_revision) }))
        .filter((x) => x.d !== null && x.d <= 7)
        .map((x) => ({
          id: "prev-" + x.m.id,
          tipo: "preventivo",
          mensaje: x.d! < 0 ? `${x.m.nombre}: mantenimiento preventivo vencido hace ${-x.d!} días` : `${x.m.nombre}: mantenimiento preventivo en ${x.d} días`,
          enlace: "/maquinas/" + x.m.id,
          created_at: "",
        })),
    [maquinas],
  );

  const nuevas = alertas.filter((a) => !leidas || a.created_at > leidas).length + preventivos.length;
  const todas = [...preventivos, ...alertas];

  return (
    <Popover
      onOpenChange={(o) => {
        if (!o && alertas[0]) {
          localStorage.setItem("alertas_leidas", alertas[0].created_at);
          setLeidas(alertas[0].created_at);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant={dark ? "steel" : "outline"} className="relative" aria-label="Avisos">
          <Bell /> <span className="hidden sm:inline">Avisos</span>
          {nuevas > 0 && (
            <span className="absolute -right-2 -top-2 flex min-w-6 items-center justify-center rounded-full bg-action px-1.5 text-sm font-bold text-action-foreground">{nuevas}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] max-w-[95vw] p-0">
        <p className="border-b px-4 py-3 font-display text-lg font-bold uppercase text-primary">Avisos</p>
        <ul className="max-h-96 overflow-y-auto">
          {todas.length === 0 && <li className="p-4 text-muted-foreground">Sin avisos.</li>}
          {todas.map((a) => (
            <li key={a.id} className="border-b last:border-0">
              <Link to={a.enlace ?? "/inicio"} className="flex gap-3 px-4 py-3 hover:bg-accent">
                <span className={cn("mt-1.5 size-3 shrink-0 rounded-full", a.tipo === "rojo" ? "bg-danger" : a.tipo === "preventivo" ? "bg-warn" : "bg-steel")} />
                <span>
                  <span className="block font-semibold">{a.mensaje}</span>
                  {a.created_at && <span className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString("es-MX")}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
