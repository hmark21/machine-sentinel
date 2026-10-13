import { createFileRoute } from "@tanstack/react-router";
import { Activity, CalendarCheck, Thermometer, ShieldCheck } from "lucide-react";
import { PublicLayout, SectionTitle } from "@/components/PublicLayout";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Tips de mantenimiento · MantenPro" },
      { name: "description", content: "Mantenimiento preventivo, señales de falla por vibración y temperatura, y buenas prácticas." },
      { property: "og:title", content: "Tips de mantenimiento · MantenPro" },
      { property: "og:description", content: "Consejos prácticos para cuidar tus máquinas." },
    ],
  }),
  component: Page,
});

const TIPS = [
  { icon: CalendarCheck, t: "Mantenimiento preventivo", items: ["Respeta las fechas de revisión de cada máquina.", "Lubrica según el manual del fabricante.", "Cambia filtros antes de que se saturen.", "Registra cada servicio para conocer su historial."] },
  { icon: Activity, t: "Señales de falla: vibración", items: ["Un aumento sostenido indica desbalance o desgaste de rodamientos.", "Ruidos nuevos o golpeteos son señal de alerta.", "Compara con la lectura normal de la misma máquina."] },
  { icon: Thermometer, t: "Señales de falla: temperatura", items: ["Motores o rodamientos muy calientes al tacto requieren revisión.", "Revisa ventilación y niveles de aceite.", "Un aumento rápido puede anticipar una falla grave."] },
  { icon: ShieldCheck, t: "Buenas prácticas", items: ["Bloquea y etiqueta la máquina antes de intervenirla.", "Mantén limpia el área de trabajo.", "Reporta pronto: una falla pequeña sale más barata.", "Usa siempre el equipo de protección."] },
];

function Page() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle kicker="Tips" title="Cuida tus máquinas" />
        <div className="grid gap-4 md:grid-cols-2">
          {TIPS.map((t) => (
            <article key={t.t} className="panel p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-md bg-steel text-steel-foreground"><t.icon className="size-6" /></span>
                <h3 className="text-2xl font-bold text-primary">{t.t}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {t.items.map((i) => (
                  <li key={i} className="flex gap-2"><span className="mt-2 size-2 shrink-0 rounded-full bg-action" />{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
