# Encadenados 🌊

> *"Cuando todo está lleno, nosotros te hacemos lugar."*

Plataforma de encadenamiento inteligente de estadías turísticas para Monte Hermoso.
Combina propiedades con disponibilidad fragmentada para ofrecer estadías completas.

---

## ¿Qué hace?

- **Buscador por fechas** — el turista ingresa llegada y salida
- **Algoritmo de encadenamiento** — detecta combinaciones de propiedades que cubren toda la estadía
- **Listado de propiedades** — con fotos, precios y características
- **Formulario para propietarios** — para sumar propiedades a la plataforma

---

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + API)
- **Tailwind CSS**
- **Vercel** (deploy)

---

## Setup paso a paso

### 1. Clonar el repo

```bash
git clone https://github.com/TU_USUARIO/encadenados.git
cd encadenados
npm install
```

### 2. Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratuita
2. Hacé clic en **New Project**
3. Poné de nombre `encadenados`, elegí una contraseña y la región `South America (São Paulo)`
4. Esperá ~2 minutos a que se inicialice

### 3. Crear las tablas

1. En el dashboard de Supabase, andá a **SQL Editor**
2. Copiá todo el contenido de `supabase_schema.sql`
3. Pegalo y hacé clic en **Run**
4. Vas a ver las tablas `properties` y `availability` creadas, con 3 propiedades de prueba

### 4. Obtener las keys de Supabase

1. En el dashboard, andá a **Settings → API**
2. Copiá:
   - **Project URL** → `https://xxxxxxxx.supabase.co`
   - **anon public key** → `eyJhbGci...`

### 5. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

### 6. Correr localmente

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) — vas a ver la plataforma funcionando.

Para probar el encadenamiento, buscá fechas **5 al 20 de enero 2026** — el sistema debería combinar las 3 propiedades de prueba.

---

## Deploy en Vercel

### 1. Subir a GitHub

```bash
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/encadenados.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Entrá a [vercel.com](https://vercel.com) y logueate con GitHub
2. Hacé clic en **Add New → Project**
3. Seleccioná el repo `encadenados`
4. En **Environment Variables**, agregá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Hacé clic en **Deploy**

En ~2 minutos tenés una URL pública como `encadenados.vercel.app`.

Cada vez que hagas `git push`, Vercel redespliega automáticamente.

---

## Estructura del proyecto

```
encadenados/
├── app/
│   ├── api/chain/route.ts      ← API del algoritmo de encadenamiento
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SearchBar.tsx
│   │   ├── PropertyGrid.tsx
│   │   └── ChainResults.tsx
│   ├── propietarios/page.tsx   ← Formulario para propietarios
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                ← Home
├── lib/
│   ├── supabase.ts             ← Cliente y tipos
│   └── chain.ts                ← Algoritmo de encadenamiento
├── supabase_schema.sql         ← Schema de base de datos
└── .env.local.example
```

---

## Próximos pasos

- [ ] Sistema de contacto / WhatsApp al propietario
- [ ] Panel de propietario para cargar disponibilidad
- [ ] Fotos reales de propiedades (Supabase Storage)
- [ ] Formulario de reserva con datos del turista
- [ ] Dominio propio (encadenados.com.ar)

---

## Datos de prueba

El schema incluye 3 propiedades con disponibilidad encadenada para testear:

| Propiedad | Disponible |
|-----------|-----------|
| Casa La Dunas | 5 al 12 enero |
| Depto El Faro | 10 al 18 enero |
| Cabaña Los Médanos | 15 al 22 enero |

Buscá **5 al 22 enero 2026** para ver el encadenamiento completo de las 3 propiedades.
