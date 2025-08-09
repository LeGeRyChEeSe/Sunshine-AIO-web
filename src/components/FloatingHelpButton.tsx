import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function FloatingHelpButton() {
  const { t } = useTranslation();

  return (
    <Link
      to="/contact"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-sunshine-violet to-sunshine-blue shadow-xl transition-all duration-200 hover:scale-110 hover:shadow-2xl animate-pulse hover:animate-none"
      aria-label={t('contact.helpButton')}
    >
      <HelpCircle className="h-6 w-6 text-white" />
    </Link>
  );
}