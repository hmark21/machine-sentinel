import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { PublicLayout, SectionTitle } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto y demostración · MantenPro" },
      { name: "description", content: "Escríbenos para solicitar una demostración del sistema de mantenimiento." },
      { property: "og:title", content: "Contacto · MantenPro" },
      { property: "og:description", content: "Solicita una demostración del sistema." },
    ],
  }),
  component: Page,
});

const schema = z.object({
  nombre: z.string().trim().min(1, "Escribe tu nombre").max(100),
  empresa: z.string().trim().min(1, "Escribe tu empresa").max(150),
  email: z.string().trim().email("Correo no válido").max(255),
  mensaje: z.string().trim().min(1, "Escribe un mensaje").max(2000),
});

function Page() {
  const [enviado, setEnviado] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const r = schema.safeParse(fd);
    if (!r.success) {
      setErrores(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrores({});
    setCargando(true);
    const { error } = await supabase.from("contactos").insert(r.data as { nombre: string; empresa: string; email: string; mensaje: string });
    setCargando(false);
    if (error) { toast.error("No se pudo enviar. Intenta de nuevo."); return; }
    setEnviado(true);
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-4 py-16">
        <SectionTitle kicker="Contacto" title="Solicita una demostración">
          Déjanos tus datos y te contactaremos.
        </SectionTitle>
        {enviado ? (
          <div className="panel flex items-center gap-4 border-l-8 border-l-ok p-6">
            <CheckCircle2 className="size-10 text-ok" />
            <div>
              <p className="text-xl font-bold">¡Mensaje enviado!</p>
              <p className="text-muted-foreground">Gracias, te responderemos pronto.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="panel space-y-5 p-6" noValidate>
            {[
              ["nombre", "Nombre", "text"],
              ["empresa", "Empresa", "text"],
              ["email", "Correo", "email"],
            ].map(([n, l, t]) => (
              <div key={n} className="space-y-2">
                <Label htmlFor={n} className="text-base font-semibold">{l}</Label>
                <Input id={n} name={n} type={t} className="h-12 text-base" />
                {errores[n as string] && <p className="font-semibold text-danger">{errores[n as string]}</p>}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="mensaje" className="text-base font-semibold">Mensaje</Label>
              <Textarea id="mensaje" name="mensaje" rows={5} className="text-base" />
              {errores["mensaje"] && <p className="font-semibold text-danger">{errores["mensaje"]}</p>}
            </div>
            <Button type="submit" variant="action" size="lg" className="w-full" disabled={cargando}>
              {cargando ? "Enviando…" : "Enviar mensaje"}
            </Button>
          </form>
        )}
      </section>
    </PublicLayout>
  );
}
