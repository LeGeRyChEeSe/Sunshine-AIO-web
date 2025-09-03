import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getWebVersion, getSunshineAIOVersion } from '../utils/version';

export default function Footer() {
  const { t } = useTranslation();
  const [sunshineVersion, setSunshineVersion] = useState<string>('');
  const webVersion = getWebVersion();

  useEffect(() => {
    getSunshineAIOVersion().then(setSunshineVersion);
  }, []);

  return (
    <footer className="bg-gradient-sunshine">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <img 
              src="/sunshine-aio-logo.png" 
              alt="Sunshine-AIO Logo" 
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <p className="text-white">{t('footer.copyright')}</p>
              <div className="flex items-center space-x-3 mt-1 sm:mt-0">
                <span className="text-white/70 text-sm">Web v{webVersion}</span>
                {sunshineVersion && (
                  <span className="text-white/70 text-sm">Sunshine-AIO v{sunshineVersion}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/LeGeRyChEeSe/Sunshine-AIO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition duration-200 flex items-center space-x-2"
            >
              <Github className="h-6 w-6" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://github.com/LeGeRyChEeSe/Sunshine-AIO/wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition duration-200"
            >
              Wiki
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
