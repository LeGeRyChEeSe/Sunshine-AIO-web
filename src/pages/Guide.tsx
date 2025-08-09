import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ReactNode } from 'react';

export default function Guide() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const scriptUrl = 'https://sunshine-aio.com/script.ps1';

  interface Props {
    step: {
      [x: string]: ReactNode | Iterable<ReactNode>;
      id: string;
      title: string;
      description: string;
      image: string;
      downloadUrl?: string;
    };
    index: number;
  }

  const steps = [
    {
      id: 'download',
      title: t('guide.steps.download.title'),
      description: t('guide.steps.download.description'),
      note: t('guide.steps.download.note'),
      image: '/images/sunshine-download.gif',
      downloadUrl:
        'https://github.com/LeGeRyChEeSe/Sunshine-AIO',
    },
    {
      id: 'install',
      title: t('guide.steps.install.title'),
      description: t('guide.steps.install.description'),
      image: '/images/sunshine-install.png'
    },
  ];

  const StepComponent = ({ step, index }: Props) => (
    <div
      key={index}
      data-id={step.id}
      data-description={step.description}
    >
      <div className="md:grid md:grid-cols-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-sunshine">
              <span className="text-white font-semibold">{index + 1}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {step.description}
          </p>
          {(index === 0) && (
            <>
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
              <p className="text-gray-600 dark:text-gray-300 mt-4 italic">
                {step.note}
              </p>
            </>
          )}
        </div>
        <div className="h-64 md:h-auto p-4">
          <div className="w-full h-full bg-gradient-sunshine p-[2px] rounded-xl">
            <div className="w-full h-full rounded-lg overflow-hidden bg-black">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-12 bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('guide.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('guide.subtitle')}
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <StepComponent key={index} step={step} index={index} />
          ))}
        </div>

        <div className="mt-12 p-8 bg-gradient-sunshine rounded-2xl text-white backdrop-blur-sm shadow-xl">
          <h3 className="text-xl font-semibold mb-4">{t('guide.complete.title')}</h3>
          <p className="mb-4">{t('guide.complete.description')}</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{t('guide.complete.ready')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
