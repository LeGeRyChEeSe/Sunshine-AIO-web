import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function FloatingHelpButton() {
  const { t } = useTranslation();

  return (
    <Link
      to="/contact"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-sunshine shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
      aria-label={t('contact.helpButton')}
    >
      <HelpCircle className="h-6 w-6 text-white" />
    </Link>
  );
}