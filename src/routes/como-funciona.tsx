import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, SectionTitle } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona · MantenPro" },
      { name: "description", content: "Cinco pasos: iniciar sesión, elegir máquina, revisar su estado, solicitar mantenimiento y dar seguimiento." },
      { property: "og:title", content: "Cómo funciona · MantenPro" },
      { property: "og:description", content: "El flujo de mantenimiento en cinco pasos sencillos." },
    ],
  }),
  component: Page,
});

const PASOS = [
  ["Iniciar sesión", "Entra con tu correo y clave. El sistema reconoce tu rol."],
  ["Elegir máquina", "Busca tu máquina por nombre, área o estado en las tarjetas."],
  ["Revisar su estado", "Mira el semáforo de cada componente y las gráficas de vibración y temperatura."],
  ["Solicitar mantenimiento", "Describe la falla, elige prioridad y turno, y agrega una foto si quieres."],
  ["Dar seguimiento", "Consulta en la bandeja cómo avanza tu solicitud hasta que se completa."],
];

function Page() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle kicker="Cómo funciona" title="Cinco pasos, sin complicaciones" />
        <ol className="grid gap-4 md:grid-cols-5">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="panel relative p-6 pt-14">
              <span className="absolute left-6 top-0 -translate-y-1/2 flex size-14 items-center justify-center rounded-md bg-action font-display text-3xl font-bold text-action-foreground">{i + 1}</span>
              <h3 className="text-2xl font-bold text-primary">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 panel p-6">
          <h3 className="text-2xl font-bold text-primary">Modelo del sistema</h3>
          <div className="mt-4 flex flex-wrap items-center gap-2 font-semibold">
            {["Máquina", "Componentes", "Estado", "Solicitud de mantenimiento", "Historial"].map((x, i, a) => (
              <span key={x} className="flex items-center gap-2">
                <span className="rounded bg-primary px-3 py-2 text-primary-foreground">{x}</span>
                {i < a.length - 1 && <span className="text-2xl text-action">→</span>}
              </span>
            ))}
          </div>
        </div>
        <Button asChild variant="action" size="lg" className="mt-10"><Link to="/login">Iniciar sesión</Link></Button>
      </section>
    </PublicLayout>
  );
}
