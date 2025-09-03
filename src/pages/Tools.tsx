import { faCheckCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Download, ExternalLink, Server, Monitor, Gamepad2, Eye, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { getScriptVersion } from '../utils/version';

const tools = [
  {
    id: 'sunshine-aio',
    translationKey: 'sunshine',
    github: 'https://github.com/LeGeRyChEeSe/Sunshine-AIO',
    recommended: true,
    type: 'server',
    size: 'large',
    iconUrl: '/sunshine-aio-logo.png',
    fallbackIcon: Server,
  },
  {
    id: 'moonlight',
    translationKey: 'moonlight',
    website: 'https://moonlight-stream.org',
    recommended: true,
    type: 'client',
    size: 'large',
    iconUrl: '/icons/moonlight.png',
    fallbackIcon: Play,
  },
  {
    id: 'sunshine',
    translationKey: 'sunshine_base',
    github: 'https://github.com/LizardByte/Sunshine',
    downloadUrl:
      'https://github.com/LizardByte/Sunshine/releases/latest/download/sunshine-windows-installer.exe',
    iconUrl: '/icons/sunshine.png',
    fallbackIcon: Server,
  },
  {
    id: 'virtual-display',
    translationKey: 'virtual_display',
    github: 'https://github.com/VirtualDrivers/Virtual-Display-Driver',
    downloadUrl: 'https://github.com/VirtualDrivers/Virtual-Display-Driver/releases/latest',
    iconUrl: '/icons/vdd.png',
    fallbackIcon: Monitor,
  },
  {
    id: 'playnite',
    translationKey: 'playnite',
    github: 'https://github.com/JosefNemec/Playnite',
    downloadUrl:
      'https://github.com/JosefNemec/Playnite/releases/latest/download/Playnite.exe',
    iconUrl: '/icons/playnite.png',
    fallbackIcon: Gamepad2,
  },
  {
    id: 'playnite-watcher',
    translationKey: 'playnite_watcher',
    github: 'https://github.com/Nonary/PlayNiteWatcher',
    downloadUrl:
      'https://github.com/Nonary/PlayNiteWatcher/releases/latest/download/PlayNiteWatcher.zip',
    iconUrl: '/icons/playnite-watcher.png',
    fallbackIcon: Eye,
  },
];

// Composant pour afficher les icônes avec fallback
const ToolIcon = ({ tool, className }: { tool: typeof tools[0], className: string }) => {
  const [imageError, setImageError] = useState(false);

  if (tool.iconUrl && !imageError) {
    return (
      <img
        src={tool.iconUrl}
        alt={`${tool.translationKey} icon`}
        className={`${className} rounded-full`}
        onError={() => setImageError(true)}
      />
    );
  } else if (tool.fallbackIcon) {
    const FallbackIcon = tool.fallbackIcon;
    return <FallbackIcon className={className} />;
  }
  return null;
};

export default function Tools() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [scriptVersion, setScriptVersion] = useState<string>('');
  const scriptUrl = 'https://sunshine-aio.com/script.ps1';

  useEffect(() => {
    getScriptVersion().then(setScriptVersion);
  }, []);

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('tools.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('tools.subtitle')}
          </p>
        </div>

        <div className="md:space-y-6 space-y-8 ">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`p-8 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 ${tool.recommended
                ? tool.type === 'server'
                  ? 'bg-gradient-to-r from-sunshine-violet to-sunshine-blue text-white'
                  : 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 dark:from-blue-600/90 dark:to-blue-700/90 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm'
                } ${tool.size === 'large' ? 'border-2 border-sunshine-violet/20' : ''}`}
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between overflow-hidden">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ToolIcon 
                      tool={tool}
                      className={`h-6 w-6 ${
                        tool.recommended
                          ? 'text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    />
                    <h2
                      className={`text-xl font-semibold ${
                        tool.recommended
                          ? 'text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {t(`tools.${tool.translationKey}.name`)}
                    </h2>
                    {tool.recommended && (
                      <span className="px-2 py-1 text-gray-900 dark:text-white text-sm bg-white/20 rounded-full">
                        {t('tools.recommended')}
                      </span>
                    )}
                    {tool.type && (
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${tool.type === 'server'
                          ? 'bg-violet-800/30 border border-violet-400/30 text-gray-900 dark:text-white'
                          : 'bg-blue-800/30 border border-blue-400/30 text-gray-900 dark:text-white'
                          }`}
                      >
                        {t(
                          tool.type === 'server'
                            ? 'tools.serverInstall'
                            : 'tools.clientInstall'
                        )}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 ${tool.recommended
                      ? 'text-gray-900 dark:text-white/90'
                      : 'text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {t(`tools.${tool.translationKey}.description`)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {tool.github && (
                      <a
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center ${tool.recommended
                          ? 'text-white/90 hover:text-white'
                          : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                          }`}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {t('tools.viewGithub')}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center">
                  {tool.website ? (
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      {t('tools.visitWebsite')}
                    </a>
                  ) : tool.id === 'sunshine-aio' ? (
                    <div className="text-center flex flex-col items-center justify-center w-full max-w-lg">
                      <div className="mb-4 text-white">
                        <h3 className="text-lg font-semibold mb-2 text-center">
                          {t('hero.commandNote')}
                        </h3>
                      </div>

                      <div className="p-6 shadow-xl w-full max-w-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 dark:from-gray-900/90 dark:to-gray-800/90 rounded-2xl border border-gray-700/50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <pre className="text-sm leading-relaxed flex-1 text-center overflow-hidden">
                            <code className="block break-words hyphens-auto max-w-full whitespace-pre-wrap">
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
                        {scriptVersion && (
                          <div className="mt-3 text-center">
                            <span className="text-gray-400 text-xs">
                              Script v{scriptVersion}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    tool.downloadUrl && (
                      <a
                        href={tool.downloadUrl}
                        className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-sunshine-violet to-sunshine-blue hover:from-sunshine-violet/80 hover:to-sunshine-blue/80 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        {t('tools.download')}
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
