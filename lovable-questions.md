# Preguntas para el Frontend en Lovable (One-Shot)

> **Contexto:** Este frontend se generará en Lovable (versión gratuita, un solo prompt). La lógica de conexión al backend (login real, registro real, cookies JWT) la implementaremos manualmente después. Por ahora, el frontend debe tener **todos los componentes visuales funcionales** aunque los botones de autenticación no ejecuten llamadas reales al backend todavía.

---

## 1. Identidad y Branding

- **¿Cómo se llama la aplicación?**  
  _(Ej: "DentaManager", "OdontoSoft", "Consultorio Pro", "Dentia"...)_
  ConsultorioManager
- **¿Tienen un logo o imagen de marca?** ¿Querés que Lovable genere un ícono/tipografía representativa?
si que genere un logo relacionado con la marca
- **¿Qué paleta de colores preferís?**  
  Basado en las referencias visuales proporcionadas (estilo MedilLink), se busca un diseño **profesional médico** con:
  - **Sidebar izquierdo:** Fondo azul oscuro (slate/navy), íconos y texto en blanco/gris claro. Item activo resaltado con azul más brillante o fondo semitransparente.
  - **Área de contenido:** Fondo blanco o gris muy claro (`bg-gray-50` / `#F8FAFC`).
  - **Cards / Paneles:** Fondo blanco, bordes redondeados (`rounded-xl` o `rounded-2xl`), sombra suave (`shadow-sm`).
  - **Botón primario:** Azul vibrante (ej. `#2563EB`, blue-600).
  - **Badges de estado:** Verde (success/confirmed), Rojo (danger/cancelled), Naranja/Amarillo (warning/pending), Azul claro (info/new).
  - **Tipografía:** Sans-serif moderna y legible (Inter, Roboto, o similar), tamaños limpios sin ser excesivamente grandes.

---

## 2. Estructura de Pantallas (Primera Entrega)

- **¿Qué páginas existen en esta primera entrega?**  
  Por ahora pensamos en: Landing / Login / Registro / Dashboard. ¿Falta alguna?
  no falta ninguna
- **¿El Dashboard muestra algo aunque sea placeholder?**  
  Por ejemplo: cards vacías de "Próximos turnos", "Pacientes del mes", "Obras sociales" —para que se vea el potencial aunque no haya datos reales todavía. 
  Si que muestre eso
- **¿Querés una landing page de marketing** (con hero section, features, CTA a registrarse) o entrás directo al login?
que entre directo al login por ahora.
---

## 3. Diseño del Login y Registro

- **¿Login en página aparte o en modal/popup?**
- **¿Qué campos en el registro?**  
  Username + password (como ahora) o agregamos email, nombre del consultorio, teléfono?
  si agrega esos campos
- **¿Querés "Recordarme" o "Olvidé mi contraseña" visualmente aunque no funcione todavía?**
por ahora no
- **¿Validaciones visuales en los formularios?**  
  Ej: campo vacío en rojo, contraseña muy corta, formato de email incorrecto... (solo frontend, sin backend).
si
---

## 4. Layout del Dashboard (Placeholder / Maqueta)

- **¿Sidebar de navegación con items?**  
  Por ejemplo: Agenda, Pacientes, Obras Sociales, Pagos, Historias Clínicas —todos deshabilitados o con "Próximamente". 
  si que aparezcan con proximamente
- **¿Header con foto de perfil / nombre del usuario logueado?**
si,
- **¿Footer en el dashboard o no?**
por ahora no
- **¿Breadcrumb o título de página en cada sección?**
si queda visualmente bien si, sino no decidilo vos
---

## 5. Responsive y Mobile

- **¿Prioridad mobile-first o desktop-first?**  
  (Ya dijiste que se vea en celular con flexbox, ¿pero el diseño principal es para escritorio?)
  si a priori el diseno principal es para escritorio de PC
- **¿El sidebar se convierte en menú hamburguesa en mobile?**
si
- **¿El login/registro también se adapta a pantallas chicas?**
si

---

## 6. Referencias Visuales

- **Referencia principal:** Estilo similar a **MedilLink** (dashboard médico moderno). Ver screenshots adjuntos.
- **¿Querés que el diseño sea sobrio/profesional (tipo clínica) o más moderno/amigable?**
  Profesional pero moderno. Queremos que se sienta como una aplicación SaaS de gestión médica, no un Excel con colores.
- **¿Preferís mucho espacio en blanco (minimalista) o pantallas con mucha información visible?**
  Balanceado: mucho aire en el layout general (padding generoso, gaps entre cards), pero con tablas densas de datos cuando corresponda (agenda, pacientes).

---

## 7. Detalles Finales

- **¿Modo oscuro (dark mode) o solo claro?**
si, usa el componente de shadcn para esto
- **¿Animaciones de carga/spinner al "iniciar sesión"?**  
  (Visual, aunque no haga nada en el backend todavía.)
- **¿Mensaje de error genérico en los formularios?**  
  Ej: "Credenciales incorrectas" en rojo, aunque no esté conectado al backend.
- **¿Toast de éxito al "registrarse"?**  
  Ej: "Cuenta creada exitosamente" (mock/visual).
- **¿Página de 404 personalizada?**
- **¿Loading skeletons en el dashboard mientras "carga" el contenido?**

---

## 8. Extras de Lovable

- **¿Querés que incluya tipografía custom o fuentes de Google (Inter, Poppins, etc.)?**
  Inter o similar (sans-serif moderna, legible, usada en sistemas médicos profesionales).
- **¿Iconos con Lucide React (default de shadcn) o preferís otra librería?**
  Lucide React está bien, asegurar que en el sidebar izquierdo sean line icons (outline) limpios.
- **¿Gradientes, glassmorphism, o diseño plano (flat)?**
  Diseño plano pero con profundidad sutil: sombras suaves en cards (`shadow-sm`), superficies limpias sin glassmorphism. Sin gradientes llamativos en el fondo general. El sidebar puede tener un degradado sutil de azul oscuro si ayuda a la jerarquía, pero manteniendo sobriedad.

---

> **Nota:** Una vez respondidas estas preguntas, armaremos el **mega prompt de Lovable** en un archivo `lovable-prompt.md` listo para copiar y pegar en la plataforma.
