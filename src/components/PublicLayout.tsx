import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Cog, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/como-funciona", label: "Cómo funciona" },
  { to: "/tips", label: "Tips" },
  { to: "/preguntas", label: "Preguntas" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex size-10 items-center justify-center rounded-md bg-action text-action-foreground">
        <Cog className="size-6" />
      </span>
      <span className={`font-display text-xl font-bold leading-none uppercase ${light ? "text-primary-foreground" : "text-primary"}`}>
        MantenPro
        <span className="block text-xs font-semibold normal-case tracking-wide opacity-80">Gestión de mantenimiento</span>
      </span>
    </span>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <div className="hazard-stripe h-2" />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 font-semibold text-foreground hover:bg-accent"
                activeProps={{ className: "bg-accent text-primary" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
            <Button asChild variant="action" className="ml-2">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </nav>
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 font-semibold hover:bg-accent">
                {n.label}
              </Link>
            ))}
            <Button asChild variant="action" size="lg"><Link to="/login">Iniciar sesión</Link></Button>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <Logo light />
          <p className="text-sm opacity-80">Sistema de Gestión de Mantenimiento de Máquinas · © 2026</p>
        </div>
      </footer>
    </div>
  );
}

export function SectionTitle({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-steel">{kicker}</p>
      <h2 className="text-4xl font-bold text-primary md:text-5xl">{title}</h2>
      {children && <p className="mt-3 text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}
