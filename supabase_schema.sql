-- =============================================
-- SCHEMA - Plataforma Encadenados
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

-- Tabla de propiedades
create table if not exists properties (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  address text,
  capacity int default 2,
  bedrooms int default 1,
  bathrooms int default 1,
  price_per_night int default 0,
  amenities text[] default '{}',
  images text[] default '{}',
  owner_name text,
  owner_phone text,
  created_at timestamp with time zone default now()
);

-- Tabla de disponibilidad (una fila por día por propiedad)
create table if not exists availability (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade,
  date date not null,
  is_available boolean default true,
  created_at timestamp with time zone default now(),
  unique(property_id, date)
);

-- Índices para búsqueda rápida
create index if not exists idx_availability_date on availability(date);
create index if not exists idx_availability_property on availability(property_id);
create index if not exists idx_availability_available on availability(is_available);

-- Habilitar Row Level Security
alter table properties enable row level security;
alter table availability enable row level security;

-- Políticas: lectura pública para todos
create policy "Propiedades visibles públicamente"
  on properties for select using (true);

create policy "Disponibilidad visible públicamente"
  on availability for select using (true);

-- Políticas: inserción pública (para el formulario de propietarios)
-- En producción: agregar autenticación y restringir esto
create policy "Propietarios pueden registrarse"
  on properties for insert with check (true);

-- =============================================
-- DATOS DE PRUEBA (opcional, para testear)
-- =============================================

insert into properties (name, description, address, capacity, bedrooms, bathrooms, price_per_night, owner_name, owner_phone, images)
values
  (
    'Casa La Dunas',
    'Casa amplia a 2 cuadras del mar, con patio y parrilla.',
    'Calle 25 N°480, Monte Hermoso',
    6, 3, 2, 120000,
    'Carlos Méndez', '+54 291 4123456',
    array['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80']
  ),
  (
    'Depto El Faro',
    'Departamento moderno con vista al mar, capacidad para 4 personas.',
    'Av. Costanera 1200, Monte Hermoso',
    4, 2, 1, 95000,
    'Laura Pérez', '+54 291 4234567',
    array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80']
  ),
  (
    'Cabaña Los Médanos',
    'Cabaña rústica con deck, ideal para parejas o familias pequeñas.',
    'Barrio Médanos, Monte Hermoso',
    4, 2, 1, 85000,
    'Martín Ruiz', '+54 291 4345678',
    array['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&q=80']
  );

-- Disponibilidad de prueba: enero 2026
-- Casa La Dunas: disponible 5-12 enero
insert into availability (property_id, date, is_available)
select
  p.id,
  generate_series('2026-01-05'::date, '2026-01-11'::date, '1 day')::date,
  true
from properties p where p.name = 'Casa La Dunas';

-- Depto El Faro: disponible 10-18 enero
insert into availability (property_id, date, is_available)
select
  p.id,
  generate_series('2026-01-10'::date, '2026-01-17'::date, '1 day')::date,
  true
from properties p where p.name = 'Depto El Faro';

-- Cabaña Los Médanos: disponible 15-22 enero
insert into availability (property_id, date, is_available)
select
  p.id,
  generate_series('2026-01-15'::date, '2026-01-21'::date, '1 day')::date,
  true
from properties p where p.name = 'Cabaña Los Médanos';
