
create type public.app_role as enum ('operador','tecnico','supervisor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
create table public.maquinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, modelo text not null, numero_serie text not null,
  ubicacion text not null, area text not null,
  ultima_revision date, proxima_revision date,
  umbral_vibracion numeric not null default 7.1,
  umbral_temperatura numeric not null default 80,
  created_at timestamptz not null default now()
);
create table public.componentes (
  id uuid primary key default gen_random_uuid(),
  maquina_id uuid not null references public.maquinas(id) on delete cascade,
  nombre text not null,
  estado text not null default 'verde' check (estado in ('verde','amarillo','rojo')),
  updated_at timestamptz not null default now()
);
create table public.lecturas (
  id bigserial primary key,
  maquina_id uuid not null references public.maquinas(id) on delete cascade,
  fecha timestamptz not null,
  vibracion numeric not null, temperatura numeric not null, presion numeric not null
);
create index on public.lecturas (maquina_id, fecha);
create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  folio serial,
  maquina_id uuid not null references public.maquinas(id) on delete cascade,
  componente_id uuid references public.componentes(id) on delete set null,
  descripcion text not null check (char_length(descripcion) between 3 and 1000),
  prioridad text not null check (prioridad in ('baja','media','alta','critica')),
  turno text not null check (turno in ('matutino','vespertino','nocturno')),
  estado text not null default 'enviada' check (estado in ('enviada','en_revision','asignada','en_proceso','completada')),
  foto_url text,
  tecnico_id uuid,
  creado_por uuid,
  tiempo_paro_min integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid references public.solicitudes(id) on delete set null,
  maquina_id uuid not null references public.maquinas(id) on delete cascade,
  componente_id uuid references public.componentes(id) on delete set null,
  tecnico_id uuid,
  turno text not null,
  trabajo text not null,
  resultado text not null,
  tiempo_paro_min integer not null default 0,
  fecha timestamptz not null default now()
);
create table public.alertas (
  id uuid primary key default gen_random_uuid(),
  destinatario uuid,
  tipo text not null,
  mensaje text not null,
  enlace text,
  created_at timestamptz not null default now()
);
create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 100),
  empresa text not null check (char_length(empresa) between 1 and 150),
  email text not null check (char_length(email) between 3 and 255),
  mensaje text not null check (char_length(mensaje) between 1 and 2000),
  created_at timestamptz not null default now()
);

grant select on public.profiles to authenticated; grant update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, update, delete on public.maquinas, public.componentes, public.lecturas, public.solicitudes, public.servicios, public.alertas to authenticated;
grant usage on sequence public.lecturas_id_seq, public.solicitudes_folio_seq to authenticated;
grant insert on public.contactos to anon, authenticated;
grant select on public.contactos to authenticated;
grant all on public.profiles, public.user_roles, public.maquinas, public.componentes, public.lecturas, public.solicitudes, public.servicios, public.alertas, public.contactos to service_role;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.es_personal(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _uid and role in ('tecnico','supervisor'))
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.maquinas enable row level security;
alter table public.componentes enable row level security;
alter table public.lecturas enable row level security;
alter table public.solicitudes enable row level security;
alter table public.servicios enable row level security;
alter table public.alertas enable row level security;
alter table public.contactos enable row level security;

create policy "ver perfiles" on public.profiles for select to authenticated using (true);
create policy "editar propio perfil" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "ver roles" on public.user_roles for select to authenticated using (true);
create policy "ver maquinas" on public.maquinas for select to authenticated using (true);
create policy "sup maquinas" on public.maquinas for all to authenticated using (public.has_role(auth.uid(),'supervisor')) with check (public.has_role(auth.uid(),'supervisor'));
create policy "tec maquinas" on public.maquinas for update to authenticated using (public.es_personal(auth.uid()));
create policy "ver componentes" on public.componentes for select to authenticated using (true);
create policy "personal componentes" on public.componentes for update to authenticated using (public.es_personal(auth.uid()));
create policy "ver lecturas" on public.lecturas for select to authenticated using (true);
create policy "ver solicitudes" on public.solicitudes for select to authenticated using (true);
create policy "crear solicitud" on public.solicitudes for insert to authenticated with check (creado_por = auth.uid());
create policy "personal actualiza" on public.solicitudes for update to authenticated using (public.es_personal(auth.uid()));
create policy "ver servicios" on public.servicios for select to authenticated using (true);
create policy "personal servicios" on public.servicios for insert to authenticated with check (public.es_personal(auth.uid()));
create policy "ver alertas" on public.alertas for select to authenticated using (destinatario is null or destinatario = auth.uid());
create policy "enviar contacto" on public.contactos for insert to anon, authenticated with check (true);
create policy "sup ve contactos" on public.contactos for select to authenticated using (public.has_role(auth.uid(),'supervisor'));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, email) values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, coalesce((new.raw_user_meta_data->>'rol')::app_role, 'operador'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.alerta_solicitud() returns trigger language plpgsql security definer set search_path = public as $$
declare m text;
begin
  select nombre into m from public.maquinas where id = new.maquina_id;
  if new.estado is distinct from old.estado and new.creado_por is not null then
    insert into public.alertas (destinatario, tipo, mensaje, enlace) values (new.creado_por, 'solicitud', 'Solicitud #' || new.folio || ' (' || m || ') cambió a ' || replace(new.estado,'_',' '), '/solicitudes');
  end if;
  if new.tecnico_id is distinct from old.tecnico_id and new.tecnico_id is not null then
    insert into public.alertas (destinatario, tipo, mensaje, enlace) values (new.tecnico_id, 'solicitud', 'Se te asignó la solicitud #' || new.folio || ' (' || m || ')', '/solicitudes');
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger trg_alerta_solicitud before update on public.solicitudes for each row execute function public.alerta_solicitud();

create or replace function public.alerta_componente() returns trigger language plpgsql security definer set search_path = public as $$
declare m text;
begin
  if new.estado = 'rojo' and old.estado <> 'rojo' then
    select nombre into m from public.maquinas where id = new.maquina_id;
    insert into public.alertas (tipo, mensaje, enlace) values ('rojo', m || ': ' || new.nombre || ' pasó a falla crítica', '/maquinas/' || new.maquina_id);
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger trg_alerta_componente before update on public.componentes for each row execute function public.alerta_componente();

create policy "fotos lectura" on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos subir" on storage.objects for insert to authenticated with check (bucket_id = 'fotos');

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
values
('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated','operador@demo.com', extensions.crypt('Demo1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Luis Operador","rol":"operador"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated','tecnico@demo.com', extensions.crypt('Demo1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Ana Técnica","rol":"tecnico"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333','authenticated','authenticated','supervisor@demo.com', extensions.crypt('Demo1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Jorge Supervisor","rol":"supervisor"}', now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
from auth.users u where u.id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');

insert into public.maquinas (id, nombre, modelo, numero_serie, ubicacion, area, ultima_revision, proxima_revision) values
('a0000000-0000-0000-0000-000000000001','Torno CNC 1','Haas ST-20','HS-20-4481','Nave A, línea 1','Maquinado', current_date - 40, current_date + 5),
('a0000000-0000-0000-0000-000000000002','Fresadora vertical','Bridgeport V2XT','BP-7723','Nave A, línea 2','Maquinado', current_date - 20, current_date + 25),
('a0000000-0000-0000-0000-000000000003','Prensa hidráulica','Schuler PH-150','SC-150-0912','Nave B, estampado','Estampado', current_date - 60, current_date + 2),
('a0000000-0000-0000-0000-000000000004','Compresor de aire','Atlas Copco GA30','AC-30-5567','Cuarto de servicios','Servicios', current_date - 10, current_date + 50),
('a0000000-0000-0000-0000-000000000005','Inyectora de plástico','Engel Victory 200','EN-200-3310','Nave C, inyección','Inyección', current_date - 30, current_date + 15),
('a0000000-0000-0000-0000-000000000006','Banda transportadora','Dorner 3200','DR-3200-118','Nave B, empaque','Empaque', current_date - 5, current_date + 60);

insert into public.componentes (id, maquina_id, nombre, estado) values
('c0000000-0000-0000-0000-000000000101','a0000000-0000-0000-0000-000000000001','Husillo principal','amarillo'),
('c0000000-0000-0000-0000-000000000102','a0000000-0000-0000-0000-000000000001','Torreta de herramientas','verde'),
('c0000000-0000-0000-0000-000000000103','a0000000-0000-0000-0000-000000000001','Sistema de refrigerante','verde'),
('c0000000-0000-0000-0000-000000000104','a0000000-0000-0000-0000-000000000001','Motor de avance','verde'),
('c0000000-0000-0000-0000-000000000201','a0000000-0000-0000-0000-000000000002','Cabezal','verde'),
('c0000000-0000-0000-0000-000000000202','a0000000-0000-0000-0000-000000000002','Mesa de trabajo','verde'),
('c0000000-0000-0000-0000-000000000203','a0000000-0000-0000-0000-000000000002','Lubricación central','verde'),
('c0000000-0000-0000-0000-000000000204','a0000000-0000-0000-0000-000000000002','Tornillo de bolas eje X','verde'),
('c0000000-0000-0000-0000-000000000301','a0000000-0000-0000-0000-000000000003','Bomba hidráulica','rojo'),
('c0000000-0000-0000-0000-000000000302','a0000000-0000-0000-0000-000000000003','Cilindro principal','amarillo'),
('c0000000-0000-0000-0000-000000000303','a0000000-0000-0000-0000-000000000003','Válvulas de control','verde'),
('c0000000-0000-0000-0000-000000000304','a0000000-0000-0000-0000-000000000003','Sistema de seguridad','verde'),
('c0000000-0000-0000-0000-000000000401','a0000000-0000-0000-0000-000000000004','Motor eléctrico','verde'),
('c0000000-0000-0000-0000-000000000402','a0000000-0000-0000-0000-000000000004','Filtro de aire','amarillo'),
('c0000000-0000-0000-0000-000000000403','a0000000-0000-0000-0000-000000000004','Separador de aceite','verde'),
('c0000000-0000-0000-0000-000000000404','a0000000-0000-0000-0000-000000000004','Tanque de almacenamiento','verde'),
('c0000000-0000-0000-0000-000000000501','a0000000-0000-0000-0000-000000000005','Unidad de inyección','verde'),
('c0000000-0000-0000-0000-000000000502','a0000000-0000-0000-0000-000000000005','Resistencias de calefacción','amarillo'),
('c0000000-0000-0000-0000-000000000503','a0000000-0000-0000-0000-000000000005','Unidad de cierre','verde'),
('c0000000-0000-0000-0000-000000000504','a0000000-0000-0000-0000-000000000005','Chiller de molde','verde'),
('c0000000-0000-0000-0000-000000000601','a0000000-0000-0000-0000-000000000006','Motorreductor','verde'),
('c0000000-0000-0000-0000-000000000602','a0000000-0000-0000-0000-000000000006','Banda','verde'),
('c0000000-0000-0000-0000-000000000603','a0000000-0000-0000-0000-000000000006','Rodillos','verde'),
('c0000000-0000-0000-0000-000000000604','a0000000-0000-0000-0000-000000000006','Sensores de presencia','verde');

insert into public.lecturas (maquina_id, fecha, vibracion, temperatura, presion)
select m.id, g.f,
  round((case m.id when 'a0000000-0000-0000-0000-000000000003' then 5.5 when 'a0000000-0000-0000-0000-000000000001' then 4.5 else 2.8 end
    + 1.2*sin(extract(epoch from g.f)/20000) + random()*1.6
    + case when m.id='a0000000-0000-0000-0000-000000000003' and g.f > now() - interval '3 days' then 2.5 else 0 end)::numeric, 2),
  round((55 + 8*sin(extract(epoch from g.f)/40000) + random()*10
    + case when m.id='a0000000-0000-0000-0000-000000000005' then 12 else 0 end)::numeric, 1),
  round((6 + random()*1.5)::numeric, 2)
from public.maquinas m
cross join generate_series(now() - interval '30 days', now(), interval '3 hours') g(f);

insert into public.solicitudes (maquina_id, componente_id, descripcion, prioridad, turno, estado, tecnico_id, creado_por, tiempo_paro_min, created_at) values
('a0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000301','La bomba hace ruido fuerte y pierde presión. Máquina detenida.','critica','matutino','en_proceso','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',null, now() - interval '1 day'),
('a0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000302','Fuga ligera de aceite en el sello del cilindro.','alta','vespertino','asignada','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',null, now() - interval '2 days'),
('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000101','Vibración elevada en el husillo a altas revoluciones.','alta','matutino','en_revision',null,'11111111-1111-1111-1111-111111111111',null, now() - interval '6 hours'),
('a0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000402','Indicador de filtro de aire saturado.','media','nocturno','enviada',null,'11111111-1111-1111-1111-111111111111',null, now() - interval '3 hours'),
('a0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000502','Zona 3 de calefacción tarda en llegar a temperatura.','media','vespertino','enviada',null,'11111111-1111-1111-1111-111111111111',null, now() - interval '1 hour'),
('a0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000203','Revisar nivel de lubricación central.','baja','matutino','completada','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',20, now() - interval '9 days'),
('a0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000602','Banda desalineada, se va hacia la izquierda.','media','nocturno','completada','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',45, now() - interval '12 days'),
('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000103','Bomba de refrigerante no enciende.','alta','vespertino','completada','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',90, now() - interval '15 days'),
('a0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000504','Chiller con alarma de bajo flujo.','critica','nocturno','completada','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',120, now() - interval '20 days'),
('a0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000401','Ruido anormal en arranque del motor.','alta','matutino','completada','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',60, now() - interval '25 days');

insert into public.servicios (solicitud_id, maquina_id, componente_id, tecnico_id, turno, trabajo, resultado, tiempo_paro_min, fecha)
select s.id, s.maquina_id, s.componente_id, s.tecnico_id, s.turno,
  case s.prioridad when 'critica' then 'Reemplazo de pieza dañada y prueba de funcionamiento' when 'alta' then 'Diagnóstico, reparación y ajuste' else 'Ajuste y lubricación' end,
  'Equipo operando normalmente', s.tiempo_paro_min, s.created_at + interval '5 hours'
from public.solicitudes s where s.estado = 'completada';

insert into public.alertas (tipo, mensaje, enlace) values
('rojo','Prensa hidráulica: Bomba hidráulica pasó a falla crítica','/maquinas/a0000000-0000-0000-0000-000000000003');
