import { MainLayout } from "../../components/templates/MainLayout";
import { PageTransition } from "../../components/templates/PageTransition";
import { Card } from "../../components/molecules/Card";
import { Button } from "../../components/atoms/Button";

export function HomePage() {
  return (
    <MainLayout title="Gestión de Ventas">
      <PageTransition>
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              Bienvenido
            </h2>
            <p className="text-text-secondary">
              Sistema de gestión de ventas. Navega por las secciones para
              administrar ventas, clientes y productos.
            </p>
          </section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Ventas" variant="elevated" padding="md">
              <p className="text-text-secondary text-sm mb-3">
                Registro y consulta de ventas.
              </p>
              <Button variant="primary" size="sm">
                Ir a Ventas
              </Button>
            </Card>
            <Card title="Clientes" variant="elevated" padding="md">
              <p className="text-text-secondary text-sm mb-3">
                Gestión de clientes.
              </p>
              <Button variant="secondary" size="sm">
                Ir a Clientes
              </Button>
            </Card>
            <Card title="Productos" variant="elevated" padding="md">
              <p className="text-text-secondary text-sm mb-3">
                Catálogo de productos.
              </p>
              <Button variant="ghost" size="sm">
                Ir a Productos
              </Button>
            </Card>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
