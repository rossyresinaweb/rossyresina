# Rossy Resina — Tienda Online

Tienda e-commerce para la venta de resina epóxica, moldes de silicona, pigmentos y accesorios para manualidades. Incluye panel de administración, sistema de pedidos, reseñas, capacitaciones y analíticas de visitas.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [Next.js 13](https://nextjs.org/) | Framework principal (páginas, rutas, API) |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos y diseño responsivo |
| [Prisma](https://www.prisma.io/) | ORM para base de datos |
| [PostgreSQL](https://www.postgresql.org/) | Base de datos |
| [NextAuth.js](https://next-auth.js.org/) | Autenticación de usuarios |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Estado global (carrito, favoritos) |
| [Cloudinary](https://cloudinary.com/) | Almacenamiento de imágenes |
| [Stripe](https://stripe.com/) | Pagos en línea |
| [Vercel](https://vercel.com/) | Deploy y hosting |

---

## Estructura del proyecto

```
rossyresinaonline/
├── prisma/                  # Esquema y migraciones de base de datos
│   ├── schema.prisma        # Modelos: Product, Order, User, Review, etc.
│   └── migrations/          # Historial de cambios en la BD
├── public/                  # Archivos estáticos (imágenes, favicon, etc.)
│   ├── products/            # Imágenes de productos
│   └── creations/           # Creaciones de la comunidad
├── scripts/                 # Scripts utilitarios para migración y mantenimiento
├── src/
│   ├── components/          # Componentes reutilizables de React
│   │   ├── admin/           # Componentes exclusivos del panel admin
│   │   └── header/          # Barra de navegación y header
│   ├── lib/                 # Lógica de negocio y acceso a datos
│   │   ├── repositories/    # Consultas directas a la base de datos
│   │   └── services/        # Servicios que combinan repositorios
│   ├── pages/               # Rutas del sitio (cada archivo = una URL)
│   │   ├── admin/           # Panel de administración (protegido)
│   │   ├── api/             # Endpoints del backend (REST API)
│   │   ├── _app.tsx         # Layout global y configuración de la app
│   │   ├── _document.tsx    # HTML base (head, meta tags, fuentes)
│   │   └── index.tsx        # Página principal
│   ├── store/               # Estado global con Redux
│   ├── styles/              # Archivos CSS organizados por responsabilidad
│   │   ├── globals.css      # Estilos base e imports
│   │   ├── animations.css   # Keyframes y clases de animación
│   │   ├── components.css   # Botones, badges, alertas, navbar
│   │   ├── layout.css       # Grid, columnas y espaciados
│   │   └── compat.css       # Compatibilidad con librerías externas
│   └── types/               # Tipos TypeScript personalizados
└── type.d.ts                # Tipos globales del proyecto
```

---

## Modelos de base de datos

- **User** — Clientes y administradores con roles (ADMIN, EDITOR, CUSTOMER)
- **Product** — Productos con precio, stock, imágenes y categoría
- **Order** — Pedidos con datos del cliente, items y estado (PENDING, PAID, SHIPPED)
- **Review** — Reseñas de productos por usuario
- **Category** — Categorías de productos
- **SubscriberProfile** — Perfiles de la comunidad de capacitaciones
- **WebVisitEvent / WebVisitorProfile** — Analíticas de visitas al sitio

---

## Instalación y configuración local

### 1. Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/) corriendo localmente o en la nube (ej. [Neon](https://neon.tech/), [Supabase](https://supabase.com/))

### 2. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd rossyresinaonline
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus datos reales (ver sección de Variables de entorno más abajo).

### 4. Configurar la base de datos

```bash
# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Ver la base de datos en el navegador
npx prisma studio
```

### 5. Correr el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_bd

# Autenticación (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=una_clave_secreta_muy_larga

# Panel de administración
ADMIN_PASSWORD=contraseña_del_admin
ADMIN_EMAILS=correo@ejemplo.com

# Cloudinary (subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Datos públicos del negocio
NEXT_PUBLIC_YAPE_NUMBER=999999999
NEXT_PUBLIC_CONTACT_PHONE=999999999
NEXT_PUBLIC_BANK_NAME=Nombre del banco
NEXT_PUBLIC_BANK_ACCOUNT=Número de cuenta
NEXT_PUBLIC_BANK_CCI=CCI
NEXT_PUBLIC_ACCOUNT_HOLDER=Nombre del titular
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Rossy Resina

# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=

# Stripe (pagos, opcional)
# STRIPE_SECRET_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (emails, opcional)
RESEND_API_KEY=
RESEND_FROM_EMAIL=Rossy Resina <no-reply@tudominio.com>
```

---

## Scripts disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Compila el proyecto para producción
npm run start        # Inicia el servidor en modo producción
npm run lint         # Revisa errores de código con ESLint
```

### Scripts de mantenimiento

```bash
node scripts/migrate-products-to-prisma.js   # Migra productos desde JSON a la BD
node scripts/reset-admin.js                  # Resetea la contraseña del administrador
node scripts/sync-skus-to-db.js              # Sincroniza SKUs a la base de datos
```

---

## Deploy en Vercel

El proyecto está configurado para desplegarse en Vercel.

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega todas las variables de entorno en el panel de Vercel
3. Vercel detecta automáticamente que es un proyecto Next.js y lo despliega

> **Importante:** Asegúrate de que `DATABASE_URL` apunte a una base de datos accesible desde internet (no `localhost`).

---

## Acceso al panel de administración

La ruta del panel admin es `/admin`. Para ingresar necesitas:

- Un correo registrado en `ADMIN_EMAILS`
- La contraseña definida en `ADMIN_PASSWORD`

Desde el panel puedes gestionar productos, pedidos, usuarios, categorías, capacitaciones, blog y ver analíticas de visitas.

---

## Notas para el desarrollador

- El proyecto usa **Pages Router** de Next.js (no App Router) — todas las páginas están en `src/pages/`
- Los estilos están divididos en `src/styles/` por responsabilidad para facilitar el mantenimiento
- El estado del carrito y favoritos se persiste en `localStorage` usando `redux-persist`
- Las imágenes de productos se suben a **Cloudinary** desde el panel admin
- La autenticación usa **NextAuth** con credenciales (email + contraseña hasheada con bcrypt)
