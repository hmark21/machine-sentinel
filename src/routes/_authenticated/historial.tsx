import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { maquinasQuery, serviciosQuery, usuariosQuery } from "@/lib/datos";
import { TURNO_LABEL, fmtFecha, fmtMin } from "@/lib/dominio";

export const Route = createFileRoute("/_authenticated/historial")({
  validateSearch: z.object({ maquina: z.string().optional(), componente: z.string().optional() }),
  head: () => ({ meta: [{ title: "Historial · MantenPro" }] }),
  component: Historial,
});

const selectCls = "h-12 rounded-md border border-input bg-card px-3 text-base font-semibold";

function Historial() {
  const { maquina = "", componente = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/historial" });
  const { data: servicios = [] } = useQuery(serviciosQuery);
  const { data: maquinas = [] } = useQuery(maquinasQuery);
  const { data: usuarios = [] } = useQuery(usuariosQuery);
  const nombre = (id: string | null) => usuarios.find((u) => u.id === id)?.nombre ?? "—";
  const comps = maquinas.find((m) => m.id === maquina)?.componentes ?? [];

  const lista = servicios.filter((s) => (!maquina || s.maquina_id === maquina) && (!componente || s.componente_id === componente));
  const totales = maquinas
    .map((m) => ({ nombre: m.nombre, min: servicios.filter((s) => s.maquina_id === m.id).reduce((a, s) => a + s.tiempo_paro_min, 0) }))
    .sort((a, b) => b.min - a.min);

  const filas = lista.map((s) => ({
    Fecha: fmtFecha(s.fecha),
    Máquina: s.maquinas?.nombre ?? "",
    Componente: s.componentes?.nombre ?? "General",
    Técnico: nombre(s.tecnico_id),
    Turno: TURNO_LABEL[s.turno] ?? s.turno,
    Trabajo: s.trabajo,
    Resultado: s.resultado,
    "Paro (min)": s.tiempo_paro_min,
  }));

  async function excel() {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), "Historial");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(totales.map((t) => ({ Máquina: t.nombre, "Paro total (min)": t.min }))), "Paro por máquina");
    XLSX.writeFile(wb, "historial-mantenimiento.xlsx");
  }

  async function pdf() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Historial de mantenimiento", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [Object.keys(filas[0] ?? { Fecha: "" })],
      body: filas.map((f) => Object.values(f).map(String)),
      headStyles: { fillColor: [23, 59, 87] },
      styles: { fontSize: 9 },
    });
    autoTable(doc, {
      head: [["Máquina", "Paro total"]],
      body: totales.map((t) => [t.nombre, fmtMin(t.min)]),
      headStyles: { fillColor: [242, 140, 40] },
    });
    doc.save("historial-mantenimiento.pdf");
  }

  return (
    <>
      <PageHeader
        title="Historial"
        subtitle="Fichas de servicio por máquina y componente"
        actions={
          <>
            <Button variant="steel" onClick={pdf}><FileDown /> PDF</Button>
            <Button variant="ok" onClick={excel}><FileSpreadsheet /> Excel</Button>
          </>
        }
      />
      <div className="panel mb-6 grid gap-3 p-4 sm:grid-cols-2">
        <select className={selectCls} value={maquina} onChange={(e) => navigate({ search: { maquina: e.target.value || undefined }, replace: true })} aria-label="Máquina">
          <option value="">Todas las máquinas</option>
          {maquinas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <select className={selectCls} value={componente} disabled={!maquina} onChange={(e) => navigate({ search: { maquina, componente: e.target.value || undefined }, replace: true })} aria-label="Componente">
          <option value="">Todos los componentes</option>
          {comps.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {lista.length === 0 && <li className="panel p-6 text-muted-foreground">No hay servicios registrados con estos filtros.</li>}
          {lista.map((s) => (
            <li key={s.id} className="panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-primary px-4 py-2 text-primary-foreground">
                <span className="font-display text-lg font-bold uppercase">{s.maquinas?.nombre} · {s.componentes?.nombre ?? "General"}</span>
                <span className="font-semibold">{fmtFecha(s.fecha)}</span>
              </div>
              <dl className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-sm font-bold uppercase text-muted-foreground">Técnico</dt><dd className="font-semibold">{nombre(s.tecnico_id)}</dd></div>
                <div><dt className="text-sm font-bold uppercase text-muted-foreground">Turno</dt><dd className="font-semibold">{TURNO_LABEL[s.turno]}</dd></div>
                <div><dt className="text-sm font-bold uppercase text-muted-foreground">Resultado</dt><dd className="font-semibold text-ok">{s.resultado}</dd></div>
                <div><dt className="text-sm font-bold uppercase text-muted-foreground">Tiempo de paro</dt><dd className="font-bold text-action">{fmtMin(s.tiempo_paro_min)}</dd></div>
                <div className="sm:col-span-2 lg:col-span-4"><dt className="text-sm font-bold uppercase text-muted-foreground">Trabajo realizado</dt><dd>{s.trabajo}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <aside className="panel h-fit p-4">
          <h2 className="mb-3 text-2xl font-bold uppercase text-primary">Paro total por máquina</h2>
          <ul className="divide-y">
            {totales.map((t) => (
              <li key={t.nombre} className="flex justify-between gap-2 py-2"><span className="font-semibold">{t.nombre}</span><span className="font-bold">{fmtMin(t.min)}</span></li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
