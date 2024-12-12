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
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition shadow-lg"
            >
              {t('hero.guideButton')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5 fas fa-arrow-right" />
            </a>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl md:text-2xl text-white font-semibold mb-2">
            {t('hero.commandNote')}
          </h2>
        </div>
        
        <div className="text-white flex justify-center">
          <div className="p-4 shadow-md max-w-lg mx-auto relative flex flex-row bg-gradient-to-br bg-gray-800/90 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl">
            <pre className="text-sm leading-relaxed overflow-auto whitespace-pre-wrap mr-4 items-center inline-flex">
              <code className="language-powershell token">
                <span className="token keyword">irm</span> <span className="token string">{scriptUrl}</span> | <span className="token operator">iex</span>
              </code>
            </pre>

            <div className="flex flex-col items-end gap-4">
              <CopyToClipboard
                text={`irm ${scriptUrl} | iex`}
                onCopy={() => setCopied(true)}
                >
                <button
                  type="button"
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition shadow-lg px-4 py-3 inline-flex items-center justify-end mr-0"
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
  );
}