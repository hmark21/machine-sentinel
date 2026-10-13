import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const rolSchema = z.enum(["operador", "tecnico", "supervisor"]);

async function exigirSupervisor(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "supervisor" });
  if (!data) throw new Error("Solo un supervisor puede administrar usuarios");
}

export const crearUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      nombre: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      password: z.string().min(8).max(72),
      rol: rolSchema,
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await exigirSupervisor(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nombre: data.nombre, rol: data.rol },
    });
    if (error) throw new Error(error.message.includes("already") ? "Ese correo ya está registrado" : "No se pudo crear el usuario");
    return { ok: true };
  });

export const cambiarRol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ userId: z.string().uuid(), rol: rolSchema }).parse(i))
  .handler(async ({ data, context }) => {
    await exigirSupervisor(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("No puedes cambiar tu propio rol");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.rol });
    if (error) throw new Error("No se pudo cambiar el rol");
    return { ok: true };
  });
