import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="py-12 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-10 mb-8 shadow-xl">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/sunshine-aio-logo.png" 
                alt="Sunshine-AIO Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t('about.overview.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-center">
              {t('about.overview.description')}
            </p>

            <div className="flex items-center justify-center">
              <a
                href="https://github.com/LeGeRyChEeSe/Sunshine-AIO"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sunshine-violet to-sunshine-blue text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
              >
                <Github className="h-5 w-5 mr-2" />
                View on GitHub
              </a>
            </div>
          </div>

          <div className="bg-gradient-sunshine rounded-2xl p-10 text-white backdrop-blur-sm shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('about.collaboration.title')}
            </h2>
            <p className="mb-8 text-center text-lg">{t('about.collaboration.description')}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Github className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">LeGeRyChEeSe</h3>
                <p className="text-white/90 mb-4">{t('about.collaboration.roles.creator')}</p>
                <a
                  href="https://github.com/LeGeRyChEeSe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition duration-200"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Profile
                </a>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">C</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Claude AI</h3>
                <p className="text-white/90 mb-4">{t('about.collaboration.roles.development')}</p>
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition duration-200"
                >
                  Visit Claude.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}