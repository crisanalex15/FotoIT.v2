import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const metadata = {
  title: 'Despre',
  description: 'Află mai multe despre aplicația noastră',
};

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Despre Noi
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Misiunea Noastră</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Această aplicație este un exemplu complet de arhitectură frontend
              modernă construită cu Next.js. Demonstrează cele mai bune
              practici pentru dezvoltarea aplicațiilor web moderne.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Scopul nostru este de a oferi o bază solidă pentru dezvoltarea
              aplicațiilor web scalabile și performante.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tehnologii</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• <strong>Next.js 16</strong> - Framework React pentru producție</li>
              <li>• <strong>TypeScript</strong> - Type-safe JavaScript</li>
              <li>• <strong>Tailwind CSS</strong> - Framework CSS utility-first</li>
              <li>• <strong>React 19</strong> - Biblioteca UI modernă</li>
              <li>• <strong>App Router</strong> - Sistem de routing modern</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caracteristici</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>✅ Componente reutilizabile și modulare</li>
              <li>✅ TypeScript pentru siguranță la nivel de tipuri</li>
              <li>✅ Stilizare modernă cu Tailwind CSS</li>
              <li>✅ Dark mode support</li>
              <li>✅ Responsive design</li>
              <li>✅ Custom hooks și utilitare</li>
              <li>✅ Structură de foldere organizată</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

