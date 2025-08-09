import { faCheckCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Hero from '../components/Hero';
import { Shield, Zap, Settings } from 'lucide-react';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const scriptUrl = 'https://sunshine-aio.com/script.ps1';

  return (
    <div>
      <Hero />

      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('home.whyChoose.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Shield className="h-16 w-16 text-sunshine-violet dark:text-sunshine-violet mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home.features.allInOne.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.allInOne.description')}
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Zap className="h-16 w-16 text-sunshine-violet dark:text-sunshine-violet mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home.features.quickSetup.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.quickSetup.description')}
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Settings className="h-16 w-16 text-sunshine-violet dark:text-sunshine-violet mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home.features.preConfigured.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.features.preConfigured.description')}
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('hero.commandNote')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                {t('hero.powershellNote')}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="p-6 shadow-xl w-full max-w-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 dark:from-gray-900/90 dark:to-gray-800/90 rounded-2xl border border-gray-700/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <pre className="text-sm leading-relaxed flex-1 text-center">
                    <code className="block break-all">
                      <span className="token keyword">irm</span> <span className="token string">{scriptUrl}</span> <span className="token operator">| iex</span>
                    </code>
                  </pre>

                  <CopyToClipboard
                    text={`irm ${scriptUrl} | iex`}
                    onCopy={() => setCopied(true)}
                  >
                    <button
                      type="button"
                      className="bg-gradient-to-r from-sunshine-violet to-sunshine-blue hover:from-sunshine-violet/80 hover:to-sunshine-blue/80 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl px-6 py-3 inline-flex items-center justify-center gap-2 min-w-[120px] transform hover:-translate-y-0.5"
                    >
                      {copied ? (
                        <>
                          <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
                          <span>{t('hero.copiedButton')}</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
                          <span>{t('hero.copyButton')}</span>
                        </>
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wiki Section */}
      <section className="py-20 bg-gradient-to-br from-sunshine-violet/5 to-sunshine-blue/5 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.wiki.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            {t('home.wiki.subtitle')}
          </p>
          <a
            href="https://github.com/LeGeRyChEeSe/Sunshine-AIO/wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-sunshine-violet to-sunshine-blue text-white rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            {t('home.wiki.button')}
            <FontAwesomeIcon icon={faCheckCircle} className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}