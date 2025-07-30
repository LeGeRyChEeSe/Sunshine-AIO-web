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
          </div>
        </div>

        <div className="text-center">
          <div className="mt-16 mb-6 text-4xl md:text-6xl font-bold text-white">
            <h2 className="text-2xl md:text-2xl text-white font-semibold mb-2">
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
    </div>
  );
}