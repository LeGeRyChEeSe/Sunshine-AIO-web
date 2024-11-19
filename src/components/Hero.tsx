import React from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

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
              href="https://github.com/LeGeRyChEeSe/Sunshine-AIO/releases/latest/download/Sunshine-AIO.exe"
              className="inline-flex items-center px-8 py-3 bg-white text-sunshine-purple rounded-full font-semibold hover:bg-blue-50 transition shadow-lg"
            >
              <Download className="mr-2 h-5 w-5" />
              {t('hero.downloadButton')}
            </a>
            <a
              href="/guide"
              className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition"
            >
              {t('hero.guideButton')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </div>
  );
}