import React from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-sunshine backdrop-blur-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Sun className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Sunshine-AIO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-primary-100 transition"
            >
              {t('header.home')}
            </Link>
            <Link
              to="/tools"
              className="text-white hover:text-primary-100 transition"
            >
              {t('header.tools')}
            </Link>
            <Link
              to="/guide"
              className="text-white hover:text-primary-100 transition"
            >
              {t('header.guide')}
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-primary-100 transition"
            >
              {t('header.about')}
            </Link>
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition"
              aria-label={
                theme === 'dark'
                  ? t('header.theme.light')
                  : t('header.theme.dark')
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-6 w-6 text-white" />
              ) : (
                <Moon className="h-6 w-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link
              to="/"
              className="block text-white hover:text-primary-100 transition"
            >
              {t('header.home')}
            </Link>
            <Link
              to="/tools"
              className="block text-white hover:text-primary-100 transition"
            >
              {t('header.tools')}
            </Link>
            <Link
              to="/guide"
              className="block text-white hover:text-primary-100 transition"
            >
              {t('header.guide')}
            </Link>
            <Link
              to="/about"
              className="block text-white hover:text-primary-100 transition"
            >
              {t('header.about')}
            </Link>
            <div className="flex items-center justify-start space-x-4 flex-wrap">
              <LanguageSelector />
              <button
                onClick={toggleTheme}
                className="p-2 text-white hover:text-primary-100 transition"
              >
                {theme === 'dark'
                  ? t('header.theme.light')
                  : t('header.theme.dark')}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
