import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as Record<string, string>).toString()
    })
    .then(() => {
      setIsSubmitted(true);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-8 shadow-lg text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('contact.thankYou.title')}
              </h2>
              <p className="text-gray-300 mb-8">
                {t('contact.thankYou.message')}
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
              >
                {t('contact.thankYou.backHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            className="bg-gray-900 rounded-xl p-8 shadow-lg"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="form-name" value="contact" />
            <input type="hidden" name="language" value={i18n.language} />
            <div hidden>
              <input name="bot-field" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-8">
              {t('contact.title')}
            </h1>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-sunshine-violet"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-sunshine-violet"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                  {t('contact.form.category')}
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-sunshine-violet"
                >
                  <option value="">{t('contact.form.selectCategory')}</option>
                  <option value="tool-issue">{t('contact.form.categories.tool-issue')}</option>
                  <option value="installation">{t('contact.form.categories.installation')}</option>
                  <option value="configuration">{t('contact.form.categories.configuration')}</option>
                  <option value="performance">{t('contact.form.categories.performance')}</option>
                  <option value="compatibility">{t('contact.form.categories.compatibility')}</option>
                  <option value="feature-request">{t('contact.form.categories.feature-request')}</option>
                  <option value="website">{t('contact.form.categories.website')}</option>
                  <option value="other">{t('contact.form.categories.other')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-sunshine-violet"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition"
              >
                {t('contact.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}