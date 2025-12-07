import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import ContactForm from '@/components/forms/ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Ia legătura cu noi',
};

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Contactează-ne
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Ai întrebări? Suntem aici să te ajutăm!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trimite un mesaj</CardTitle>
            <CardDescription>
              Completează formularul de mai jos și îți vom răspunde cât mai
              curând posibil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:contact@example.com"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                contact@example.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Telefon</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="tel:+40123456789"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                +40 123 456 789
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

