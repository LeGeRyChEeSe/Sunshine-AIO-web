import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Guide() {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('guide.steps.download.title'),
      description: t('guide.steps.download.description'),
      image: '/images/sunshine-download.png',
      downloadUrl: 'https://github.com/LeGeRyChEeSe/Sunshine-AIO/releases/latest/download/Sunshine-AIO.exe',
    },
    {
      title: t('guide.steps.run.title'),
      description: t('guide.steps.run.description'),
      image: '/images/sunshine-run.png',
    },
    {
      title: t('guide.steps.install.title'),
      description: t('guide.steps.install.description'),
      image: '/images/sunshine-install.png',
    },
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('guide.title')}
        </h1>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="md:grid md:grid-cols-2">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {step.description}
                  </p>
                  {index === 0 && (
                    <a
                      href={step.downloadUrl}
                      className="inline-flex items-center px-6 py-2 bg-gradient-sunshine text-white rounded-full font-semibold hover:opacity-90 transition"
                    >
                      {t('guide.downloadNow')}
                    </a>
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
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-sunshine rounded-xl text-white backdrop-blur-sm">
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