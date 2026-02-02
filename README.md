# Gestión de Ventas (Frontend)

Proyecto React con **Atomic Design**, pensado para la gestión de ventas de un negocio familiar.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** para estilos
- **Zod** + **React Hook Form** + **@hookform/resolvers** para formularios y validación
- **React Router** para rutas y páginas
- **Modo claro / oscuro** con persistencia en `localStorage` y tokens de color semánticos
- **Auth**: login, guards por ruta y por rol (`admin` / `vendedor`), cookie httpOnly para peticiones autenticadas

## Autenticación y permisos

- **Login**: pantalla en `/login` (email + contraseña mín. 6 caracteres). El backend responde con `user` + `access_token` y setea una cookie httpOnly; el resto de peticiones usan `credentials: "include"`.
- **Servicio**: `src/services/auth.service.ts` — `login(body)`, `getCurrentUser()` (GET `/auth/me` al cargar la app), `logout()` (POST `/auth/logout` si existe).
- **Contexto**: `useAuth()` devuelve `user`, `isAuthenticated`, `login`, `logout`, `hasRole(role)`, `hasAnyRole(roles)`.
- **Guards**:
  - `ProtectedRoute`: exige estar logueado; si no, redirige a `/login` (guardando la ruta para volver).
  - `GuestOnlyRoute`: solo para no logueados (p. ej. `/login`); si ya está logueado, redirige a la ruta guardada o `/`.
  - `RequireRole`: exige estar logueado y tener al menos uno de los roles indicados (`allowedRoles`); si no, redirige a `fallbackTo` (por defecto `/`).
- **Roles** (en `src/types/auth.ts`): `"admin"` y `"vendedor"`. Para nuevas rutas por rol, envolver con `<RequireRole allowedRoles={["admin"]} fallbackTo="/">`.

Configurar la URL de la API en `.env`: `VITE_API_URL=http://localhost:3000` (ver `.env.example`).

## Modo claro y modo oscuro

El tema se controla con la clase `.dark` en `<html>` y se persiste en `localStorage` (clave `app-theme`). Si el usuario no eligió tema, se usa la preferencia del sistema (`prefers-color-scheme`).

- **`ThemeProvider`** (en `main.tsx`): aplica el tema al documento y sincroniza con `localStorage`.
- **`useTheme()`**: devuelve `{ theme, setTheme, toggleTheme, isDark }`.
- **`ThemeToggle`**: botón átomo (sol/luna) para alternar; está en el header del `MainLayout`.

Los estilos usan **tokens semánticos** definidos en `src/index.css` (`@theme` y `@theme dark:`), así todos los componentes se adaptan al tema sin duplicar clases:

| Token                                     | Uso               |
| ----------------------------------------- | ----------------- |
| `bg-bg`, `bg-surface`, `bg-surface-muted` | Fondos            |
| `text-text`, `text-text-muted`            | Texto             |
| `border-border`, `border-border-focus`    | Bordes            |
| `bg-accent`, `bg-danger`, etc.            | Botones y estados |

Para nuevos componentes, usá estos tokens (p. ej. `className="bg-surface text-text"`) en lugar de colores fijos como `bg-white` o `text-slate-800`.

## Estructura (Atomic Design)

```
src/
├── components/
│   ├── atoms/          # Componentes simples y reutilizables
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Select/
│   │   └── ThemeToggle/
│   ├── molecules/      # Combinación de átomos (formularios, cards, etc.)
│   │   ├── Card/
│   │   └── FormField/
│   └── templates/      # Layouts que combinan átomos y moléculas
│       └── MainLayout/
├── contexts/           # React Context (ThemeProvider, AuthProvider, useAuth)
├── guards/             # ProtectedRoute, GuestOnlyRoute, RequireRole
├── pages/              # Páginas que renderizan un template + contenido
│   ├── HomePage/
│   └── LoginPage/
├── services/           # API client (credentials: include) y auth.service
├── lib/                # Utilidades, schemas Zod, helpers
│   └── schemas/
├── types/              # Tipos e interfaces globales
├── App.tsx
├── main.tsx
└── index.css
```

- **Atoms**: botones, inputs, selects, labels.
- **Molecules**: FormField (label + input/select + error), Card, etc.
- **Templates**: MainLayout (header + main). Definen la vista de una pantalla.
- **Pages**: usan un template y componen la pantalla; se montan en rutas.

## Uso de formularios (Zod + React Hook Form)

Ejemplo con `FormField` (requiere estar dentro de `FormProvider`):

```tsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { exampleFormSchema, type ExampleFormValues } from "@/lib/schemas";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";

function MiFormulario() {
  const methods = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: { nombre: "", email: "", categoria: "" },
  });

  const onSubmit = methods.handleSubmit((data) => console.log(data));

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <FormField name="nombre" label="Nombre" required />
        <FormField name="email" label="Email" inputType="email" />
        <FormField
          name="categoria"
          type="select"
          label="Categoría"
          options={[]}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </FormProvider>
  );
}
```

Los schemas Zod están en `src/lib/schemas/`. Podés extender o reemplazar `exampleForm.ts` según ventas, clientes, productos, etc.

## Alias

Se usa el alias `@/` para importar desde `src/`:

- `@/components` → `src/components`
- `@/pages` → `src/pages`
- `@/lib` → `src/lib`
- `@/types` → `src/types`

## Comandos

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run preview` — previsualizar build
- `npm run lint` — ESLint

## Próximos pasos

- Añadir más páginas (Ventas, Clientes, Productos) y rutas
- Definir schemas Zod y tipos para ventas, clientes, productos
- Conectar con API/backend cuando esté definido
