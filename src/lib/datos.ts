import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Rol } from "./dominio";

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.user.id),
    ]);
    const roles = (r ?? []).map((x) => x.role as Rol);
    const rol: Rol = roles.includes("supervisor") ? "supervisor" : roles.includes("tecnico") ? "tecnico" : "operador";
    return { id: u.user.id, email: u.user.email ?? "", nombre: p?.nombre ?? u.user.email ?? "", rol };
  },
});

export const maquinasQuery = queryOptions({
  queryKey: ["maquinas"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("maquinas")
      .select("*, componentes(id, nombre, estado)")
      .order("nombre");
    if (error) throw error;
    return data;
  },
});

export const usuariosQuery = queryOptions({
  queryKey: ["usuarios"],
  queryFn: async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("nombre"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    return (p ?? []).map((u) => {
      const roles = (r ?? []).filter((x) => x.user_id === u.id).map((x) => x.role as Rol);
      const rol: Rol = roles.includes("supervisor") ? "supervisor" : roles.includes("tecnico") ? "tecnico" : "operador";
      return { ...u, rol };
    });
  },
});

export const solicitudesQuery = queryOptions({
  queryKey: ["solicitudes"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*, maquinas(nombre), componentes(nombre)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const serviciosQuery = queryOptions({
  queryKey: ["servicios"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("*, maquinas(nombre), componentes(nombre)")
      .order("fecha", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const alertasQuery = queryOptions({
  queryKey: ["alertas"],
  queryFn: async () => {
    const { data } = await supabase.from("alertas").select("*").order("created_at", { ascending: false }).limit(30);
    return data ?? [];
  },
});
