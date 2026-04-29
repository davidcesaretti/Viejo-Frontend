import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/templates/MainLayout";
import { Button } from "../../components/atoms/Button";

const sections = [
  {
    to: "/ventas",
    label: "Ventas",
    description: "Registrá y consultá las ventas de tus clientes.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    to: "/clientes",
    label: "Clientes",
    description: "Administrá tu cartera de clientes y sus cuentas.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
  },
  {
    to: "/productos",
    label: "Productos",
    description: "Catálogo de productos disponibles para la venta.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    to: "/stock",
    label: "Stock",
    description: "Cargamentos de stock por producto con precio y descuento.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    color: "bg-amber-50 text-amber-600",
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <MainLayout title="Inicio">
      <div className="ds-page max-w-4xl">
        {/* Hero */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Bienvenido
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Sistema de gestión de ventas. Accedé a las secciones desde el menú
            o los accesos rápidos de abajo.
          </p>
        </div>

        {/* Quick access cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <button
              key={s.to}
              type="button"
              onClick={() => navigate(s.to)}
              className="group flex flex-col gap-4 rounded-xl border border-border-light bg-bg-secondary p-5 text-left shadow-sm transition-all hover:border-border-medium hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                {s.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                  {s.label}
                </p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  {s.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Acciones rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/ventas/nueva")}>
              + Nueva venta
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/clientes/nuevo")}>
              + Nuevo cliente
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/stock/nuevo")}>
              + Nuevo cargamento
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
