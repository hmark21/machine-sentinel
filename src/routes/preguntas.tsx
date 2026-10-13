import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, SectionTitle } from "@/components/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Semaforo } from "@/components/Semaforo";

export const Route = createFileRoute("/preguntas")({
  head: () => ({
    meta: [
      { title: "Preguntas frecuentes · MantenPro" },
      { name: "description", content: "Cómo funciona el semáforo, qué roles existen y cómo solicitar acceso." },
      { property: "og:title", content: "Preguntas frecuentes · MantenPro" },
      { property: "og:description", content: "Respuestas sobre el semáforo, los roles y el acceso al sistema." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <SectionTitle kicker="Preguntas frecuentes" title="Resolvemos tus dudas" />
        <Accordion type="single" collapsible className="panel px-6">
          <AccordionItem value="1">
            <AccordionTrigger className="text-xl font-bold">¿Cómo funciona el semáforo?</AccordionTrigger>
            <AccordionContent className="space-y-3 text-base">
              {[
                ["verde", "Verde: el componente funciona normal."],
                ["amarillo", "Amarillo: hay algo pendiente o una advertencia que revisar."],
                ["rojo", "Rojo: falla crítica o máquina detenida. Requiere atención inmediata."],
              ].map(([e, t]) => (
                <div key={e} className="flex items-center gap-3"><Semaforo estado={e as "verde"} size="sm" /> {t}</div>
              ))}
              <p>La máquina toma el color del componente en peor estado.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger className="text-xl font-bold">¿Qué roles existen?</AccordionTrigger>
            <AccordionContent className="text-base">
              <ul className="list-disc space-y-2 pl-5">
                <li><b>Operador:</b> consulta el estado de las máquinas y crea solicitudes.</li>
                <li><b>Técnico:</b> atiende solicitudes, actualiza su estado y registra el servicio.</li>
                <li><b>Supervisor:</b> todo lo anterior, además de asignar tareas, ver reportes y administrar usuarios.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger className="text-xl font-bold">¿Cómo solicito acceso?</AccordionTrigger>
            <AccordionContent className="text-base">
              Pide a tu supervisor que te dé de alta desde el panel de administración, o escríbenos desde el formulario de contacto para solicitar una demostración.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </PublicLayout>
  );
}
