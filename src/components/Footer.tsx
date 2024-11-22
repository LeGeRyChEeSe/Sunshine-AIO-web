import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-sunshine">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white mb-4 md:mb-0">{t('footer.copyright')}</p>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/LeGeRyChEeSe/Sunshine-AIO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
