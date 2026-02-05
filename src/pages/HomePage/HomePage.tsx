import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/templates/MainLayout";
import { PageTransition } from "../../components/templates/PageTransition";
import { Card } from "../../components/molecules/Card";
import { Button } from "../../components/atoms/Button";

export function HomePage() {
  const navigate = useNavigate();
  return (
    <MainLayout title="Gestión de Ventas">
      <PageTransition>
        <div className="space-y-6 animate-fade-in sm:space-y-8 pb-6 sm:pb-8">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-2 sm:text-3xl sm:mb-3 tracking-tight">
              Bienvenido
            </h2>
            <p className="text-base text-text-secondary sm:text-lg max-w-2xl">
              Sistema de gestión de ventas. Navega por las secciones para
              administrar ventas, clientes y productos.
            </p>
          </section>
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Ventas"
              variant="elevated"
              padding="md"
              className="hover:-translate-y-1 transition-transform duration-200"
            >
              <p className="text-text-secondary text-sm mb-4">
                Registro y consulta de ventas.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/ventas")}
              >
                Ir a Ventas
              </Button>
            </Card>
            <Card
              title="Clientes"
              variant="elevated"
              padding="md"
              className="hover:-translate-y-1 transition-transform duration-200"
            >
              <p className="text-text-secondary text-sm mb-4">
                Gestión de clientes.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/clientes")}
              >
                Ir a Clientes
              </Button>
            </Card>
            <Card
              title="Productos"
              variant="elevated"
              padding="md"
              className="hover:-translate-y-1 transition-transform duration-200"
            >
              <p className="text-text-secondary text-sm mb-4">
                Catálogo de productos (Papa, Cebolla, etc.).
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/productos")}
              >
                Ir a Productos
              </Button>
            </Card>
            <Card
              title="Cargamentos de stock"
              variant="elevated"
              padding="md"
              className="hover:-translate-y-1 transition-transform duration-200"
            >
              <p className="text-text-secondary text-sm mb-4">
                Cargamentos por producto: cantidad, precio y descuento.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/stock")}
              >
                Ir a Stock
              </Button>
            </Card>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
