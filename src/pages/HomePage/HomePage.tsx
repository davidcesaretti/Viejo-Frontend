import { MainLayout } from "../../components/templates/MainLayout";
import { Card } from "../../components/molecules/Card";
import { Button } from "../../components/atoms/Button";

export function HomePage() {
  return (
    <MainLayout title="Gestión de Ventas">
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-text mb-2">Bienvenido</h2>
          <p className="text-text-muted">
            Sistema de gestión de ventas. Navega por las secciones para
            administrar ventas, clientes y productos.
          </p>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Ventas">
            <p className="text-text-muted text-sm mb-3">
              Registro y consulta de ventas.
            </p>
            <Button variant="primary" size="sm">
              Ir a Ventas
            </Button>
          </Card>
          <Card title="Clientes">
            <p className="text-text-muted text-sm mb-3">Gestión de clientes.</p>
            <Button variant="secondary" size="sm">
              Ir a Clientes
            </Button>
          </Card>
          <Card title="Productos">
            <p className="text-text-muted text-sm mb-3">
              Catálogo de productos.
            </p>
            <Button variant="outline" size="sm">
              Ir a Productos
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
