import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCopy, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function Hero() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const scriptUrl = 'https://sunshine-aio.com/script.ps1';

  return (
    <div className="relative overflow-hidden bg-gradient-sunshine backdrop-blur-sm">
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="/guide"
              className="w-max max-w-full overflow-hidden sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition shadow-lg"
            >
              {t('hero.guideButton')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5 fas fa-arrow-right" />
            </a>
            <a
              href="https://github.com/LeGeRyChEeSe/Sunshine-AIO/wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="w-max max-w-full overflow-hidden sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition shadow-lg"
            >
              {t('hero.wikiButton')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5 fas fa-arrow-right" />
            </a>
          </div>
        </div>

        <div className="text-center">
          <div className="mt-16 mb-6 text-4xl md:text-6xl font-bold text-white">
            <h2 className="text-2xl md:text-2xl text-white font-semibold mb-2">
              {t('hero.commandNote')}
            </h2>
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
    </div>
  );
}