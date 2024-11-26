import { useState } from 'react';
import { useFormSubmit } from '../../hooks/useFormSubmit';
import SuccessMessage from './SuccessMessage';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const { submitForm } = useFormSubmit();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await submitForm(e.currentTarget);
    if (success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return <SuccessMessage />;
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
    >
      <input type="hidden" name="form-name" value="contact" />
      <div hidden>
        <input name="bot-field" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Contact Us
      </h1>

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            required
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-sunshine text-white rounded-lg font-semibold hover:opacity-90 transition"
        >
          Send Message
        </button>
      </div>
    </form>
  );
}