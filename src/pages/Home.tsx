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

          <div className="text-center">
            <div className="mt-16 mb-6">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('hero.commandNote')}
              </h2>
            </div>

            <div className="flex items-center justify-center">
              <div className="p-4 shadow-md w-max max-w-full h-max overflow-hidden flex flex-wrap bg-gradient-to-br from-gray-800/90 to-gray-700/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl items-center justify-center">
                <pre className="text-sm leading-relaxed overflow-wrap whitespace-pre-wrap mr-4 items-center inline-flex">
                  <code>
                    <span className="token keyword">irm</span> <span className="token string">{scriptUrl}</span> | <span className="token operator">iex</span>
                  </code>
                </pre>

                <div className="flex flex-col items-end gap-4 flex-wrap">
                  <CopyToClipboard
                    text={`irm ${scriptUrl} | iex`}
                    onCopy={() => setCopied(true)}
                  >
                    <button
                      type="button"
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition shadow-lg px-4 py-3 inline-flex items-center justify-center w-auto"
                    >
                      {copied ? (
                        <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
                      ) : (
                        <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}