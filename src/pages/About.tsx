import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="py-12 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('about.title')}
          </h1>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('about.overview.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('about.overview.description')}
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/LeGeRyChEeSe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gradient-sunshine text-white rounded-full font-semibold hover:opacity-90 transition"
              >
                <Github className="h-5 w-5 mr-2" />
                LeGeRyChEeSe
              </a>
            </div>
          </div>

          <div className="bg-gradient-sunshine rounded-xl p-8 text-white backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">
              {t('about.collaboration.title')}
            </h2>
            <p className="mb-4">{t('about.collaboration.description')}</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a
                  href="https://github.com/LeGeRyChEeSe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LeGeRyChEeSe
                </a>
                {' - '}
                {t('about.collaboration.roles.creator')}
              </li>
              <li>
                <a
                  href="https://bolt.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Bolt.new
                </a>
                {' - '}
                {t('about.collaboration.roles.website')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}