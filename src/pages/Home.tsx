import Hero from '../components/Hero';
import { Download, Shield, Zap, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <Hero />

      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.whyChoose.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('home.whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
              <Shield className="h-12 w-12 text-sunshine-violet dark:text-sunshine-violet mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('home.features.allInOne.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.features.allInOne.description')}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
              <Zap className="h-12 w-12 text-sunshine-violet dark:text-sunshine-violet mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('home.features.quickSetup.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.features.quickSetup.description')}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
              <Settings className="h-12 w-12 text-sunshine-violet dark:text-sunshine-violet mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('home.features.preConfigured.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.features.preConfigured.description')}
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <a
              href="https://github.com/LeGeRyChEeSe/Sunshine-AIO/releases/latest"
              className="inline-flex items-center px-8 py-3 bg-gradient-sunshine text-white rounded-full font-semibold hover:opacity-90 transition shadow-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {t('home.downloadButton')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}