import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · MantenPro" },
      { name: "description", content: "Entra al sistema de gestión de mantenimiento de máquinas." },
      { property: "og:title", content: "Iniciar sesión · MantenPro" },
      { property: "og:description", content: "Acceso para operadores, técnicos y supervisores." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) return setError("Escribe tu usuario (correo) y tu clave.");
    setCargando(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) return setError("Usuario o clave incorrectos. Revisa tus datos e intenta de nuevo.");
    navigate({ to: "/inicio" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="hazard-stripe h-2" />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-block"><Logo /></Link>
          <form onSubmit={onSubmit} className="panel space-y-5 p-6 md:p-8">
            <h1 className="text-4xl font-bold uppercase text-primary">Iniciar sesión</h1>
            {error && (
              <div role="alert" className="flex items-start gap-3 rounded-md bg-danger p-4 font-semibold text-danger-foreground">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Usuario (correo)</Label>
              <Input id="email" name="email" type="email" autoComplete="username" className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">Clave</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" className="h-12 text-base" />
            </div>
            <Button type="submit" variant="action" size="lg" className="w-full" disabled={cargando}>
              <LogIn /> {cargando ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 rounded-md border border-dashed border-steel bg-card p-4 text-sm">
            <p className="font-bold text-steel">Cuentas de demostración (clave: Demo1234!)</p>
            <p>operador@demo.com · tecnico@demo.com · supervisor@demo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
