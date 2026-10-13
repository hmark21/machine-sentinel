import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, ClipboardList, Gauge, History, HardHat, Wrench, UserCog } from "lucide-react";
import { PublicLayout, SectionTitle } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Semaforo } from "@/components/Semaforo";
import hero from "@/assets/hero-taller.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MantenPro · Sistema de Gestión de Mantenimiento de Máquinas" },
      { name: "description", content: "Organiza la información de tus máquinas y da seguimiento a su mantenimiento en talleres y áreas industriales." },
      { property: "og:title", content: "MantenPro · Gestión de Mantenimiento de Máquinas" },
      { property: "og:description", content: "Reporta fallas, revisa el estado de cada máquina y lleva el historial de servicio." },
    ],
  }),
  component: Index,
});

const BENEFICIOS = [
  { icon: Gauge, t: "Estado a la vista", d: "Semáforo por máquina y componente para saber qué atender primero." },
  { icon: ClipboardList, t: "Solicitudes ordenadas", d: "Bandeja de entrada con prioridad, turno y estado de cada reporte." },
  { icon: History, t: "Historial completo", d: "Ficha de cada componente con trabajos, técnicos y tiempo de paro." },
  { icon: BellRing, t: "Avisos oportunos", d: "Alertas cuando una máquina falla o se acerca su mantenimiento preventivo." },
];

const PARA = [
  { icon: HardHat, t: "Operadores", d: "Consultan el estado de su máquina y reportan fallas en segundos." },
  { icon: Wrench, t: "Técnicos", d: "Atienden solicitudes, actualizan su avance y registran el servicio." },
  { icon: UserCog, t: "Supervisores", d: "Asignan tareas, revisan reportes y administran al personal." },
];

function Index() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <img src={hero} alt="Taller industrial con máquinas" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.4fr_1fr] md:py-28">
          <div>
            <p className="mb-4 inline-block rounded bg-action px-3 py-1 text-sm font-bold uppercase tracking-widest text-action-foreground">Taller e industria</p>
            <h1 className="text-5xl font-bold uppercase leading-[0.95] md:text-7xl">Sistema de Gestión de Mantenimiento de Máquinas</h1>
            <p className="mt-6 max-w-xl text-xl opacity-90">Reporta fallas, revisa el estado de cada máquina y da seguimiento a su mantenimiento, todo en un solo lugar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="action" size="lg"><Link to="/login">Iniciar sesión</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/contacto">Solicitar demostración</Link></Button>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="panel w-full max-w-xs p-5 text-foreground">
              <p className="font-display text-lg font-bold uppercase text-primary">Prensa hidráulica</p>
              <p className="text-sm text-muted-foreground">Nave B · Estampado</p>
              <ul className="mt-4 space-y-3">
                {[["Bomba hidráulica", "rojo"], ["Cilindro principal", "amarillo"], ["Válvulas de control", "verde"]].map(([n, e]) => (
                  <li key={n} className="flex items-center justify-between gap-3 border-t pt-3">
                    <span className="font-semibold">{n}</span>
                    <Semaforo estado={e as "rojo"} size="sm" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle kicker="Qué es" title="Tu taller, organizado">
          Una herramienta para que el personal reporte y dé seguimiento al mantenimiento de sus máquinas. Cada máquina tiene sus componentes, su estado, sus solicitudes y su historial.
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <div key={b.t} className="panel p-6">
              <b.icon className="size-9 text-steel" />
              <h3 className="mt-4 text-2xl font-bold text-primary">{b.t}</h3>
              <p className="mt-2 text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle kicker="Para quién es" title="Para todo el equipo de planta" />
          <div className="grid gap-4 md:grid-cols-3">
            {PARA.map((p) => (
              <div key={p.t} className="flex gap-4 rounded-lg border-l-8 border-action bg-background p-6">
                <p.icon className="size-10 shrink-0 text-primary" />
                <div>
                  <h3 className="text-2xl font-bold text-primary">{p.t}</h3>
                  <p className="mt-1 text-muted-foreground">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="default" size="lg"><Link to="/como-funciona">Ver cómo funciona</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/tips">Tips de mantenimiento</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
