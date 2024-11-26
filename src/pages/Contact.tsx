import ContactForm from '../components/forms/ContactForm';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}