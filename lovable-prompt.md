# Mega Prompt para Lovable - ConsultorioManager

> **CRÍTICO:** Solo generar el **FRONTEND**. No tocar lógica de backend, no APIs, no base de datos. La conexión al backend (login real, cookies JWT, etc.) la implementaremos manualmente después. El idioma de toda la interfaz debe ser **ESPAÑOL**.

## Tecnologías obligatorias
- React + Vite
- Tailwind CSS
- **shadcn/ui** (usar componentes EXISTENTES de shadcn, no crear componentes custom: `Button`, `Input`, `Card`, `Label`, `Badge`, `Skeleton`, `DropdownMenu`, `Avatar`, `Switch`, `Sheet`, `Tabs`, `Table`, `Form`, `Select`, `Dialog`, `Toast`/`Sonner`, etc.)
- Lucide React (iconos outline)
- React Router DOM v6
- Inter como fuente principal

## Identidad
- Nombre: **ConsultorioManager**
- Logo: generar un ícono/logo vectorial relacionado con consultorio médico/odontológico
- Idioma: **español en todo el texto visible**

## Paleta de colores (estilo MedilLink - SaaS médico profesional)
- **Sidebar izquierdo:** fondo slate/navy oscuro (`bg-slate-900` o similar), íconos y texto blanco/gris claro. Item activo con azul brillante o fondo semitransparente.
- **Área de contenido:** fondo blanco o gris muy claro (`bg-gray-50` / `#F8FAFC`).
- **Cards / Paneles:** fondo blanco, bordes redondeados (`rounded-xl` / `rounded-2xl`), sombra suave (`shadow-sm`).
- **Botón primario:** azul vibrante (`bg-blue-600`, `#2563EB`).
- **Badges de estado:** Verde éxito, Rojo peligro, Naranja/Amarillo pendiente, Azul claro info.
- **Tipografía:** Inter, sans-serif moderna, tamaños limpios.

## Diseño general
- Profesional pero moderno (SaaS de gestión médica, NO un Excel con colores).
- Balanceado: mucho aire en el layout (padding generoso, gaps entre cards), pero tablas densas de datos cuando corresponda.
- Diseño plano con profundidad sutil: sombras suaves en cards, sin glassmorphism. Sidebar puede tener degradado sutil de azul oscuro para jerarquía, manteniendo sobriedad.
- Sin gradientes llamativos en fondos generales.

## Responsive
- Diseño principal para **escritorio PC** (desktop-first).
- El **sidebar se convierte en menú hamburguesa** en mobile.
- Login/registro se adaptan a pantallas chicas.
- Usar flexbox para todas las adaptaciones.

## Páginas a generar

### 1. Página de Login (`/login`)
- **Layout:** página aparte (no modal), centrada, fondo limpio gris claro o con patrón sutil médico.
- **Campos:** `Usuario` (username), `Contraseña` (password).
- **Botón:** "Iniciar sesión" (azul primario, loading spinner integrado en el botón).
- **Link debajo:** "¿No tenés cuenta? Registrate" → navega a `/register`.
- **Validaciones visuales:** campos vacíos en rojo, contraseña muy corta, usuario no existe (simulado visualmente).
- **Errores:** mensaje genérico en rojo bajo el formulario (ej: "Credenciales incorrectas").
- **No incluir** "Recordarme" ni "Olvidé mi contraseña" por ahora.
- Spinner de carga al "iniciar sesión" (visual, mock).

### 2. Página de Registro (`/register`)
- **Layout:** igual que login, página aparte centrada.
- **Campos:** `Nombre completo`, `Nombre de usuario`, `Correo electrónico` (email), `Nombre del consultorio`, `Teléfono`, `Contraseña`, `Confirmar contraseña`.
- **Validaciones visuales:** email con formato incorrecto, contraseñas no coinciden, campos vacíos, contraseña muy corta.
- **Botón:** "Crear cuenta" (loading spinner).
- **Toast de éxito mock:** al "registrar", mostrar toast verde "Cuenta creada exitosamente" (visual, sin backend real).
- **Link debajo:** "¿Ya tenés cuenta? Iniciar sesión" → `/login`.

### 3. Dashboard (`/dashboard`) - MAQUETA / PLACEHOLDER
- **Layout global:** Sidebar izquierdo fijo + Header superior + Área de contenido scrollable.
- **Sidebar (izquierda, navy oscuro):**
  - Logo + nombre "ConsultorioManager" arriba.
  - Items de navegación con iconos Lucide outline: Inicio, Agenda, Pacientes, Obras Sociales, Pagos, Historias Clínicas.
  - **Todos los items excepto "Inicio" deben mostrar badge "Próximamente"** o estar deshabilitados visualmente.
  - En mobile: sidebar colapsa a menú hamburguesa.
- **Header (superior, blanco):**
  - Título de la página actual con breadcrumb si queda visualmente bien.
  - A la derecha: ícono de campana (notificaciones), toggle modo oscuro/claro (usar componente shadcn Switch), avatar circular con iniciales del usuario y nombre "Dr. Usuario".
- **Área de contenido del Dashboard (Inicio):**
  - Cards de resumen con números grandes (KPIs): "Próximos turnos (0)", "Pacientes totales (0)", "Obras sociales activas (0)", "Pagos pendientes (0)".
  - **Loading skeletons** en las cards y tablas mientras "carga" el contenido (usar componente Skeleton de shadcn).
  - Placeholder de tabla: "Próximos turnos" con columnas Paciente, Fecha, Hora, Tratamiento, Estado (badges), Odontólogo. Filas vacías o con datos dummy mínimos.
  - Calendario mini mensual placeholder en el lateral (solo visual).
- **Footer:** no incluir en el dashboard.

### 4. Página 404 (`*`)
- Página personalizada: ilustración simple, "404 - Página no encontrada", botón "Volver al inicio".

## Manejo de estados (frontend only, mock)
- **AuthContext / useAuth:** mantener estado de usuario logueado en React Context (mock, hardcodeado para demo visual).
- **Formularios:** manejo manual con `useState`.
- **Fetching:** `fetch` nativo (dejar listo el service `authService.js` con funciones vacías/commented para login, logout, getCurrentUser, register).
- **Loading:** spinner en botones de submit, skeletons en dashboard.
- **Toasts:** usar componente shadcn Toast o Sonner para mensajes de éxito/error (mock visual).
- **Dark mode:** implementar toggle oscuro/claro con shadcn y Tailwind `dark:` classes.

## Estructura de archivos a generar
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/NotFoundPage.jsx`
- `src/components/Layout.jsx` (sidebar + header + outlet)
- `src/components/Sidebar.jsx`
- `src/components/Header.jsx`
- `src/contexts/AuthContext.jsx`
- `src/hooks/useAuth.js`
- `src/services/authService.js` (funciones vacías preparadas para conectar luego)
- `src/components/ui/*` (todos componentes shadcn importados, no custom)
- `src/App.jsx` (rutas con React Router DOM)

## Restricciones
- **NO crear componentes custom** si existe equivalente en shadcn/ui.
- **NO implementar lógica de backend real**: dejar comentado o con mocks.
- **Toda la UI en español**.
- Usar **JavaScript puro (.jsx)**, no TypeScript.
